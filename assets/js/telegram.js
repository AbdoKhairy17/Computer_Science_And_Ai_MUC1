/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * TELEGRAM MINI APP INTEGRATION (telegram.js)
 *
 * يعمل فقط عندما تُفتح الصفحة كـ Mini App داخل تيليجرام.
 * خارج تيليجرام (متصفح عادي) لا يفعل شيئاً ولا يكسر الصفحة.
 */

const tg = (window.Telegram && window.Telegram.WebApp) || {};

/**
 * واجهة تيليجرام ترمي استثناءً عند استدعاء دالة أحدث من نسخة العميل
 * (WebAppMethodUnsupported)، لذا لا يكفي التحقق من وجود الدالة.
 * أي نداء غير محمي يوقف بقية السكربت بالكامل.
 */
function tgSafe(action, fallback) {
    try {
        return action();
    } catch (e) {
        if (typeof fallback === 'function') return fallback();
    }
}

/** هل نحن فعلاً داخل تيليجرام؟ خارجه تكون platform = 'unknown' */
function isInsideTelegram() {
    return Boolean(tg.platform && tg.platform !== 'unknown');
}

/** الجوال فقط يدعم ملء الشاشة الحقيقي؛ سطح المكتب يتجاهله */
function isMobileTelegram() {
    return ['android', 'ios'].indexOf(tg.platform) !== -1;
}

/**
 * تحويل مقاسات تيليجرام الآمنة إلى متغيرات CSS.
 * في وضع ملء الشاشة يمتد المحتوى تحت شريط الحالة وزر الإغلاق،
 * فنحتاج هذه المسافات كي لا يختفي الشريط العلوي تحتهما.
 */
function syncSafeAreas() {
    const root = document.documentElement;
    const inset = tg.contentSafeAreaInset || {};
    const device = tg.safeAreaInset || {};

    const top = Math.max(inset.top || 0, device.top || 0);
    const bottom = Math.max(inset.bottom || 0, device.bottom || 0);

    root.style.setProperty('--tg-safe-top', top + 'px');
    root.style.setProperty('--tg-safe-bottom', bottom + 'px');
}

function markFullscreen(isFullscreen) {
    document.documentElement.classList.toggle('tg-fullscreen', Boolean(isFullscreen));
    syncSafeAreas();
}

function initTelegram() {
    if (!isInsideTelegram()) return;

    document.documentElement.classList.add('tg-miniapp');

    tgSafe(function () { tg.ready(); });
    tgSafe(function () { tg.expand(); });

    // منع إغلاق التطبيق بالسحب لأسفل أثناء تصفح المحتوى (Bot API 7.7)
    tgSafe(function () { tg.disableVerticalSwipes(); });

    // ملء الشاشة الحقيقي (Bot API 8.0) - الجوال فقط
    if (isMobileTelegram()) {
        tgSafe(function () { tg.requestFullscreen(); });
    }

    // لون شريط تيليجرام يطابق خلفية التطبيق
    tgSafe(function () {
        const shell = getComputedStyle(document.documentElement)
            .getPropertyValue('--bg-primary').trim() || '#09080E';
        tg.setHeaderColor(shell);
        tg.setBackgroundColor(shell);
    });

    markFullscreen(tg.isFullscreen);

    // تيليجرام يبلّغنا عند تغيّر الحالة أو المقاسات الآمنة
    tgSafe(function () {
        tg.onEvent('fullscreenChanged', function () { markFullscreen(tg.isFullscreen); });
    });
    tgSafe(function () {
        tg.onEvent('fullscreenFailed', function () { markFullscreen(false); });
    });
    tgSafe(function () { tg.onEvent('safeAreaChanged', syncSafeAreas); });
    tgSafe(function () { tg.onEvent('contentSafeAreaChanged', syncSafeAreas); });
    tgSafe(function () { tg.onEvent('viewportChanged', syncSafeAreas); });

    // اسم الطالب من حساب تيليجرام (للعرض فقط - التوقيع غير موثّق هنا)
    tgSafe(function () {
        const first = tg.initDataUnsafe.user.first_name;
        if (!first) return;
        document.querySelectorAll('[data-tg-user-name]').forEach(function (el) {
            el.textContent = first;
        });
    });
}

document.addEventListener('DOMContentLoaded', initTelegram);
