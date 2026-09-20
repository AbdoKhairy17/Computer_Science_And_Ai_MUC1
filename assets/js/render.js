/**
 * MAY UNIVERSITY IN CAIRO (MUC) — STUDENT PORTAL
 * بناء المحتوى من البيانات (render.js)
 *
 * يقرأ window.PORTAL_DATA ويبني الجدول والمكتبة والامتحانات والخدمات.
 * يُعاد البناء عند تبديل اللغة، فالمحتوى يُترجم مثل بقية الواجهة —
 * وهو ما لم يكن ممكناً حين كان مكتوباً داخل الوسم.
 *
 * كل النصوص تُكتب عبر textContent لا innerHTML: المحتوى قد يأتي لاحقاً
 * من ملف يحرّره غير مبرمج، فلا يُفترض أنه وسم آمن.
 */

(function () {
    'use strict';

    const DATA = window.PORTAL_DATA;
    if (!DATA) return;

    /** اللغة الحالية من عنصر html — مصدر واحد لا نسخة محلية */
    function lang() {
        return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar';
    }

    /** يختار النص حسب اللغة، ويقبل النص المجرّد كما هو */
    function pick(field) {
        if (field == null) return '';
        if (typeof field === 'string') return field;
        return field[lang()] || field.ar || '';
    }

    /** عنصر مع صنف ونص — يختصر التكرار في كل الدوال أدناه */
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    /** أيقونة زخرفية: مخفيّة عن قارئ الشاشة دائماً */
    function icon(name, extraClass) {
        const i = document.createElement('i');
        i.className = 'fa-solid ' + name + (extraClass ? ' ' + extraClass : '');
        i.setAttribute('aria-hidden', 'true');
        return i;
    }

    /* ==================================================================
       الخدمات الأكاديمية
       ================================================================== */
    function renderServices() {
        const grid = document.querySelector('.services-grid');
        if (!grid) return;
        grid.textContent = '';

        DATA.services.forEach(function (svc) {
            const card = document.createElement('a');
            card.className = 'glass-panel-interactive service-card';

            if (svc.external) {
                card.href = svc.href;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
            } else {
                card.href = '#' + svc.tab;
                card.setAttribute('data-tab', svc.tab);
            }

            const top = el('div', 'service-card-top');
            const iconWrap = el('div', 'service-icon-wrap');
            iconWrap.appendChild(icon(svc.icon));
            top.appendChild(iconWrap);
            top.appendChild(el('span', 'service-tag', pick(svc.tag)));

            const body = document.createElement('div');
            const heading = el('h4', 'service-title', pick(svc.title));

            if (svc.external) {
                // سهم الخروج يلتصق بالعنوان، فيُقرأ أنه رابط خارجي
                heading.appendChild(document.createTextNode(' '));
                heading.appendChild(icon('fa-arrow-up-right-from-square', 'service-external-icon'));
            }

            body.appendChild(heading);
            body.appendChild(el('p', 'service-desc', pick(svc.desc)));

            card.appendChild(top);
            card.appendChild(body);
            grid.appendChild(card);
        });
    }

    /* ==================================================================
       الجدول الدراسي
       ================================================================== */
    // لون أيقونة الوقت يتبع نوع الجلسة، فيُقرأ النوع من الصف نفسه
    const SESSION_ICON = { lecture: 'text-muc-bright-red',
                           lab: 'text-accent-emerald',
                           tutorial: 'text-accent-amber' };

    const SESSION_LABEL = {
        lecture:  { ar: 'محاضرة نظرية', en: 'Lecture' },
        lab:      { ar: 'سكشن عملي',   en: 'Lab' },
        tutorial: { ar: 'تمرين',       en: 'Tutorial' }
    };

    function metaItem(iconName, iconClass, text) {
        const span = el('span', 'schedule-meta-item');
        span.appendChild(icon(iconName, iconClass));
        span.appendChild(el('span', null, text));
        return span;
    }

    function renderSchedule() {
        const list = document.querySelector('.schedule-list');
        if (!list) return;
        list.textContent = '';

        DATA.schedule.forEach(function (s) {
            const type = s.type || 'lecture';
            const card = el('div', 'glass-panel schedule-item-card session-' + type);
            card.setAttribute('data-day', s.day);

            const main = document.createElement('div');
            main.appendChild(el('h3', 'schedule-course-title', pick(s.course)));

            const meta = el('div', 'schedule-meta-row');
            meta.appendChild(metaItem('fa-clock', SESSION_ICON[type], pick(s.time)));
            meta.appendChild(metaItem('fa-user-tie', 'text-muc-gold', pick(s.staff)));
            meta.appendChild(metaItem(type === 'lab' ? 'fa-desktop' : 'fa-location-dot',
                                      'text-accent-blue', pick(s.room)));
            main.appendChild(meta);

            card.appendChild(main);
            card.appendChild(el('span', 'session-type-badge session-' + type,
                                pick(SESSION_LABEL[type])));
            list.appendChild(card);
        });
    }

    /* ==================================================================
       المكتبة الرقمية
       ================================================================== */
    const FILE_ICON = { pdf: 'fa-file-pdf', pptx: 'fa-file-powerpoint', code: 'fa-code' };

    function renderLibrary() {
        const grid = document.querySelector('.library-grid');
        if (!grid) return;
        grid.textContent = '';

        DATA.library.forEach(function (doc) {
            const kind = doc.kind || 'pdf';
            const card = el('div', 'glass-panel resource-card');
            card.setAttribute('data-level', doc.level || 'all');

            const left = el('div', 'resource-left');
            const iconBox = el('div', 'resource-icon ' + kind);
            iconBox.appendChild(icon(FILE_ICON[kind] || 'fa-file-lines'));
            left.appendChild(iconBox);

            const info = el('div', 'resource-info');
            const title = pick(doc.title);
            info.appendChild(el('div', 'resource-title', title));
            info.appendChild(el('div', 'resource-meta', pick(doc.meta)));
            left.appendChild(info);

            // رابط حقيقي حين يتوفّر، وزر معطّل حين لا يتوفّر —
            // بدل زر يبدو عاملاً ثم لا ينزّل شيئاً.
            let action;
            if (doc.url) {
                action = document.createElement('a');
                action.className = 'btn-download';
                action.href = doc.url;
                action.setAttribute('download', doc.file || '');
                action.setAttribute('aria-label', t('تنزيل: ', 'Download: ') + title);
                action.appendChild(icon('fa-download'));
            } else {
                action = document.createElement('button');
                action.className = 'btn-download';
                action.type = 'button';
                action.disabled = true;
                action.setAttribute('aria-label',
                    t('غير متاح بعد: ', 'Not available yet: ') + title);
                action.title = t('غير متاح بعد', 'Not available yet');
                action.appendChild(icon('fa-clock'));
            }

            card.appendChild(left);
            card.appendChild(action);
            grid.appendChild(card);
        });
    }

    /* ==================================================================
       جدول الامتحانات
       ================================================================== */
    function renderExams() {
        const body = document.querySelector('.data-table tbody');
        if (!body) return;
        body.textContent = '';

        DATA.exams.forEach(function (ex) {
            const row = document.createElement('tr');
            row.appendChild(el('td', 'cell-code', ex.code));
            row.appendChild(el('td', 'cell-title', pick(ex.course)));
            row.appendChild(el('td', null, pick(ex.datetime)));
            row.appendChild(el('td', null, pick(ex.hall)));

            const statusCell = document.createElement('td');
            statusCell.appendChild(
                el('span', 'status-pill status-confirmed', pick(ex.status)));
            row.appendChild(statusCell);

            body.appendChild(row);
        });
    }

    /* ================================================================== */

    function renderAll() {
        renderServices();
        renderSchedule();
        renderLibrary();
        renderExams();

        // الفلاتر النشطة تُطبَّق على المحتوى الجديد
        if (typeof window.reapplyFilters === 'function') window.reapplyFilters();
    }

    window.renderPortalContent = renderAll;

    // يُبنى فوراً: السكربتات في نهاية body فالحاويات موجودة، وبذلك
    // يجد main.js المحتوى جاهزاً عند تهيئته.
    renderAll();

    // اللغة تتغيّر ⇒ يُعاد بناء المحتوى بالنصوص الجديدة
    window.addEventListener('muc:languagechange', renderAll);
})();
