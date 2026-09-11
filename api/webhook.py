import hmac
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
# TELEGRAM_BOT_TOKEN     = your NEW token from @BotFather
# WEB_APP_URL            = https://<your-app>.vercel.app/   (بشرطة مائلة في النهاية)
# TELEGRAM_SECRET_TOKEN  = any random string you also pass to
#                          setWebhook as ?secret_token=...
#
# NEVER put the bot token directly in this file.

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
WEB_APP_URL = os.environ.get("WEB_APP_URL", "")
SECRET_TOKEN = os.environ.get("TELEGRAM_SECRET_TOKEN", "")


# ============================================================
# TELEGRAM WEBHOOK
# ============================================================

# تيليجرام يعيد إرسال التحديث نفسه إن تأخّر الرد أو انقطع الاتصال،
# فيصل نداء sendMessage مرتين ويستقبل الطالب رسالتين.
#
# حدود هذه الطريقة صريحة: الذاكرة تعيش داخل نسخة الدالة الدافئة فقط،
# فإن أعاد تيليجرام الإرسال إلى نسخة جديدة (بدء بارد) لن يُلتقط التكرار.
# المعالجة الكاملة تحتاج تخزيناً خارجياً (Vercel KV مثلاً)؛ هذه تغطّي
# الحالة الشائعة بلا أي اعتماد إضافي.
_SEEN_UPDATES = []
_SEEN_LIMIT = 256


class handler(BaseHTTPRequestHandler):

    # --------------------------------------------------------
    # هل رأينا هذا التحديث في هذه النسخة من قبل؟
    # --------------------------------------------------------

    def is_duplicate(self, update_id):

        if update_id is None:
            return False

        if update_id in _SEEN_UPDATES:
            return True

        _SEEN_UPDATES.append(update_id)

        # سقف ثابت للذاكرة: نتخلّص من الأقدم
        if len(_SEEN_UPDATES) > _SEEN_LIMIT:
            del _SEEN_UPDATES[:-_SEEN_LIMIT]

        return False

    # --------------------------------------------------------
    # POST /api/webhook
    # Telegram sends updates here
    # --------------------------------------------------------

    def do_POST(self):

        # ----------------------------------------------------
        # Reject anyone who is not Telegram
        # ----------------------------------------------------

        if not self.is_from_telegram():

            print(
                "Rejected request: bad or missing "
                "X-Telegram-Bot-Api-Secret-Token header."
            )

            self.send_json_response(
                403,
                {
                    "status": "forbidden"
                }
            )

            return

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

            # لا نطبع جسم التحديث كاملاً: يحتوي نصوص الرسائل وأسماء
            # المستخدمين ومعرّفاتهم، وتنتهي كلها في سجلّات Vercel.
            print(
                "Update %s (%s)" % (
                    update.get("update_id"),
                    ", ".join(
                        k for k in update.keys()
                        if k != "update_id"
                    ) or "empty"
                )
            )

            # لا نستعمل return هنا: الخروج المبكر يتخطّى رد 200 في نهاية
            # الدالة، فيعتبر تيليجرام التسليم فاشلاً ويعيد المحاولة بلا
            # نهاية — وهو بالضبط ما يفترض أن يمنعه منعُ التكرار.
            if self.is_duplicate(update.get("update_id")):
                print("Duplicate update, skipping.")
            else:
                self.handle_update(update)

        except Exception as e:

            # Always answer 200, otherwise Telegram retries
            # this same update forever.
            print(
                f"Webhook error: {e}"
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
    # VERIFY THE CALLER IS TELEGRAM
    # ========================================================

    def is_from_telegram(self):

        if not SECRET_TOKEN:

            # لا سرّ مضبوط = لا وسيلة للتحقق.
            # كان هذا يُرجع True فيقبل أي طلب: نقطة النهاية عامة على
            # الإنترنت، فمن يعرف الرابط يستطيع إرسال تحديثات مزوّرة
            # ويجعل البوت يراسل أي محادثة. الإغلاق هو السلوك الصحيح،
            # وهو ما يفعله /api/setup أصلاً في الحالة نفسها.
            print(
                "ERROR: TELEGRAM_SECRET_TOKEN is not set. "
                "Refusing every update until it is configured."
            )

            return False

        received = self.headers.get(
            "X-Telegram-Bot-Api-Secret-Token",
            ""
        )

        return hmac.compare_digest(
            received,
            SECRET_TOKEN
        )

    # ========================================================
    # ROUTE ONE UPDATE
    # ========================================================

    def handle_update(self, update):

        # ------------------------------------------------
        # Handle normal Telegram messages
        # ------------------------------------------------

        message = (
            update.get("message")
            or update.get("edited_message")
        )

        if not message:
            return

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
                "/start - Open the MUC Student Portal\n"
                "/help - Show this help message"
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

        # Escape user-controlled text
        safe_name = escape(
            str(user_name)
        )

        welcome_text = (
            f"مرحباً بك <b>{safe_name}</b> 👋\n\n"
            "<b>كلية الحاسبات والذكاء الاصطناعي - "
            "جامعة مايو بالقاهرة (MUC)</b> 🎓\n\n"
            "اضغط على الزر بالأسفل لفتح "
            "بوابة الطالب:"
        )

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
            "parse_mode": "HTML"
        }

        # ----------------------------------------------------
        # Mini App button
        #
        # Telegram rejects a web_app button without a valid
        # https URL, so only attach it when WEB_APP_URL is set.
        # ----------------------------------------------------

        if WEB_APP_URL:

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

            payload["reply_markup"] = json.dumps(
                reply_markup
            )

        else:

            print(
                "ERROR: WEB_APP_URL environment variable "
                "is missing, sending message without the "
                "Mini App button."
            )

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

        if not TOKEN:

            print(
                "ERROR: TELEGRAM_BOT_TOKEN "
                "environment variable is missing."
            )

            return None

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
