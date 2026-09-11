/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * MAIN CONTROLLER & APPLICATION LOGIC (main.js)
 */

const SIDEBAR_STORAGE_KEY = 'muc_sidebar_collapsed';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileDrawer();
    initNotifications();
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

        // تتابع دخول عناصر اللوحة — اختياري تماماً
        if (typeof window.animateTabEnter === 'function') {
            window.animateTabEnter(targetTab);
        }
    }

    // 3. Update active state in Sidebar
    //    aria-current يخبر قارئ الشاشة أي وجهة هي الحالية.
    //    الصنف .active لون فقط، ولا يُنقل لأي تقنية مساعدة.
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        const isCurrent = link.getAttribute('data-tab') === tabId;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // 4. Update active state in Mobile Dock
    document.querySelectorAll('#mobile-dock .dock-item').forEach(item => {
        const isCurrent = item.getAttribute('data-tab') === tabId;
        item.classList.toggle('active', isCurrent);
        if (isCurrent) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });

    // 5. Close mobile drawer if open
    closeMobileDrawer();
}

/* ==========================================================================
   2. درج التنقل (الشاشات الصغيرة)
   ==========================================================================
   لم يعد هناك شريط سفلي: القائمة الجانبية نفسها تنزلق كدرج، فالتنقل
   واحد على كل المقاسات. الدرج يتصرف كحوار: يحصر التركيز، ويُغلق
   بـ Escape أو بالنقر خارجه، ويعيد التركيز إلى الزر الذي فتحه. */

let lastFocusedBeforeDrawer = null;

function isDrawerMode() {
    // نفس عتبة CSS التي تحوّل القائمة إلى درج
    return window.matchMedia('(max-width: 1024px)').matches;
}

function initMobileDrawer() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('drawer-close-btn');
    const backdrop = document.getElementById('drawer-backdrop');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn) menuBtn.addEventListener('click', openMobileDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
    if (backdrop) backdrop.addEventListener('click', closeMobileDrawer);

    // Escape يغلق الدرج
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('mobile-open')) {
            closeMobileDrawer();
        }
    });

    // حصر التركيز داخل الدرج ما دام مفتوحاً
    if (sidebar) {
        sidebar.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !sidebar.classList.contains('mobile-open')) return;

            const focusable = sidebar.querySelectorAll(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const visible = Array.prototype.filter.call(focusable, (el) => el.offsetParent !== null);
            if (!visible.length) return;

            const first = visible[0];
            const last = visible[visible.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // العودة إلى عرض سطح المكتب تُنهي وضع الدرج، وإلا بقيت الصفحة مقفلة
    window.addEventListener('resize', () => {
        if (!isDrawerMode() && sidebar && sidebar.classList.contains('mobile-open')) {
            closeMobileDrawer();
        }
    });
}

function openMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (!sidebar) return;

    lastFocusedBeforeDrawer = document.activeElement;
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // التركيز ينتقل داخل الدرج فور فتحه
    const closeBtn = document.getElementById('drawer-close-btn');
    if (closeBtn) closeBtn.focus();
}

function closeMobileDrawer() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('drawer-backdrop');
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (!sidebar) return;

    const wasOpen = sidebar.classList.contains('mobile-open');
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // إعادة التركيز فقط إن كان الدرج مفتوحاً فعلاً
    if (wasOpen && lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === 'function') {
        lastFocusedBeforeDrawer.focus();
    }
    lastFocusedBeforeDrawer = null;
}

/* ==========================================================================
   2.5 لوحة التنبيهات
   ==========================================================================
   كان الجرس يطلق رسالة عابرة تقول "لا توجد تنبيهات" ثم تختفي — أي أن
   الضغط عليه لا يوصل شيئاً يمكن الرجوع إليه. صار يفتح لوحة فعلية
   بمحتوى دائم، تُغلق بـ Escape أو بالنقر خارجها. */
