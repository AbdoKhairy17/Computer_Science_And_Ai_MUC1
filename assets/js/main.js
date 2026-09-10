/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * MAIN CONTROLLER & APPLICATION LOGIC (main.js)
 */

const SIDEBAR_STORAGE_KEY = 'muc_sidebar_collapsed';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileDrawer();
    initStudentIdModal();
    initScheduleTabs();
    initLibraryFilters();
    initAiLabAssistant();
    startCountdownTimer();
});

/* ==========================================================================
   1. NAVIGATION & TAB SWITCHING
   ========================================================================== */
function initNavigation() {
    // Tab buttons in sidebar & dock
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Sidebar collapse toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {

        // اتجاه السهم صار عبر CSS، فلا نلمس className هنا
        const applyCollapsed = (isCollapsed) => {
            sidebar.classList.toggle('collapsed', isCollapsed);
            toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
            toggleBtn.title = isCollapsed
                ? 'توسيع القائمة الجانبية | Expand sidebar'
                : 'طي القائمة الجانبية | Collapse sidebar';
        };

        // استعادة آخر وضع اختاره المستخدم
        let stored = null;
        try {
            stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        } catch (e) {
            /* التخزين محجوب - نكمل بالوضع الافتراضي */
        }
        applyCollapsed(stored === '1');

        toggleBtn.addEventListener('click', () => {
            const isCollapsed = !sidebar.classList.contains('collapsed');
            applyCollapsed(isCollapsed);
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, isCollapsed ? '1' : '0');
            } catch (e) {
                /* التخزين محجوب - الوضع يبقى لهذه الجلسة فقط */
            }
        });
    }
}

function switchTab(tabId) {
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 2. Show target tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. Update active state in Sidebar
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. Update active state in Mobile Dock
    document.querySelectorAll('#mobile-dock .dock-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 5. Close mobile drawer if open
    closeMobileDrawer();
}

/* ==========================================================================
   2. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('drawer-backdrop');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', openMobileDrawer);
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileDrawer);
    }
}

function openMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
}

function closeMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
}

/* ==========================================================================
   3. DIGITAL STUDENT ID CARD (3D FLIP MODAL)
   ========================================================================== */
function initStudentIdModal() {
    const modal = document.getElementById('student-card-modal');
    const flipContainer = document.getElementById('id-card-flip');

    if (flipContainer) {
        flipContainer.addEventListener('click', () => {
            const inner = document.getElementById('id-card-inner');
            if (inner) {
                inner.classList.toggle('flipped');
            }
        });
    }

    // Close on backdrop click outside card
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStudentCardModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStudentCardModal();
        }
    });
}

function openStudentCardModal() {
    const modal = document.getElementById('student-card-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeStudentCardModal() {
    const modal = document.getElementById('student-card-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset card flip to front side
        const inner = document.getElementById('id-card-inner');
        if (inner) inner.classList.remove('flipped');
    }
}

/* ==========================================================================
   4. SCHEDULE DAY FILTERING
   ========================================================================== */
function initScheduleTabs() {
    const dayButtons = document.querySelectorAll('.day-tab-btn');
    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedDay = btn.getAttribute('data-day');
            filterScheduleByDay(selectedDay);
        });
    });
}

