# Computer Science & AI — MIU Telegram Mini App

A Telegram bot + Mini App for the Faculty of Computers & Artificial
Intelligence. `/start` sends a welcome message with a button that opens the
student portal as a Telegram Mini App.

Bot: [@Computer_Science_And_Ai_MUC1bot](https://t.me/Computer_Science_And_Ai_MUC1bot)

## Structure

```
.
├── api/
│   └── webhook.py   # Vercel Python serverless function → /api/webhook
├── index.html       # the Mini App (served at /)
└── README.md
```

There is no build step and no dependencies — `webhook.py` uses only the Python
standard library, and `index.html` is a single self-contained file.

> **`index.html` must keep that exact name.** Vercel serves the site root from
> `index.html`; renaming it makes `/` return a 404 and the Mini App button opens
> an error page.

## Environment variables

Set all three in **Vercel → Settings → Environment Variables**. Nothing is
hardcoded, and the function will not send messages without them.

| Variable | Where it comes from |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) → `/newbot` or `/revoke` |
| `WEB_APP_URL` | your Vercel deployment URL, with trailing slash |
| `TELEGRAM_SECRET_TOKEN` | you invent it — any random `A-Z a-z 0-9 _ -` string |

Generate a secret with:

```bash
python3 -c "import secrets,string; a=string.ascii_letters+string.digits+'_-'; print(''.join(secrets.choice(a) for _ in range(48)))"
```

Environment variables only apply to **new** deployments — redeploy after adding
them, or the function starts up with them empty.

## Deploy

1. Push to the branch Vercel is connected to. It auto-detects `api/*.py` as a
   Python serverless function; no `vercel.json` is needed.
2. Register the webhook **once**, using the same secret you put in the env vars:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/webhook&secret_token=<SECRET>"
   ```

   Expect `{"ok":true,"result":true,"description":"Webhook was set"}`.

3. Verify:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

   `url` must not be empty, and `pending_update_count` should drain to `0`.
   An empty `url` means Telegram has nowhere to deliver updates — the bot will
   stay silent no matter what the code does.

If `secret_token` and `TELEGRAM_SECRET_TOKEN` do not match exactly, every update
is rejected with `403` and the bot goes quiet. That is the first thing to check.

## Health checks

| URL | Expected |
| --- | --- |
| `/` | `200` — the Mini App |
| `/api/webhook` (GET) | `200 Telegram Bot Webhook is running successfully.` |
| `/api/webhook` (POST, no secret) | `403` |

## Bot commands

| Command | Behaviour |
| --- | --- |
| `/start` | Welcome message + Mini App button. Accepts a deep-link parameter (`/start ref123`). |
| `/help` | Lists available commands. |

## How the webhook works

Telegram `POST`s an update to `/api/webhook`. The handler:

1. Compares the `X-Telegram-Bot-Api-Secret-Token` header against
   `TELEGRAM_SECRET_TOKEN` using a constant-time comparison, and returns `403`
   to anyone else — the endpoint is publicly reachable, so this is what keeps
   strangers from puppeting the bot.
2. Parses the update and routes `message` / `edited_message`.
3. **Always responds `200`, even on failure.** A non-2xx tells Telegram the
   update was not delivered, and it redelivers the same update indefinitely.
   Errors are logged to the Vercel function logs instead.

## Security

- **Never commit the bot token.** Anyone holding it has full control of the bot.
  It belongs in Vercel env vars only.
- If a token is ever pasted into a commit, a screenshot, or a chat, treat it as
  burned: `/revoke` in @BotFather and issue a new one. Removing the line from
  the file is not enough — it stays in git history.
- Data from `tg.initDataUnsafe` (used to greet the user by name) is **not
  verified** and must never gate anything sensitive. To trust a user's identity
  server-side, validate the signed `initData` string against the bot token.

## Local development

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Telegram-specific APIs (`BackButton`, `HapticFeedback`, `showAlert`) are no-ops
outside the Telegram client — the code guards every call, so the page still
renders and the fallbacks (`alert`, `window.open`) take over in a plain browser.

## Notes

- The Mini App content (files, schedule, AI lab) is currently **static
  placeholder data**, not a live feed from any university system.
- The GPA calculator accumulates credit-weighted courses in memory only; state
  is lost on reload.
- Naming is inconsistent between the bot copy (`جامعة مصر للمعلوماتية`) and the
  Mini App (`جامعة مايو` / `May University in Egypt`). Pick one before release.
