/**
 * MAY UNIVERSITY IN CAIRO (MUC) — STUDENT PORTAL
 * وحدة الحركة (motion.js)
 *
 * مبدأ التصميم هنا: الحركة تحسين لا شرط للعرض.
 * إن غابت GSAP، أو طلب المستخدم تقليل الحركة، أو أخفق أي شيء آخر —
 * يبقى المحتوى ظاهراً كاملاً. لا يوجد مسار واحد ينتهي بمحتوى مخفي.
 *
 * لماذا لا ScrollTrigger:
 * كل تبويب لوحة مستقلة، وغير النشطة منها display:none. المُشغِّلات
 * المبنية على موضع العنصر تُحسب حينها بصفر فلا تنطلق أبداً، فيبقى
 * المحتوى شفافاً بعد الانتقال إليه. الكشف المتدرّج عند دخول اللوحة
 * يعطي الأثر نفسه دون هذا الخطر.
 */

(function () {
    'use strict';

    // بلا GSAP لا نُخفي شيئاً: الصفحة تبقى على حالها الساكن الكامل
    if (typeof window.gsap === 'undefined') return;

    var gsap = window.gsap;

    var REVEAL_SELECTORS = [
        '.page-header',
        '.hero-banner',
        '.live-notice-banner',
        '.services-section-header',
        '.service-card',
        '.schedule-item-card',
        '.resource-card',
        '.library-filter-bar',
        '.schedule-days-nav',
        '.gpa-gauge-card',
        '.gpa-form-panel',
        '.ai-lab-header',
        '.ai-chips-row',
        '.data-table-wrap'
    ].join(',');

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function targetsIn(panel) {
        if (!panel) return [];
        return Array.prototype.slice.call(panel.querySelectorAll(REVEAL_SELECTORS));
    }

    /* الوسم data-reveal هو ما يستند إليه CSS في الإخفاء الابتدائي.
       يجب أن يوضع من هنا لا من الوسم الثابت: هكذا لا يُخفى شيء أبداً
       ما لم تكن GSAP حاضرة فعلاً وقادرة على إظهاره. */
    function tagTargets(root) {
        (root || document).querySelectorAll(REVEAL_SELECTORS).forEach(function (el) {
            el.setAttribute('data-reveal', '');
        });
    }

    /* ----------------------------------------------------------------------
       شبكة الأمان
       ----------------------------------------------------------------------
       أياً كان ما يحدث، لا يبقى عنصر شفافاً. تُستدعى عند أي إخفاق
       وبعد كل حركة. */
    function forceVisible(els) {
        if (!els || !els.length) return;
        // إيقاف أي حركة جارية أولاً: بدونه تستأنف الحركة فتُعيد الإخفاء
        // وتتغلّب على الحارس نفسه.
        gsap.killTweensOf(els);
        gsap.set(els, { opacity: 1, y: 0, clearProps: 'transform' });
    }

    /* ----------------------------------------------------------------------
       كشف متدرّج للوحة عند دخولها
       ---------------------------------------------------------------------- */
    function revealPanel(panel) {
        if (!panel) return;
        tagTargets(panel);
        var items = targetsIn(panel);
        if (!items.length) return;

        if (prefersReducedMotion()) {
            forceVisible(items);
            return;
        }

        var DUR = 0.45, STAG = 0.045;

        gsap.killTweensOf(items);
        gsap.fromTo(items,
            { opacity: 0, y: 16 },
            {
                opacity: 1,
                y: 0,
                duration: DUR,
                ease: 'power2.out',
                // 45ms بين العناصر: يُقرأ كتتابع لا كتأخير
                stagger: STAG,
                overwrite: 'auto',
                // الحالة النهائية صريحة: لا يعتمد الظهور على اكتمال الحركة
                onComplete: function () { forceVisible(items); },
                onInterrupt: function () { forceVisible(items); }
            }
        );

        /* شبكة أمان لكل كشف على حدة.
           onComplete لا يقع إن أُوقفت الحركة أو خُنق rAF (تبويب خلفي،
           جهاز محمّل، تنقّل سريع بين اللوحات) — فيبقى المحتوى شفافاً.
           هذا المؤقّت مستقل عن حلقة الرسم فيقع دائماً. */
        var safetyMs = (DUR + STAG * items.length) * 1000 + 400;
        if (panel._revealSafety) clearTimeout(panel._revealSafety);
        panel._revealSafety = setTimeout(function () {
            forceVisible(items);
        }, safetyMs);
    }

    // يُستدعى من main.js بعد تبديل التبويب
    window.animateTabEnter = function (panel) {
        revealPanel(panel);
        drawGpaRing(panel);
    };

    /* ----------------------------------------------------------------------
       عدّاد رقمي: المعدل يُحسب أمام الطالب بدل أن يقفز
       ---------------------------------------------------------------------- */
    window.animateNumber = function (el, to, decimals) {
        if (!el) return;
        var places = typeof decimals === 'number' ? decimals : 2;
        var target = Number(to);
        if (!isFinite(target)) return;

        if (prefersReducedMotion()) {
            el.textContent = target.toFixed(places);
            return;
        }

        var state = { v: parseFloat(el.textContent) || 0 };
        gsap.to(state, {
            v: target,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: true,
            onUpdate: function () { el.textContent = state.v.toFixed(places); },
            // القيمة الصحيحة مضمونة حتى لو قُوطعت الحركة
            onComplete: function () { el.textContent = target.toFixed(places); },
            onInterrupt: function () { el.textContent = target.toFixed(places); }
        });
    };

    /* ----------------------------------------------------------------------
       بقعة الضوء التابعة للمؤشر داخل بلاطات الخدمات
       ----------------------------------------------------------------------
       مفوّضة على الحاوية: مستمع واحد بدل خمسة، ويغطي البلاطات التي
       قد تُضاف لاحقاً. تُلغى تماماً على أجهزة اللمس وعند تقليل الحركة. */
    function initSpotlight() {
        if (!window.matchMedia('(hover: hover)').matches) return;
        if (prefersReducedMotion()) return;

        var grid = document.querySelector('.services-grid');
        if (!grid) return;

        grid.addEventListener('pointermove', function (e) {
            var card = e.target.closest('.service-card');
            if (!card) return;
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    }

    /* ----------------------------------------------------------------------
       لمعة تعبر البلاطة الرئيسية مرة واحدة
       ---------------------------------------------------------------------- */
    function playHeroShine() {
        if (prefersReducedMotion()) return;
        var hero = document.querySelector('.hero-banner');
        if (!hero || hero.querySelector('.hero-shine')) return;

        var shine = document.createElement('span');
        shine.className = 'hero-shine';
        shine.setAttribute('aria-hidden', 'true');
        hero.appendChild(shine);

        gsap.fromTo(shine,
            { xPercent: 0, opacity: 0 },
            {
                xPercent: 420,
                opacity: 1,
                duration: 1.5,
                delay: 0.45,
                ease: 'power2.inOut',
                // العنصر زخرفي بحت: يُزال بعد مروره فلا يبقى في الشجرة
                onComplete: function () { shine.remove(); }
            }
        );
    }

    /* ----------------------------------------------------------------------
       رسم حلقة المعدل عند دخول التبويب
       ---------------------------------------------------------------------- */
    function drawGpaRing(panel) {
        var ring = panel && panel.querySelector('#gpa-ring-fill');
        if (!ring) return;

        // القيمة النهائية يحسبها gpa.js؛ نعيد تشغيل الرسم من الفراغ فقط
        var target = ring.style.strokeDashoffset;
        if (!target) return;
        if (prefersReducedMotion()) return;

        gsap.fromTo(ring,
            { strokeDashoffset: 452.39 },
            { strokeDashoffset: target, duration: 1, ease: 'power2.out', overwrite: true }
        );
    }

    /* ----------------------------------------------------------------------
       الإقلاع
       ---------------------------------------------------------------------- */
    function start() {
        tagTargets();

        // الآن فقط يُسمح لـ CSS بإخفاء عناصر الكشف — بعد التأكد من GSAP
        document.documentElement.classList.add('motion-ready');

        var active = document.querySelector('.tab-content.active');
        revealPanel(active);
        initSpotlight();
        playHeroShine();

        /* حارس أخير غير مشروط.
           الحركة تعتمد requestAnimationFrame، وهو يُخنق في التبويبات
           الخلفية وعلى الأجهزة المحمّلة. لو لم تكتمل الحركة لأي سبب،
           يبقى المحتوى شفافاً إلى الأبد — وهو أسوأ إخفاق ممكن هنا.
           هذا المؤقّت يُظهر كل شيء بعد ثانيتين مهما حدث. */
        // كنسة متكرّرة لا مرة واحدة: التنقّل السريع بين اللوحات قد يسبق
        // مؤقّت الأمان الخاص بكل لوحة، فتبقى عناصر معلّقة.
        [1500, 3500, 6000].forEach(function (ms) {
            setTimeout(function () {
                document.querySelectorAll('.tab-content').forEach(function (panel) {
                    var items = targetsIn(panel).filter(function (el) {
                        return parseFloat(window.getComputedStyle(el).opacity) < 0.99;
                    });
                    forceVisible(items);
                });
            }, ms);
        });

        // الصفحة المخفية توقف rAF: نتأكد عند العودة إليها
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState !== 'visible') return;
            var active = document.querySelector('.tab-content.active');
            forceVisible(targetsIn(active));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