function filterScheduleByDay(day) {
    const items = document.querySelectorAll('.schedule-item-card');
    items.forEach(item => {
        const itemDay = item.getAttribute('data-day');
        if (day === 'all' || itemDay === day) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

/* ==========================================================================
   5. DIGITAL LIBRARY SEARCH & FILTER
   ========================================================================== */
function initLibraryFilters() {
    const searchInput = document.getElementById('library-search-input');
    const levelSelect = document.getElementById('library-level-select');

    if (searchInput) {
        searchInput.addEventListener('input', applyLibraryFilters);
    }
    if (levelSelect) {
        levelSelect.addEventListener('change', applyLibraryFilters);
    }
}

function applyLibraryFilters() {
    const query = (document.getElementById('library-search-input')?.value || '').toLowerCase().trim();
    const level = document.getElementById('library-level-select')?.value || 'all';

    const cards = document.querySelectorAll('.resource-card');
    cards.forEach(card => {
        const title = (card.querySelector('.resource-title')?.textContent || '').toLowerCase();
        const meta = (card.querySelector('.resource-meta')?.textContent || '').toLowerCase();
        const cardLevel = card.getAttribute('data-level') || 'all';

        const matchesQuery = !query || title.includes(query) || meta.includes(query);
        const matchesLevel = (level === 'all') || (cardLevel === level);

        if (matchesQuery && matchesLevel) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function triggerDownload(fileName) {
    const isEn = document.documentElement.getAttribute('lang') === 'en';
    const message = isEn ? `Downloading: ${fileName}...` : `جاري تحميل: ${fileName}...`;
    showNotification(message);
}

/* ==========================================================================
   6. AI LAB CODE ASSISTANT
   ========================================================================== */
function initAiLabAssistant() {
    const analyzeBtn = document.getElementById('btn-ai-analyze');
    const chips = document.querySelectorAll('.ai-prompt-chip');
    const editor = document.getElementById('ai-code-editor');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (editor) {
                editor.value = chip.getAttribute('data-prompt') || chip.textContent;
                editor.focus();
            }
        });
    });

    if (analyzeBtn && editor) {
        analyzeBtn.addEventListener('click', () => {
            const query = editor.value.trim();
            if (!query) {
                const isEn = document.documentElement.getAttribute('lang') === 'en';
                alert(isEn ? "Please enter some code or a question." : "يرجى كتابة كود أو سؤال في المربع.");
                return;
            }

            const output = document.getElementById('ai-output-box');
            if (output) {
                output.style.display = 'block';
                const isEn = document.documentElement.getAttribute('lang') === 'en';
                output.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${isEn ? "AI is analyzing your code and drafting insights..." : "جاري تحليل الكود وصياغة الملاحظات والحل بواسطة الذكاء الاصطناعي..."}`;

                setTimeout(() => {
                    output.innerHTML = `
                        <div style="font-weight: 700; color: var(--accent-emerald); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-circle-check"></i> ${isEn ? "Analysis Complete:" : "تم التحليل بنجاح:"}
                        </div>
                        <p style="margin-bottom: 0.5rem;">
                            ${isEn ? 
                                "1. <b>Time Complexity</b>: O(n log n) efficient recursion observed.<br>2. <b>Memory Safety</b>: Ensure pointers are deleted or wrapped with <code>std::unique_ptr</code>.<br>3. <b>Clean Code Tip</b>: Separate definition into header <code>.h</code> and source <code>.cpp</code>." : 
                                "1. <b>التعقيد الزمني (Time Complexity)</b>: تم رصد كفاءة خوارزمية بمعدل O(n log n) ممتاز.<br>2. <b>أمان الذاكرة (Memory Management)</b>: تأكد من تحرير المؤشرات الديناميكية عبر <code>delete</code> أو الاعتماد على <code>std::unique_ptr</code> لتجنب Memory Leaks.<br>3. <b>نصيحة الأسلوب النظيف</b>: يُفضل فصل توقيع الدوال في ملف Header <code>.hpp</code> وتنفيذها في <code>.cpp</code>."
                            }
                        </p>
                    `;
                }, 800);
            }
        });
    }
}

/* ==========================================================================
   7. LIVE LECTURE COUNTDOWN TIMER
   ========================================================================== */
function startCountdownTimer() {
    let secondsLeft = 24 * 60 + 15; // 24 minutes 15 seconds

    const timerElem = document.getElementById('countdown-timer');
    if (!timerElem) return;

    setInterval(() => {
        if (secondsLeft > 0) {
            secondsLeft--;
            const hrs = Math.floor(secondsLeft / 3600);
            const mins = Math.floor((secondsLeft % 3600) / 60);
            const secs = secondsLeft % 60;

            const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            timerElem.textContent = formatted;
        } else {
            timerElem.textContent = "00:00:00";
        }
    }, 1000);
}

/* ==========================================================================
   8. TOAST NOTIFICATION
   ========================================================================== */
function showNotification(text) {
    const toast = document.createElement('div');
    toast.className = 'glass-panel';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 100;
        padding: 0.85rem 1.25rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--muc-bright-red);
        animation: fadeIn 0.3s ease-out;
        color: var(--text-primary);
        font-size: 0.88rem;
        font-weight: 600;
    `;
    toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color: var(--muc-bright-red);"></i> <span>${text}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
