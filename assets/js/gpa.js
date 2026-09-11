/**
 * MAY UNIVERSITY IN CAIRO (MUC) - STUDENT PORTAL
 * GPA PREDICTOR & CALCULATOR (gpa.js)
 */

const GPA_STORAGE_KEY = 'muc_student_courses_v2';
const RING_CIRCUMFERENCE = 452.39; // 2 * Math.PI * 72

let studentCourses = [
    { name: "برمجة هيكلية (C++)", hours: 3, grade: 4.0 },
    { name: "تراكيب البيانات (Data Structures)", hours: 3, grade: 3.7 },
    { name: "ذكاء اصطناعي وأنساق خبيرة", hours: 3, grade: 4.0 },
    { name: "رياضيات متقطعة (Discrete Math)", hours: 3, grade: 3.3 },
    { name: "هندسة البرمجيات (Software Eng)", hours: 3, grade: 3.7 }
];

function loadSavedCourses() {
    try {
        const saved = localStorage.getItem(GPA_STORAGE_KEY);
        if (saved) {
            studentCourses = JSON.parse(saved);
        }
    } catch (e) {
        console.warn("Using default courses data");
    }
}

function saveCoursesToStorage() {
    try {
        localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify(studentCourses));
    } catch (e) {}
}

const GRADE_OPTIONS = [
    [4.0, 'A+ (4.00)'], [3.7, 'A (3.70)'],  [3.3, 'B+ (3.30)'],
    [3.0, 'B (3.00)'],  [2.7, 'C+ (2.70)'], [2.4, 'C (2.40)'],
    [2.0, 'D+ (2.00)'], [1.7, 'D (1.70)'],  [0.0, 'F (0.00)']
];

/* بناء الصف بعُقد DOM بدل innerHTML.
   اسم المقرر يكتبه المستخدم ويُحفظ في localStorage: تمريره داخل
   value="${...}" كان يسمح لعلامة اقتباس واحدة بكسر السمة وحقن وسوم. */
function buildCourseRow(course, idx) {
    const row = document.createElement('div');
    row.className = 'gpa-row-item';

    // --- اسم المقرر ---
    const nameCell = document.createElement('div');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input-field';
    nameInput.value = course.name;           // كنص، لا كـ HTML
    // الحقول كانت بلا اسم منطوق: قارئ الشاشة ينطقها "حقل نص، فارغ"
    nameInput.setAttribute('aria-label', `اسم المقرر ${idx + 1}`);
    nameInput.addEventListener('change', () => {
        updateCourseField(idx, 'name', nameInput.value);
    });
    nameCell.appendChild(nameInput);

    // --- الساعات المعتمدة ---
    const hoursCell = document.createElement('div');
    const hoursSelect = document.createElement('select');
    hoursSelect.className = 'input-field';
    hoursSelect.setAttribute('aria-label', `الساعات المعتمدة للمقرر ${idx + 1}`);
    [1, 2, 3, 4].forEach(h => {
        const opt = document.createElement('option');
        opt.value = String(h);
        opt.textContent = String(h);
        opt.selected = course.hours === h;
        hoursSelect.appendChild(opt);
    });
    hoursSelect.addEventListener('change', () => {
        updateCourseField(idx, 'hours', hoursSelect.value);
    });
    hoursCell.appendChild(hoursSelect);

    // --- التقدير ---
    const gradeCell = document.createElement('div');
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'input-field';
    gradeSelect.setAttribute('aria-label', `تقدير المقرر ${idx + 1}`);
    GRADE_OPTIONS.forEach(([value, label]) => {
        const opt = document.createElement('option');
        opt.value = value.toFixed(1);
        opt.textContent = label;
        opt.selected = course.grade === value;
        gradeSelect.appendChild(opt);
    });
    gradeSelect.addEventListener('change', () => {
        updateCourseField(idx, 'grade', gradeSelect.value);
    });
    gradeCell.appendChild(gradeSelect);

    // --- زر الحذف ---
    const actionCell = document.createElement('div');
    actionCell.style.display = 'flex';
    actionCell.style.justifyContent = 'center';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-icon-danger';
    // الاسم المنطوق يذكر المقرر: "حذف" وحدها لا تخبر أيّ صف
    removeBtn.setAttribute('aria-label', `حذف المقرر: ${course.name}`);
    removeBtn.title = 'Remove';
    const trashIcon = document.createElement('i');
    trashIcon.className = 'fa-solid fa-trash-can';
    trashIcon.setAttribute('aria-hidden', 'true');
    removeBtn.appendChild(trashIcon);
    removeBtn.addEventListener('click', () => removeCourseRow(idx));
    actionCell.appendChild(removeBtn);

    row.append(nameCell, hoursCell, gradeCell, actionCell);
    return row;
}

