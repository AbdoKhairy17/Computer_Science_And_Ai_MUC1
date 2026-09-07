import json
import os
import urllib.parse
import urllib.request
from html import escape
from http.server import BaseHTTPRequestHandler


# ============================================================
# CONFIGURATION
# ============================================================

# Set these in Vercel Environment Variables.
#
# TELEGRAM_BOT_TOKEN = your NEW token from @BotFather
# WEB_APP_URL = https://codeartifact-2-ten.vercel.app/
#
# NEVER put the bot token directly in this file.

TOKEN = os.environ.get("8995756244:AAGDtW8CoTuxxAK4b7Gw18x3NuORSJ2fYf0")
WEB_APP_URL = os.environ.get(
    "WEB_APP_URL",
    "https://codeartifact-2-ten.vercel.app/"
)


# ============================================================
# TELEGRAM WEBHOOK
# ============================================================

class handler(BaseHTTPRequestHandler):

    # --------------------------------------------------------
    # POST /api/webhook
    # Telegram sends updates here
    # --------------------------------------------------------

    def do_POST(self):

        try:
            # Get request body size
            content_length = int(
                self.headers.get("Content-Length", "0")
            )

            # Read request body
            post_data = self.rfile.read(content_length)

            # Convert JSON → Python dictionary
            update = json.loads(
                post_data.decode("utf-8")
            )

            print("Telegram update:")
            print(json.dumps(update, indent=2))

            # ------------------------------------------------
            # Handle normal Telegram messages
            # ------------------------------------------------

            if "message" in update:

                message = update["message"]

                chat = message.get("chat", {})
                user = message.get("from", {})

                chat_id = chat.get("id")

                user_name = user.get(
                    "first_name",
                    "User"
                )

                text = message.get(
                    "text",
                    ""
                )

                print(
                    f"Message from {user_name}: {text}"
                )

                # ------------------------------------------------
                # /start
                # ------------------------------------------------

                if text.startswith("/start"):

                    # Support:
                    # /start
                    # /start something
                    parts = text.split(
                        maxsplit=1
                    )

                    start_parameter = (
                        parts[1]
                        if len(parts) > 1
                        else None
                    )

                    self.send_telegram_message(
                        chat_id=chat_id,
                        user_name=user_name,
                        start_parameter=start_parameter
                    )

                # ------------------------------------------------
                # /help
                # ------------------------------------------------

                elif text == "/help":

                    self.send_text_message(
                        chat_id,
                        "Available commands:\n\n"
                        "/start - Open the MIU Student Portal\n"
                        "/help - Show this help message"
                    )

            # ------------------------------------------------
            # Telegram expects HTTP 200
            # ------------------------------------------------

            self.send_json_response(
                200,
                {
                    "status": "ok"
                }
            )

        except Exception as e:

            print(
                f"Webhook error: {e}"
            )

            self.send_json_response(
                500,
                {
                    "status": "error"
                }
            )

    # --------------------------------------------------------
    # GET
    # Health check
    # --------------------------------------------------------

    def do_GET(self):

        self.send_response(200)

        self.send_header(
            "Content-Type",
            "text/plain; charset=utf-8"
        )

        self.end_headers()

        self.wfile.write(
            b"Telegram Bot Webhook is running successfully."
        )

    # ========================================================
    # SEND WELCOME MESSAGE
    # ========================================================

    def send_telegram_message(
        self,
        chat_id,
        user_name,
        start_parameter=None
    ):

        if not TOKEN:

            print(
                "ERROR: TELEGRAM_BOT_TOKEN "
                "environment variable is missing."
            )

            return

        api_url = (
            "https://api.telegram.org/"
            f"bot{TOKEN}/sendMessage"
        )

        # Escape user-controlled text
        safe_name = escape(
            str(user_name)
        )

        welcome_text = (
            f"مرحباً بك <b>{safe_name}</b> 👋\n\n"
            "<b>كلية الحاسبات والذكاء الاصطناعي - "
            "جامعة مصر للمعلوماتية (MIU)</b> 🎓\n\n"
            "اضغط على الزر بالأسفل لفتح "
            "بوابة الطالب:"
        )

        # ----------------------------------------------------
        # Mini App button
        # ----------------------------------------------------

        reply_markup = {
            "inline_keyboard": [
                [
                    {
                        "text": "📱 فتح بوابة الطالب (Mini App)",
                        "web_app": {
                            "url": WEB_APP_URL
                        }
                    }
                ]
            ]
        }

        # ----------------------------------------------------
        # Optional start parameter
        # ----------------------------------------------------

        if start_parameter:

            welcome_text += (
                "\n\n"
                f"Start parameter: "
                f"<code>{escape(start_parameter)}</code>"
            )

        # ----------------------------------------------------
        # Telegram payload
        # ----------------------------------------------------

        payload = {
            "chat_id": chat_id,
            "text": welcome_text,
            "parse_mode": "HTML",
            "reply_markup": json.dumps(
                reply_markup
            )
        }

        self.call_telegram_api(
            "sendMessage",
            payload
        )

    # ========================================================
    # SEND SIMPLE TEXT MESSAGE
    # ========================================================

    def send_text_message(
        self,
        chat_id,
        text
    ):

        if not TOKEN:

            print(
                "ERROR: TELEGRAM_BOT_TOKEN "
                "environment variable is missing."
            )

            return

        payload = {
            "chat_id": chat_id,
            "text": text
        }

        self.call_telegram_api(
            "sendMessage",
            payload
        )

    # ========================================================
    # TELEGRAM API REQUEST
    # ========================================================

    def call_telegram_api(
        self,
        method,
        payload
    ):

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

                response_data = response.read()

                result = json.loads(
                    response_data.decode(
                        "utf-8"
                    )
                )

                print(
                    "Telegram API response:"
                )

                print(
                    json.dumps(
                        result,
                        indent=2
                    )
                )

                if not result.get("ok"):

                    print(
                        "Telegram API returned "
                        "an error."
                    )

                return result

        except Exception as e:

            print(
                f"Telegram API request failed: {e}"
            )

            return None

    # ========================================================
    # HTTP JSON RESPONSE
    # ========================================================

    def send_json_response(
        self,
        status_code,
        data
    ):

        self.send_response(
            status_code
        )

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.end_headers()

        self.wfile.write(
            json.dumps(
                data
            ).encode("utf-8")
        )
