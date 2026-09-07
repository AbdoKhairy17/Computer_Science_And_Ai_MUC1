import hmac
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from html import escape
from http.server import BaseHTTPRequestHandler



# ============================================================
# CONFIGURATION
# ============================================================

# One-click webhook registration.
#
# Set these in Vercel Environment Variables.
#
# TELEGRAM_BOT_TOKEN     = your NEW token from @BotFather
# WEB_APP_URL            = https://codeartifact-2-ten.vercel.app/
# TELEGRAM_SECRET_TOKEN  = any random string you also pass to
#                          setWebhook as ?secret_token=...
#
# NEVER put the bot token directly in this file.
#
# Open in a browser:
#   https://<your-app>.vercel.app/api/setup?key=<TELEGRAM_SECRET_TOKEN>
#
# Optional actions:
#   &action=register   (default) point Telegram at this deployment
#   &action=info       only show the current status, change nothing
#   &action=delete     unregister the webhook
#
# The bot token never leaves Vercel and is never shown on the page.

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
WEB_APP_URL = os.environ.get("WEB_APP_URL", "")
SECRET_TOKEN = os.environ.get("TELEGRAM_SECRET_TOKEN", "")


# ============================================================
# PAGE STYLE
# ============================================================

PAGE_CSS = """
    body {
        margin: 0;
        padding: 24px 16px;
        background: #0d1117;
        color: #f0f6fc;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        line-height: 1.6;
    }
    .wrap { max-width: 620px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .banner {
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 18px;
        font-weight: bold;
        border: 1px solid;
    }
    .ok   { background: rgba(63,185,80,.12);  border-color: #3fb950; color: #56d364; }
    .bad  { background: rgba(248,81,73,.12);  border-color: #f85149; color: #ff7b72; }
    .warn { background: rgba(210,153,34,.12); border-color: #d29922; color: #e3b341; }
    .card {
        background: rgba(22,27,34,.85);
        border: 1px solid rgba(88,166,255,.3);
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 14px;
    }
    .row { display: flex; gap: 10px; padding: 4px 0; flex-wrap: wrap; }
    .row .label { color: #8b949e; min-width: 190px; }
    .row .value { color: #f0f6fc; word-break: break-all; }
    code {
        background: #161b22;
        border: 1px solid rgba(88,166,255,.25);
        border-radius: 6px;
        padding: 2px 6px;
        font-size: 13px;
        word-break: break-all;
    }
    a { color: #58a6ff; }
    ul { padding-inline-start: 20px; margin: 8px 0 0; }
    li { margin-bottom: 6px; }
    footer { color: #8b949e; font-size: 12px; margin-top: 22px; }
"""


# ============================================================
# WEBHOOK SETUP ENDPOINT
# ============================================================

