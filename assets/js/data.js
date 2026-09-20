/**
 * MAY UNIVERSITY IN CAIRO (MUC) — STUDENT PORTAL
 * محتوى البوابة (data.js)
 *
 * كل المحتوى المتغيّر في مكان واحد: الجدول، المكتبة، الامتحانات، الخدمات.
 *
 * لماذا هنا لا في index.html:
 * كان كل مقرر وكل ملف كتلة وسم مكرّرة (٢١ سطراً للمحاضرة، ١٦ للملف)،
 * فإضافة محاضرة تعني نسخ وسم وتعديله يدوياً، ونصوصها العربية مكتوبة
 * داخل الوسم فلا تُترجم. هنا يصير كل عنصر سطراً واحداً بلغتين،
 * ويستطيع تعديلَه من لا يعرف HTML.
 *
 * البوابة عامة لكل طلاب الكلية: لا بيانات تخصّ طالباً بعينه.
 */

window.PORTAL_DATA = {

    /* ------------------------------------------------------------------
       الخدمات الأكاديمية (لوحة الرئيسية)
       ------------------------------------------------------------------ */
    services: [
        {
            tab: 'gpa',
            icon: 'fa-calculator',
            tag:   { ar: 'تفاعلي', en: 'Interactive' },
            title: { ar: 'حاسبة المعدل التراكمي', en: 'GPA Calculator' },
            desc:  { ar: 'توقع معدلك الفصلي والتراكمي بدقة مع نظام الساعات المعتمدة 4.0.',
                     en: 'Estimate your term and cumulative GPA on the 4.0 credit-hour scale.' }
        },
        {
            tab: 'library',
            icon: 'fa-book-bookmark',
            tag:   { ar: 'تحديث يومي', en: 'Updated daily' },
            title: { ar: 'المكتبة والمحاضرات', en: 'Library & Lectures' },
            desc:  { ar: 'سلايدات المحاضرات، مذكرات السكاشن، وبنوك أسئلة الامتحانات السابقة.',
                     en: 'Lecture slides, section notes, and past exam question banks.' }
        },
        {
            tab: 'schedule',
            icon: 'fa-calendar-days',
            tag:   { ar: 'منظم', en: 'Organised' },
            title: { ar: 'الجدول الدراسي الأسبوعي', en: 'Weekly Timetable' },
            desc:  { ar: 'مواعيد المحاضرات والسكاشن وقاعات التدريس بمؤشرات تفاعلية.',
                     en: 'Lecture and section times with rooms, filterable by day.' }
        },
        {
            tab: 'ai',
            icon: 'fa-brain',
            tag:   { ar: 'ذكاء اصطناعي', en: 'AI' },
            title: { ar: 'معمل البرمجة والذكاء الاصطناعي', en: 'Programming & AI Lab' },
            desc:  { ar: 'مساعد ذكي لشرح الأكواد واكتشاف الأخطاء ومراجعة مفاهيم الخوارزميات.',
                     en: 'An assistant for explaining code, finding bugs, and reviewing algorithms.' }
        },
        {
            href: 'https://www.muc.edu.eg/ar',
            external: true,
            icon: 'fa-globe',
            tag:   { ar: 'رسمي', en: 'Official' },
            title: { ar: 'البوابة الأكاديمية الرسمية (SIS)', en: 'Official Academic Portal (SIS)' },
            desc:  { ar: 'الانتقال المباشر للنظام الأكاديمي الموحد للجامعة لتسجيل المقررات والنتائج.',
                     en: "The university's unified system for course registration and results." }
        }
    ],

    /* ------------------------------------------------------------------
       الجدول الدراسي
       type: lecture | lab | tutorial  — يحدّد اللون والشارة
       ------------------------------------------------------------------ */
    schedule: [
        {
            day: 'sun', type: 'lecture',
            course: { ar: 'تراكيب البيانات والمصفوفات', en: 'Data Structures & Arrays' },
            time:   { ar: 'الأحد • 09:00 ص - 11:00 ص', en: 'Sunday • 09:00 – 11:00' },
            staff:  { ar: 'د. مصطفى الشريف', en: 'Dr. Mostafa El-Sherif' },
            room:   { ar: 'المدرج المركزي B2', en: 'Main Hall B2' }
        },
        {
            day: 'mon', type: 'lab',
            course: { ar: 'معمل البرمجة الكائنية المتقدمة', en: 'Advanced OOP Lab' },
            time:   { ar: 'الإثنين • 11:30 ص - 01:30 م', en: 'Monday • 11:30 – 13:30' },
            staff:  { ar: 'م. سارة محمود', en: 'Eng. Sara Mahmoud' },
            room:   { ar: 'معمل الحاسب 4', en: 'Computer Lab 4' }
        },
        {
            day: 'tue', type: 'lecture',
            course: { ar: 'الذكاء الاصطناعي والأنساق الخبيرة', en: 'AI & Expert Systems' },
            time:   { ar: 'الثلاثاء • 02:30 م - 04:30 م', en: 'Tuesday • 14:30 – 16:30' },
            staff:  { ar: 'د. أحمد العبد', en: 'Dr. Ahmed El-Abd' },
            room:   { ar: 'قاعة المحاضرات C3', en: 'Lecture Hall C3' }
        },
        {
            day: 'wed', type: 'tutorial',
            course: { ar: 'رياضيات متقطعة ونظرية المخططات', en: 'Discrete Maths & Graph Theory' },
            time:   { ar: 'الأربعاء • 10:00 ص - 12:00 م', en: 'Wednesday • 10:00 – 12:00' },
            staff:  { ar: 'د. كمال الشناوي', en: 'Dr. Kamal El-Shennawy' },
            room:   { ar: 'قاعة A1', en: 'Room A1' }
        }
    ],

    /* ------------------------------------------------------------------
       المكتبة الرقمية
       kind: pdf | pptx | code  — يحدّد الأيقونة ولونها
       url:  رابط التنزيل. اتركه فارغاً وسيظهر الملف كـ"قريباً".
       ------------------------------------------------------------------ */
    library: [
        {
            level: 'level-2', kind: 'pdf', url: '',
            file: 'DataStructures_Algorithms.pdf',
            title: { ar: 'ملخص خوارزميات الترتيب والبحث', en: 'Sorting & Searching Algorithms Summary' },
            meta:  { ar: 'تراكيب البيانات • PDF • 4.2 MB', en: 'Data Structures • PDF • 4.2 MB' }
        },
        {
            level: 'level-2', kind: 'pptx', url: '',
            file: 'NeuralNetworks_Lec4.pptx',
            title: { ar: 'سلايدات الشبكات العصبية (محاضرة 4)', en: 'Neural Networks Slides (Lecture 4)' },
            meta:  { ar: 'ذكاء اصطناعي • PPTX • 12.8 MB', en: 'Artificial Intelligence • PPTX • 12.8 MB' }
        },
        {
            level: 'level-2', kind: 'code', url: '',
            file: 'OOP_Inheritance_Lab.zip',
            title: { ar: 'شيت تطبيقات الـ OOP والوراثة', en: 'OOP & Inheritance Exercise Sheet' },
            meta:  { ar: 'برمجة C++ • ZIP • 1.5 MB', en: 'C++ Programming • ZIP • 1.5 MB' }
        },
        {
            level: 'level-2', kind: 'pdf', url: '',
            file: 'DiscreteMath_Midterm2025.pdf',
            title: { ar: 'امتحان نصفي 2025 مع نموذج الإجابة', en: '2025 Midterm with Model Answer' },
            meta:  { ar: 'رياضيات متقطعة • PDF • 2.1 MB', en: 'Discrete Maths • PDF • 2.1 MB' }
        }
    ],

    /* ------------------------------------------------------------------
       جدول الامتحانات
       ------------------------------------------------------------------ */
    exams: [
        {
            code: 'CS201',
            course:   { ar: 'تراكيب البيانات', en: 'Data Structures' },
            datetime: { ar: '15 مايو 2026 • 10:00 ص', en: '15 May 2026 • 10:00' },
            hall:     { ar: 'مدرج C1 (لجنة 4)', en: 'Hall C1 (Room 4)' },
            status:   { ar: 'مؤكد', en: 'Confirmed' }
        },
        {
            code: 'AI202',
            course:   { ar: 'ذكاء اصطناعي وأنساق خبيرة', en: 'AI & Expert Systems' },
            datetime: { ar: '18 مايو 2026 • 12:30 م', en: '18 May 2026 • 12:30' },
            hall:     { ar: 'مدرج B2 (لجنة 2)', en: 'Hall B2 (Room 2)' },
            status:   { ar: 'مؤكد', en: 'Confirmed' }
        },
        {
            code: 'MATH204',
            course:   { ar: 'رياضيات متقطعة ونظرية الرسوم', en: 'Discrete Maths & Graph Theory' },
            datetime: { ar: '22 مايو 2026 • 10:00 ص', en: '22 May 2026 • 10:00' },
            hall:     { ar: 'مدرج A3 (لجنة 7)', en: 'Hall A3 (Room 7)' },
            status:   { ar: 'مؤكد', en: 'Confirmed' }
        }
    ]
};
