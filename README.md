# Computer Science & AI — MUC Student Portal

A Telegram bot plus a web student portal for the Faculty of Computers &
Artificial Intelligence. `/start` sends a welcome message with a button that
opens the portal **in the browser**, outside Telegram.

### Why a `url` button and not a `web_app` button

A `web_app` button opens the page inside Telegram's own Mini App container.
A plain `url` button opens it as an ordinary link, which is what this bot uses.

One limit cannot be controlled from the server: Telegram's **In-App Browser**
setting may still open the link inside Telegram's built-in browser rather than
the system browser. The Bot API offers no flag to force it out. What the `url`
button does guarantee is that the page is no longer a Mini App, and that the
user gets an "Open in browser" option.

The page still runs correctly inside Telegram if it is ever opened that way —
`telegram.js` detects the context and falls back cleanly in a plain browser.

Bot: [@Computer_Science_And_Ai_MUC1bot](https://t.me/Computer_Science_And_Ai_MUC1bot)

## Structure

```
.
├── api/
│   ├── webhook.py   # Vercel Python serverless function → /api/webhook
│   └── setup.py     # one-click webhook registration → /api/setup
├── index.html       # the portal (served at /)
└── README.md
```

There is no build step and no dependencies — `webhook.py` uses only the Python
standard library, and `index.html` is a single self-contained file.

> **`index.html` must keep that exact name.** Vercel serves the site root from
> `index.html`; renaming it makes `/` return a 404 and the portal button opens
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
2. Register the webhook **once** by opening this in a browser:

   ```
   https://<your-app>.vercel.app/api/setup?key=<TELEGRAM_SECRET_TOKEN>
   ```

Telegram does not know your server's address until you tell it. A bot receives
messages either by long polling — a process running 24/7, which serverless
cannot do — or by webhook, where Telegram POSTs to a URL you registered. That
registration lives on Telegram's servers, not in your code, which is why
deploying cannot do it for you.

`/api/setup` does the registration from inside Vercel, so the bot token never
leaves the server and never lands in your shell history. It reads the target URL
from the incoming request, so it always points Telegram at the deployment you
opened it on. It is gated by `TELEGRAM_SECRET_TOKEN` and refuses to run if that
variable is unset.

| Query | Effect |
| --- | --- |
| `?key=<SECRET>` | register this deployment as the webhook |
| `?key=<SECRET>&action=info` | show current status, change nothing |
| `?key=<SECRET>&action=delete` | unregister the webhook |

The page also warns when `WEB_APP_URL` does not match the deployment it is
running on — the mistake that leaves `/start` working while the portal button
opens a dead address.

You only need this again if the domain changes or you revoke the token.

### Doing it by hand instead

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/webhook&secret_token=<SECRET>"
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

`url` must not be empty, and `pending_update_count` should drain to `0`. An
empty `url` means Telegram has nowhere to deliver updates — the bot stays silent
no matter what the code does. If `secret_token` and `TELEGRAM_SECRET_TOKEN` do
not match exactly, every update is rejected with `403`.

## Health checks

| URL | Expected |
| --- | --- |
| `/` | `200` — the portal |
| `/api/webhook` (GET) | `200 Telegram Bot Webhook is running successfully.` |
| `/api/webhook` (POST, no secret) | `403` |
| `/api/setup` (no key) | `403` |
| `/api/setup?key=<SECRET>&action=info` | `200` — live webhook status |

## Bot commands

| Command | Behaviour |
| --- | --- |
| `/start` | Welcome message + a button that opens the portal in the browser. |
| `/start <tab>` | Opens the portal directly on that tab. |
| `/help` | Lists available commands. |

### Deep links

`/start <tab>` opens the portal on a specific screen. Valid values:

`home` · `gpa` · `schedule` · `library` · `ai` · `exams`

The tab is checked against that allow-list **twice** — once in `webhook.py`
before it is appended to the URL, and again in `telegram.js` before routing.
Anything else is ignored and the portal opens on the home tab.

The value travels differently depending on how the page was opened:

| Opened as | Carried by |
| --- | --- |
| Browser link (the `url` button) | `?tab=<name>` query string |
| Mini App, if opened that way | `initDataUnsafe.start_param` |

`telegram.js` reads the Mini App parameter first and falls back to the query
string, so one code path serves both.

## How the webhook works

Telegram `POST`s an update to `/api/webhook`. The handler:

1. Compares the `X-Telegram-Bot-Api-Secret-Token` header against
   `TELEGRAM_SECRET_TOKEN` using a constant-time comparison, and returns `403`
   to anyone else — the endpoint is publicly reachable, so this is what keeps
   strangers from puppeting the bot.

   **If `TELEGRAM_SECRET_TOKEN` is unset, every update is refused.** There is no
   way to verify the caller without it, and the endpoint is on the public
   internet, so failing closed is the only safe default.
2. Parses the update and routes `message` / `edited_message`.
3. Skips updates whose `update_id` it has already handled. Telegram redelivers
   on timeout, which would otherwise send the welcome message twice. The seen-list
   lives in the warm function instance only — a redelivery that lands on a cold
   start is not caught. Full coverage needs external storage (e.g. Vercel KV).

4. **Always responds `200`, even on failure.** A non-2xx tells Telegram the
   update was not delivered, and it redelivers the same update indefinitely.
   Errors are logged to the Vercel function logs instead. Every path through
   `do_POST` sends a response for this reason — including the duplicate-skip path.

5. Logs the `update_id` and update type only. The full update body contains
   message text, display names and user IDs; those do not belong in deployment
   logs.

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

- The portal content (files, schedule, AI lab) is currently **static
  placeholder data**, not a live feed from any university system.
- The GPA calculator accumulates credit-weighted courses in memory only; state
  is lost on reload.
- Naming is now consistent across the bot and the portal:
  `جامعة مايو بالقاهرة` / `May University in Cairo` (MUC).
- The UI uses FontAwesome as an icon font (~252 KB: 102 KB CSS + 150 KB WOFF2)
  for 34 icons. Inlining those as SVG would cut it to roughly 10–15 KB, which
  matters on mobile data. Not done yet.