function initNotifications() {
    const btn = document.getElementById('notif-btn');
    const panel = document.getElementById('notif-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel(!isOpen());
    });

    function isOpen() { return !panel.hasAttribute('hidden'); }

    function togglePanel(open) {
        panel.toggleAttribute('hidden', !open);
        btn.setAttribute('aria-expanded', String(open));
        if (open) {
            const first = panel.querySelector('button, a[href]');
            if (first) first.focus();
        }
    }

    // النقر خارج اللوحة يغلقها
    document.addEventListener('click', (e) => {
        if (!isOpen()) return;
        if (panel.contains(e.target) || btn.contains(e.target)) return;
        togglePanel(false);
    });

    // Escape يغلقها ويعيد التركيز إلى الجرس
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            togglePanel(false);
            btn.focus();
        }
    });

    // التركيز الخارج من اللوحة يغلقها أيضاً
    panel.addEventListener('focusout', () => {
        setTimeout(() => {
            if (isOpen() && !panel.contains(document.activeElement) &&
                document.activeElement !== btn) {
                togglePanel(false);
            }
        }, 0);
    });
}

function clearNotifications() {
    const panel = document.getElementById('notif-panel');
    const btn = document.getElementById('notif-btn');
    if (!panel) return;

    panel.querySelectorAll('.notif-item.is-unread').forEach((el) => {
        el.classList.remove('is-unread');
    });

    // العدّاد والاسم المنطوق يتبعان الحالة الجديدة
    const count = panel.querySelectorAll('.notif-item.is-unread').length;
    const badge = document.querySelector('.notif-count');
    if (badge) badge.remove();
    if (btn) {
        btn.setAttribute('aria-label',
            count === 0 ? 'التنبيهات، لا جديد | Notifications, none unread'
                        : 'التنبيهات | Notifications');
    }

    const isEn = document.documentElement.getAttribute('lang') === 'en';
    showNotification(isEn ? 'All notifications marked as read.'
                          : 'تم تعليم كل التنبيهات كمقروءة.');
}

/* ==========================================================================
   3. DIGITAL STUDENT ID CARD (3D FLIP MODAL)
   ========================================================================== */
/* العنصر الذي فتح المودال: إليه يعود التركيز عند الإغلاق، وإلا قفز
   إلى بداية الصفحة وفقد المستخدم موضعه تماماً. */
let lastFocusedBeforeModal = null;

function initStudentIdModal() {
    const modal = document.getElementById('student-card-modal');
    const flipContainer = document.getElementById('id-card-flip');

    if (flipContainer) {
        flipContainer.addEventListener('click', () => {
            const inner = document.getElementById('id-card-inner');
            if (!inner) return;
            const flipped = inner.classList.toggle('flipped');
            // الحالة تُعلن لقارئ الشاشة: الوجه المرئي تغيّر فعلاً
            flipContainer.setAttribute('aria-pressed', String(flipped));
        });
    }

    // Close on backdrop click outside card
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStudentCardModal();
            }
        });

        // حصر التركيز داخل الحوار: بدونه يتنقل Tab إلى محتوى الخلفية
        // المحجوب بصرياً، فيتوه مستخدم لوحة المفاتيح خارج ما يراه.
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !modal.classList.contains('active')) return;

            const focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // Close on Escape key — فقط عندما يكون الحوار مفتوحاً
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeStudentCardModal();
        }
    });
}

function openStudentCardModal() {
    const modal = document.getElementById('student-card-modal');
    if (!modal) return;

    lastFocusedBeforeModal = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // التركيز ينتقل داخل الحوار فور فتحه، وإلا بقي على الصفحة خلفه
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
}