class handler(BaseHTTPRequestHandler):

    # --------------------------------------------------------
    # GET /api/setup?key=...
    # --------------------------------------------------------

    def do_GET(self):

        query = urllib.parse.parse_qs(
            urllib.parse.urlparse(self.path).query
        )

        key = query.get("key", [""])[0]
        action = query.get("action", ["register"])[0]

        # ----------------------------------------------------
        # The endpoint is public, so it must be gated.
        # Refuse to run at all rather than run unprotected.
        # ----------------------------------------------------

        if not SECRET_TOKEN:

            self.render(
                500,
                "bad",
                "TELEGRAM_SECRET_TOKEN is not set",
                "<p>Add <code>TELEGRAM_SECRET_TOKEN</code> in "
                "Vercel &rarr; Settings &rarr; Environment Variables, "
                "then redeploy. This endpoint stays disabled until "
                "it has a key to check against.</p>"
            )

            return

        if not hmac.compare_digest(key, SECRET_TOKEN):

            self.render(
                403,
                "bad",
                "Wrong or missing key",
                "<p>Open this page as "
                "<code>/api/setup?key=&lt;TELEGRAM_SECRET_TOKEN&gt;</code>, "
                "using the same value you set in Vercel.</p>"
            )

            return

        if not TOKEN:

            self.render(
                500,
                "bad",
                "TELEGRAM_BOT_TOKEN is not set",
                "<p>Add <code>TELEGRAM_BOT_TOKEN</code> in Vercel "
                "&rarr; Settings &rarr; Environment Variables, then "
                "redeploy. Environment variables only apply to new "
                "deployments.</p>"
            )

            return

        # ----------------------------------------------------
        # Work out this deployment's own webhook URL
        # ----------------------------------------------------

        webhook_url = self.build_webhook_url()

        if action == "info":
            self.show_status(webhook_url, None)

        elif action == "delete":
            result = self.call_telegram("deleteWebhook", {})
            self.show_status(webhook_url, result, deleted=True)

        else:
            result = self.call_telegram(
                "setWebhook",
                {
                    "url": webhook_url,
                    "secret_token": SECRET_TOKEN,
                    "drop_pending_updates": "false"
                }
            )
            self.show_status(webhook_url, result)

    # ========================================================
    # THIS DEPLOYMENT'S PUBLIC URL
    # ========================================================

    def build_webhook_url(self):

        host = (
            self.headers.get("x-forwarded-host")
            or self.headers.get("host")
            or ""
        )

        proto = self.headers.get(
            "x-forwarded-proto",
            "https"
        )

        return f"{proto}://{host}/api/webhook"

    # ========================================================
    # RENDER THE RESULT PAGE
    # ========================================================

    def show_status(self, webhook_url, result, deleted=False):

        # ----------------------------------------------------
        # Did the write succeed?
        # ----------------------------------------------------

        if result is None:
            tone, title = "warn", "Current status"

        elif result.get("ok"):
            tone = "ok"
            title = (
                "Webhook removed"
                if deleted
                else "Webhook registered — your bot is live"
            )

        else:
            tone = "bad"
            title = "Telegram rejected the request"

        body = ""

        if result is not None and not result.get("ok"):

            body += (
                "<div class='card'><div class='row'>"
                "<span class='label'>Telegram said</span>"
                f"<span class='value'>{escape(str(result.get('description', 'unknown error')))}</span>"
                "</div></div>"
            )

        # ----------------------------------------------------
        # Live state straight from Telegram
        # ----------------------------------------------------

        info = self.call_telegram("getWebhookInfo", {})

        if info and info.get("ok"):

            data = info.get("result", {})

            registered = data.get("url", "")

            rows = [
                ("Registered URL", registered or "(none)"),
                ("Pending updates", str(data.get("pending_update_count", 0))),
            ]

            if data.get("last_error_message"):
                rows.append(
                    ("Last error", data["last_error_message"])
                )

            body += "<div class='card'>"

            for label, value in rows:
                body += (
                    "<div class='row'>"
                    f"<span class='label'>{escape(label)}</span>"
                    f"<span class='value'>{escape(value)}</span>"
                    "</div>"
                )

            body += "</div>"

            # Registered somewhere other than this deployment
            if registered and registered != webhook_url and not deleted:
                body += (
                    "<div class='banner warn'>Telegram is delivering to a "
                    "different URL than this deployment. Reload this page "
                    "to re-register.</div>"
                )

        # ----------------------------------------------------
        # Catch the Mini App button misconfiguration
        # ----------------------------------------------------

        expected_root = webhook_url.replace("/api/webhook", "/")

        if not WEB_APP_URL:
            body += (
                "<div class='banner warn'>WEB_APP_URL is not set, so "
                "<code>/start</code> will send the welcome message without "
                "the Mini App button.</div>"
            )

        elif WEB_APP_URL.rstrip("/") != expected_root.rstrip("/"):
            body += (
                "<div class='banner warn'>WEB_APP_URL is "
                f"<code>{escape(WEB_APP_URL)}</code> but this deployment is "
                f"<code>{escape(expected_root)}</code>. The Mini App button "
                "will open the other address.</div>"
            )

        # ----------------------------------------------------
        # What to do next
        # ----------------------------------------------------

        if tone == "ok" and not deleted:
            body += (
                "<div class='card'><b>Next:</b><ul>"
                "<li>Open your bot in Telegram and send <code>/start</code>.</li>"
                "<li>You only need this page again if the domain changes "
                "or you revoke the token.</li>"
                "</ul></div>"
            )

        self.render(200, tone, title, body)

    # ========================================================
    # TELEGRAM API REQUEST
    # ========================================================

    def call_telegram(self, method, payload):

        api_url = (
            "https://api.telegram.org/"
            f"bot{TOKEN}/{method}"
        )

        data = urllib.parse.urlencode(
            payload
        ).encode("utf-8")

        request = urllib.request.Request(
            api_url,
            data=data,
            method="POST"
        )

        try:

            with urllib.request.urlopen(
                request,
                timeout=10
            ) as response:

                return json.loads(
                    response.read().decode("utf-8")
                )

        except urllib.error.HTTPError as e:

            # Telegram puts a useful description in the error body
            try:
                return json.loads(
                    e.read().decode("utf-8")
                )
            except Exception:
                return {
                    "ok": False,
                    "description": f"HTTP {e.code}"
                }

        except Exception as e:

            print(
                f"Telegram API request failed: {e}"
            )

            return {
                "ok": False,
                "description": str(e)
            }

    # ========================================================
    # HTML RESPONSE
    # ========================================================

    def render(self, status_code, tone, title, body_html):

        page = (
            "<!DOCTYPE html><html lang='en'><head>"
            "<meta charset='utf-8'>"
            "<meta name='viewport' content='width=device-width, initial-scale=1'>"
            "<title>Webhook Setup</title>"
            f"<style>{PAGE_CSS}</style>"
            "</head><body><div class='wrap'>"
            "<h1>Telegram Webhook Setup</h1>"
            f"<div class='banner {tone}'>{escape(title)}</div>"
            f"{body_html}"
            "<footer>This page never displays the bot token. "
            "Actions: <code>?action=info</code> to check without changing, "
            "<code>?action=delete</code> to unregister.</footer>"
            "</div></body></html>"
        )

        encoded = page.encode("utf-8")

        self.send_response(status_code)

        self.send_header(
            "Content-Type",
            "text/html; charset=utf-8"
        )

        self.send_header(
            "Cache-Control",
            "no-store"
        )

        self.send_header(
            "Content-Length",
            str(len(encoded))
        )

        self.end_headers()

        self.wfile.write(encoded)
