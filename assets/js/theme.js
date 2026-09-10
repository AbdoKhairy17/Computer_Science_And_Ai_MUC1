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
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update meta theme-color
        const metaColor = document.querySelector('meta[name="theme-color"]');
        if (metaColor) {
            metaColor.setAttribute('content', theme === 'dark' ? '#09080E' : '#F4F6FB');
        }

        // Update Theme Button Icon
        const themeIcon = document.getElementById('theme-toggle-icon');
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fa-solid fa-sun';
            } else {
                themeIcon.className = 'fa-solid fa-moon';
            }
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
