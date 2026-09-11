/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * THEME CONTROLLER (theme.js)
 * Supports Dark Mode (Default) & Light Mode with Persistence
 */

(function () {
    const STORAGE_KEY = 'muc_theme';

    function getPreferredTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        // "الورق" هو الوضع الأساسي: لا نتحول للداكن إلا بطلب صريح من النظام
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update meta theme-color
        const metaColor = document.querySelector('meta[name="theme-color"]');
        if (metaColor) {
            metaColor.setAttribute('content', theme === 'dark' ? '#12100E' : '#FBFAF7');
        }

        // الأيقونة تعرض الوضع الذي سينتقل إليه الضغط
        const themeIcon = document.getElementById('theme-toggle-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }

        // إشعار للمستمعين (شريط تيليجرام يتبع لون الخلفية)
        window.dispatchEvent(new CustomEvent('muc:themechange', { detail: { theme: theme } }));

        // الحالة تُعلن صراحةً بدل أن يُستنتج من شكل الأيقونة
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
            themeBtn.setAttribute('aria-label',
                theme === 'dark' ? 'التبديل إلى الوضع الفاتح | Switch to light mode'
                                 : 'التبديل إلى الوضع الداكن | Switch to dark mode');
        }
    }

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    };

    // Apply immediately to prevent flash
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(initialTheme);
    });
})();