function closeStudentCardModal() {
    const modal = document.getElementById('student-card-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset card flip to front side
    const inner = document.getElementById('id-card-inner');
    if (inner) inner.classList.remove('flipped');
    const flipBtn = document.getElementById('id-card-flip');
    if (flipBtn) flipBtn.setAttribute('aria-pressed', 'false');

    // إعادة التركيز إلى الزر الذي فتح الحوار
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
        lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
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
            const isEn = document.documentElement.getAttribute('lang') === 'en';
            const query = editor.value.trim();

            if (!query) {
                // alert() يوقف الصفحة ويخرج من أسلوب الواجهة تماماً.
                // التنبيه العابر يوصل نفس الرسالة ويعيد التركيز للحقل.
                showNotification(isEn
                    ? 'Please enter some code or a question.'
                    : 'يرجى كتابة كود أو سؤال في المربع.');
                editor.focus();
                return;
            }

            const output = document.getElementById('ai-output-box');
            if (!output) return;

            // حالة التحميل: الزر معطّل فلا يُرسل الطلب مرتين، ونصه يشرح الانتظار
            const originalHTML = analyzeBtn.innerHTML;
            analyzeBtn.disabled = true;
            analyzeBtn.setAttribute('aria-busy', 'true');
            analyzeBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> <span>' +
                (isEn ? 'Analyzing…' : 'جاري التحليل…') + '</span>';

            output.style.display = 'block';
            output.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ' +
                (isEn
                    ? 'AI is analyzing your code and drafting insights...'
                    : 'جاري تحليل الكود وصياغة الملاحظات والحل بواسطة الذكاء الاصطناعي...');

            setTimeout(() => {
                output.innerHTML = `
                    <div class="ai-output-head">
                        <i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${isEn ? "Analysis Complete:" : "تم التحليل بنجاح:"}
                    </div>
                    <p>
                        ${isEn ?
                            "1. <b>Time Complexity</b>: O(n log n) efficient recursion observed.<br>2. <b>Memory Safety</b>: Ensure pointers are deleted or wrapped with <code>std::unique_ptr</code>.<br>3. <b>Clean Code Tip</b>: Separate definition into header <code>.h</code> and source <code>.cpp</code>." :
                            "1. <b>التعقيد الزمني (Time Complexity)</b>: تم رصد كفاءة خوارزمية بمعدل O(n log n) ممتاز.<br>2. <b>أمان الذاكرة (Memory Management)</b>: تأكد من تحرير المؤشرات الديناميكية عبر <code>delete</code> أو الاعتماد على <code>std::unique_ptr</code> لتجنب Memory Leaks.<br>3. <b>نصيحة الأسلوب النظيف</b>: يُفضل فصل توقيع الدوال في ملف Header <code>.hpp</code> وتنفيذها في <code>.cpp</code>."
                        }
                    </p>
                `;

                // استعادة الزر لحالته الأصلية
                analyzeBtn.disabled = false;
                analyzeBtn.removeAttribute('aria-busy');
                analyzeBtn.innerHTML = originalHTML;
            }, 800);
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
   ==========================================================================
   منطقة حيّة واحدة تُنشأ مرة واحدة. role="status" مع aria-live="polite"
   يجعل قارئ الشاشة ينطق التنبيه دون أن يسحب التركيز من عمل المستخدم. */
function getToastRegion() {
    let region = document.getElementById('toast-region');
    if (!region) {
        region = document.createElement('div');
        region.id = 'toast-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        document.body.appendChild(region);
    }
    return region;
}

function showNotification(text) {
    const region = getToastRegion();

    const toast = document.createElement('div');
    toast.className = 'toast';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-circle-info';
    icon.setAttribute('aria-hidden', 'true');

    // textContent لا innerHTML: النص يُعرض كنص مهما احتوى من رموز
    const label = document.createElement('span');
    label.textContent = text;

    toast.append(icon, label);
    region.appendChild(toast);

    // 4 ثوانٍ: ضمن المدى الموصى به (3-5s) لقراءة سطر قصير
    setTimeout(() => {
        toast.classList.add('toast-leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
        // شبكة أمان: إن كانت الحركة معطّلة لا يقع حدث animationend
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