function renderCourseRows() {
    const container = document.getElementById('gpa-courses-list');
    if (!container) return;

    container.textContent = '';
    studentCourses.forEach((c, idx) => {
        container.appendChild(buildCourseRow(c, idx));
    });

    calculateGpaMetrics();
}

function updateCourseField(idx, field, value) {
    if (studentCourses[idx]) {
        if (field === 'hours') studentCourses[idx].hours = parseInt(value, 10);
        else if (field === 'grade') studentCourses[idx].grade = parseFloat(value);
        else studentCourses[idx].name = value;

        saveCoursesToStorage();
        calculateGpaMetrics();
    }
}

function addCourseRow() {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    studentCourses.push({
        name: isRtl ? `مقرر جديد ${studentCourses.length + 1}` : `New Course ${studentCourses.length + 1}`,
        hours: 3,
        grade: 3.7
    });
    saveCoursesToStorage();
    renderCourseRows();
}

function removeCourseRow(idx) {
    if (studentCourses.length <= 1) {
        const isEn = document.documentElement.getAttribute('lang') === 'en';
        showNotification(isEn
            ? 'At least one course is required.'
            : 'يجب أن تحتوي الحاسبة على مادة واحدة على الأقل.');
        return;
    }
    studentCourses.splice(idx, 1);
    saveCoursesToStorage();
    renderCourseRows();
}

function calculateGpaMetrics() {
    let totalCredits = 0;
    let totalQualityPoints = 0;

    studentCourses.forEach(c => {
        totalCredits += c.hours;
        totalQualityPoints += (c.hours * c.grade);
    });

    const calculatedGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0.00;
    const gpaDisplay = calculatedGpa.toFixed(2);

    // قيمة المؤشر: تُحسب أمام الطالب بدل أن تقفز فجأة
    const valElem = document.getElementById('gpa-metric-value');
    if (valElem) {
        if (typeof window.animateNumber === 'function') {
            window.animateNumber(valElem, calculatedGpa, 2);
        } else {
            valElem.textContent = gpaDisplay;
        }
    }

    // Update gauge SVG ring
    const ringFill = document.getElementById('gpa-ring-fill');
    if (ringFill) {
        const offset = RING_CIRCUMFERENCE - (calculatedGpa / 4.0) * RING_CIRCUMFERENCE;
        ringFill.style.strokeDashoffset = Math.max(0, offset);
    }

    // Update Standing Chip
    const standingElem = document.getElementById('gpa-standing-badge');
    const isEn = document.documentElement.getAttribute('lang') === 'en';

    if (standingElem) {
        // الصنف يحمل لون النص والخلفية والحد معاً، فيبقيان متوافقين.
        // ضبط اللون وحده كان يترك الخلفية خضراء دائماً.
        let standingClass, standingText;
        if (calculatedGpa >= 3.65) {
            standingClass = 'standing-excellent';
            standingText = isEn ? 'Standing: Excellent (Honors)' : 'تقدير ممتاز مع مرتبة الشرف';
        } else if (calculatedGpa >= 3.00) {
            standingClass = 'standing-verygood';
            standingText = isEn ? 'Standing: Very Good' : 'تقدير جيد جداً';
        } else if (calculatedGpa >= 2.50) {
            standingClass = 'standing-good';
            standingText = isEn ? 'Standing: Good' : 'تقدير جيد';
        } else {
            standingClass = 'standing-pass';
            standingText = isEn ? 'Standing: Pass' : 'تقدير مقبول';
        }
        standingElem.className = 'gpa-standing-chip ' + standingClass;
        standingElem.textContent = standingText;
        standingElem.removeAttribute('style');
    }

    // Update Course count & credits summary
    const countElem = document.getElementById('gpa-summary-courses');
    if (countElem) countElem.textContent = studentCourses.length;

    const hoursElem = document.getElementById('gpa-summary-hours');
    if (hoursElem) hoursElem.textContent = totalCredits;

    // Update hero dashboard stat if exists
    const heroGpa = document.getElementById('hero-stat-gpa');
    if (heroGpa) {
        if (typeof window.animateNumber === 'function') {
            window.animateNumber(heroGpa, calculatedGpa, 2);
        } else {
            heroGpa.textContent = gpaDisplay;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedCourses();
    renderCourseRows();
});
