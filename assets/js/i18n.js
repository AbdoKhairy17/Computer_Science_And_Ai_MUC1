/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * INTERNATIONALIZATION (i18n.js)
 * Supports Arabic (RTL) & English (LTR)
 */

const translations = {
    ar: {
        // Brand & Header
        univ_name: "جامعة مايو بالقاهرة",
        faculty_name: "كلية الحاسبات والذكاء الاصطناعي",
        tag_muc: "MUC",
        current_term: "ربيع 2026",
        digital_id: "البطاقة الرقمية",
        search_placeholder: "ابحث في المقررات، المحاضرات، الخدمات...",

        // Sidebar Navigation
        nav_category_academic: "الشؤون الأكاديمية",
        nav_dashboard: "الرئيسية",
        nav_gpa: "حاسبة المعدل",
        nav_schedule: "الجدول الدراسي",
        nav_library: "المكتبة والمحاضرات",
        nav_ai: "معمل الذكاء الاصطناعي",
        nav_exams: "جدول الامتحانات",
        nav_category_links: "روابط خارجية",
        nav_sis_portal: "بوابة SIS الرسمية",

        // Student Mini Profile
        student_name: "عبدالمجيد خيري",
        student_level: "المستوى الثاني • ذكاء اصطناعي",
        student_id_prefix: "ID: ",

        // Hero Greeting
        hero_welcome_back: "أهلاً بك مجدداً 👋",
        hero_student_sub: "طالب بكالوريوس - المستوى الثاني • قسم الذكاء الاصطناعي",
        stat_gpa_label: "المعدل التراكمي (CGPA)",
        stat_hours_label: "الساعات المعتمدة",
        stat_courses_label: "مقررات الفصل",

        // Live Notice Banner
        notice_badge: "تنبيه المواعيد",
        notice_live_now: "مباشر الآن",
        notice_lecture_title: "المحاضرة القادمة: الذكاء الاصطناعي والأنساق الخبيرة",
        notice_lecture_details: "المدرج المركزي (C3) • الدكتور: أحمد العبد • الساعة 02:30 مساءً",
        countdown_label: "متبقي:",

        // Services Grid
        services_section_title: "الخدمات الأكاديمية السريعة",
        services_count_text: "5 خدمات تفاعلية",
        badge_interactive: "تفاعلي",
        badge_daily_update: "تحديث يومي",
        badge_organized: "منظم",
        badge_ai_tag: "ذكاء اصطناعي",
        badge_official: "رسمي",

        card_gpa_title: "حاسبة المعدل التراكمي",
        card_gpa_desc: "توقع معدلك الفصلي والتراكمي بدقة مع نظام الساعات المعتمدة 4.0.",
        card_library_title: "المكتبة والمحاضرات",
        card_library_desc: "سلايدات المحاضرات، مذكرات السكاشن، وبنوك أسئلة الامتحانات السابقة.",
        card_schedule_title: "الجدول الدراسي الأسبوعي",
        card_schedule_desc: "مواعيد المحاضرات والسكاشن وقاعات التدريس بمؤشرات تفاعلية.",
        card_ai_title: "معمل البرمجة والذكاء الاصطناعي",
        card_ai_desc: "مساعد ذكي لشرح الأكواد واكتشاف الأخطاء ومراجعة مفاهيم الخوارزميات.",
        card_portal_title: "البوابة الأكاديمية الرسمية (SIS)",
        card_portal_desc: "الانتقال المباشر للنظام الأكاديمي الموحد للجامعة لتسجيل المقررات والنتائج.",

        // GPA Calculator Tab
        gpa_title: "حاسبة المعدل التراكمي (GPA Predictor)",
        gpa_subtitle: "أدخل درجات موادك الحالية لحساب GPA المتوقع بنظام 4.0",
        gpa_semester_label: "المعدل الفصلي المتوقع",
        gpa_standing_excellent: "تقدير ممتاز (Excellent)",
        gpa_standing_very_good: "تقدير جيد جداً (Very Good)",
        gpa_standing_good: "تقدير جيد (Good)",
        gpa_standing_pass: "تقدير مقبول (Pass)",
        gpa_total_courses: "عدد المواد:",
        gpa_total_credits: "إجمالي الساعات:",
        gpa_th_course: "اسم المقرر",
        gpa_th_hours: "الساعات",
        gpa_th_grade: "التقدير",
        gpa_th_action: "حذف",
        btn_add_course: "إضافة مادة جديدة",
        btn_calc_gpa: "احسب المعدل الآن",

        // Schedule Tab
        sched_title: "الجدول الدراسي الأسبوعي",
        sched_subtitle: "عرض القاعات ومواعيد المحاضرات والسكاشن حسب اليوم",
        day_sun: "الأحد",
        day_mon: "الإثنين",
        day_tue: "الثلاثاء",
        day_wed: "الأربعاء",
        day_thu: "الخميس",
        badge_lecture: "محاضرة نظرية",
        badge_lab: "سكشن عملي",
        badge_tutorial: "تمرين",

        // Library Tab
        lib_title: "مكتبة المواد الرقمية - MUC Drive",
        lib_subtitle: "تصفح محاضراتك وسكاشنك وامتحانات السنين السابقة",
        level_all: "جميع المستويات",
        level_1: "المستوى الأول",
        level_2: "المستوى الثاني",
        level_3: "المستوى الثالث",
        level_4: "المستوى الرابع",
        btn_download_file: "تحميل الملف",

        // AI Lab Tab
        ai_title: "معمل الذكاء الاصطناعي الأكاديمي",
        ai_subtitle: "أدوات ذكية للمساعدة في حل الشيتات وشرح الأكواد واكتشاف الأخطاء",
        ai_chip_explain: "شرح خوارزميات الترتيب في C++",
        ai_chip_oop: "مفاهيم تعدد الأشكال Polymorphism",
        ai_chip_dataset: "كيف أجهز Dataset لتدريب نموذج AI؟",
        ai_chip_debug: "اكتشاف أخطاء Segmentation Fault",
        ai_input_placeholder: "ألصق كود C++ أو Python أو اسأل أي سؤال أكاديمي هنا...",
        btn_ai_analyze: "تحليل وشرح الكود بواسطة AI",

        // Exams Tab
        exams_title: "جدول امتحانات الفصل الدراسي",
        exams_subtitle: "مواعيد امتحانات منتصف الفصل ونهاية الفصل وأرقام اللجان والجلوس",

        // Exam table column headers
        exam_col_code: "كود المادة",
        exam_col_course: "اسم المقرر",
        exam_col_datetime: "التاريخ والوقت",
        exam_col_hall: "قاعة الامتحان",
        exam_col_seat: "رقم الجلوس",
        exam_col_status: "الحالة",

        // Digital Student ID Modal
        id_modal_title: "جامعة مايو بالقاهرة - MUC",
        id_badge_subtitle: "بطاقة الطالب الرقمية الموحدة",
        id_student_major: "كلية الحاسبات والذكاء الاصطناعي",
        id_academic_year: "العام الأكاديمي: 2025/2026",
        id_status_active: "بطاقة نشطة وموثقة",
        id_back_title: "رمز الدخول الإلكتروني للحرم الجامعي",
        id_scan_hint: "امسح الرمز عند البوابات الإلكترونية ومكتبة الجامعة",
        id_flip_prompt: "اضغط على البطاقة لقلبها (3D)",

        // Misc / Alerts
        lang_name: "English",
        toast_downloading: "جاري تحميل الملف الأكاديمي...",
        toast_gpa_calculated: "تم احتساب المعدل بنجاح!"
    },

    en: {
        // Brand & Header
        univ_name: "May University in Cairo",
        faculty_name: "Faculty of Computers & Artificial Intelligence",
        tag_muc: "MUC",
        current_term: "Spring 2026",
        digital_id: "Digital ID",
        search_placeholder: "Search courses, lectures, services...",

        // Sidebar Navigation
        nav_category_academic: "Academic Affairs",
        nav_dashboard: "Dashboard",
        nav_gpa: "GPA Calculator",
        nav_schedule: "Timetable",
        nav_library: "Library & Lectures",
        nav_ai: "AI Code Lab",
        nav_exams: "Exam Schedule",
        nav_category_links: "External Links",
        nav_sis_portal: "Official SIS Portal",

        // Student Mini Profile
        student_name: "Abdelmajeed Khairy",
        student_level: "Sophomore (Level 2) • AI Major",
        student_id_prefix: "ID: ",

        // Hero Greeting
        hero_welcome_back: "Welcome back 👋",
        hero_student_sub: "Bachelor's Student - Level 2 • Dept. of Artificial Intelligence",
        stat_gpa_label: "Cumulative GPA",
        stat_hours_label: "Earned Credits",
        stat_courses_label: "Active Courses",

        // Live Notice Banner
        notice_badge: "Schedule Alert",
        notice_live_now: "Live Now",
        notice_lecture_title: "Upcoming Lecture: Artificial Intelligence & Expert Systems",
        notice_lecture_details: "Central Hall (C3) • Prof: Dr. Ahmed Elabd • 02:30 PM",
        countdown_label: "Time Left:",

        // Services Grid
        services_section_title: "Quick Academic Services",
        services_count_text: "5 interactive services",
        badge_interactive: "Interactive",
        badge_daily_update: "Daily Updates",
        badge_organized: "Organized",
        badge_ai_tag: "AI Powered",
        badge_official: "Official",

        card_gpa_title: "GPA Predictor & Planner",
        card_gpa_desc: "Calculate semester & cumulative GPA accurately using the 4.0 credit scale.",
        card_library_title: "Digital Library & Courseware",
        card_library_desc: "Access lecture slides, section sheets, and previous exam question banks.",
        card_schedule_title: "Weekly Academic Timetable",
        card_schedule_desc: "Lecture and lab schedules with interactive halls and instructor indicators.",
        card_ai_title: "Programming & AI Lab",
        card_ai_desc: "Smart assistant to explain code, fix syntax bugs, and review core algorithms.",
        card_portal_title: "Official SIS Portal",
        card_portal_desc: "Direct access to May University unified SIS for registration and official transcripts.",

        // GPA Calculator Tab
        gpa_title: "GPA Predictor & Calculator",
        gpa_subtitle: "Input your registered course grades to project your 4.0 scale semester GPA",
        gpa_semester_label: "Projected Semester GPA",
        gpa_standing_excellent: "Standing: Excellent",
        gpa_standing_very_good: "Standing: Very Good",
        gpa_standing_good: "Standing: Good",
        gpa_standing_pass: "Standing: Pass",
        gpa_total_courses: "Courses Count:",
        gpa_total_credits: "Total Credits:",
        gpa_th_course: "Course Name",
        gpa_th_hours: "Credits",
        gpa_th_grade: "Grade",
        gpa_th_action: "Remove",
        btn_add_course: "Add New Course",
        btn_calc_gpa: "Calculate GPA Now",

        // Schedule Tab
        sched_title: "Weekly Academic Timetable",
        sched_subtitle: "View hall assignments, lecture times, and practical labs by day",
        day_sun: "Sunday",
        day_mon: "Monday",
        day_tue: "Tuesday",
        day_wed: "Wednesday",
        day_thu: "Thursday",
        badge_lecture: "Lecture",
        badge_lab: "Practical Lab",
        badge_tutorial: "Tutorial",

        // Library Tab
        lib_title: "Digital Library - MUC Drive",
        lib_subtitle: "Browse lecture slides, lab manuals, and previous examination papers",
        level_all: "All Levels",
        level_1: "Level 1 (Freshman)",
        level_2: "Level 2 (Sophomore)",
        level_3: "Level 3 (Junior)",
        level_4: "Level 4 (Senior)",
        btn_download_file: "Download File",

        // AI Lab Tab
        ai_title: "Academic AI & Code Lab",
        ai_subtitle: "Intelligent study companion to explain code, detect bugs, and answer computer science inquiries",
        ai_chip_explain: "Explain sorting algorithms in C++",
        ai_chip_oop: "Polymorphism & OOP concepts",
        ai_chip_dataset: "How to prepare a dataset for AI training?",
        ai_chip_debug: "Debug segmentation fault error",
        ai_input_placeholder: "Paste C++, Python code or ask an academic question here...",
        btn_ai_analyze: "Analyze & Explain Code",

        // Exams Tab
        exams_title: "Semester Exam Schedule",
        exams_subtitle: "Midterm & Final exam dates, hall numbers, and student seat assignments",

        // Exam table column headers
        exam_col_code: "Course Code",
        exam_col_course: "Course Name",
        exam_col_datetime: "Date & Time",
        exam_col_hall: "Exam Hall",
        exam_col_seat: "Seat No.",
        exam_col_status: "Status",

        // Digital Student ID Modal
        id_modal_title: "May University in Cairo - MUC",
        id_badge_subtitle: "Official Digital Student ID",
        id_student_major: "Faculty of Computers & Artificial Intelligence",
        id_academic_year: "Academic Year: 2025/2026",
        id_status_active: "Active & Verified Badge",
        id_back_title: "Campus Smart Electronic Gate Pass",
        id_scan_hint: "Scan this code at campus turnstiles and university library gates",
        id_flip_prompt: "Click the card to flip in 3D",

        // Misc / Alerts
        lang_name: "العربية",
        toast_downloading: "Downloading academic file...",
        toast_gpa_calculated: "GPA calculated successfully!"
    }
};

let currentLanguage = localStorage.getItem('muc_lang') || 'ar';

function getTranslation(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    if (translations.ar[key]) return translations.ar[key];
    return key;
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    localStorage.setItem('muc_lang', lang);

    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getTranslation(key);
        if (text) {
            el.textContent = text;
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = getTranslation(key);
        if (text) {
            el.setAttribute('placeholder', text);
        }
    });

    // Update Language switcher button label
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        const labelSpan = langBtn.querySelector('.lang-label');
        if (labelSpan) {
            labelSpan.textContent = isRtl ? 'English' : 'العربية';
        }
    }
}

function toggleLanguage() {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage);
});
