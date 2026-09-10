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

function renderCourseRows() {
    const container = document.getElementById('gpa-courses-list');
    if (!container) return;

    container.innerHTML = '';

    studentCourses.forEach((c, idx) => {
        const row = document.createElement('div');
        row.className = 'gpa-row-item';
        row.innerHTML = `
            <div>
                <input type="text" class="input-field" value="${c.name}" onchange="updateCourseField(${idx}, 'name', this.value)">
            </div>
            <div>
                <select class="input-field" onchange="updateCourseField(${idx}, 'hours', this.value)">
                    <option value="1" ${c.hours === 1 ? 'selected' : ''}>1</option>
                    <option value="2" ${c.hours === 2 ? 'selected' : ''}>2</option>
                    <option value="3" ${c.hours === 3 ? 'selected' : ''}>3</option>
                    <option value="4" ${c.hours === 4 ? 'selected' : ''}>4</option>
                </select>
            </div>
            <div>
                <select class="input-field" onchange="updateCourseField(${idx}, 'grade', this.value)">
                    <option value="4.0" ${c.grade === 4.0 ? 'selected' : ''}>A+ (4.00)</option>
                    <option value="3.7" ${c.grade === 3.7 ? 'selected' : ''}>A (3.70)</option>
                    <option value="3.3" ${c.grade === 3.3 ? 'selected' : ''}>B+ (3.30)</option>
                    <option value="3.0" ${c.grade === 3.0 ? 'selected' : ''}>B (3.00)</option>
                    <option value="2.7" ${c.grade === 2.7 ? 'selected' : ''}>C+ (2.70)</option>
                    <option value="2.4" ${c.grade === 2.4 ? 'selected' : ''}>C (2.40)</option>
                    <option value="2.0" ${c.grade === 2.0 ? 'selected' : ''}>D+ (2.00)</option>
                    <option value="1.7" ${c.grade === 1.7 ? 'selected' : ''}>D (1.70)</option>
                    <option value="0.0" ${c.grade === 0.0 ? 'selected' : ''}>F (0.00)</option>
                </select>
            </div>
            <div style="display: flex; justify-content: center;">
                <button type="button" class="btn-icon-danger" onclick="removeCourseRow(${idx})" title="Remove">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
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
        alert(document.documentElement.getAttribute('lang') === 'en' ? "At least one course is required." : "يجب أن تحتوي الحاسبة على مادة واحدة على الأقل.");
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

    // Update gauge text
    const valElem = document.getElementById('gpa-metric-value');
    if (valElem) valElem.textContent = gpaDisplay;

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
        if (calculatedGpa >= 3.65) {
            standingElem.textContent = isEn ? "Standing: Excellent (Honors)" : "تقدير ممتاز مع مرتبة الشرف";
            standingElem.style.color = "var(--accent-emerald)";
        } else if (calculatedGpa >= 3.00) {
            standingElem.textContent = isEn ? "Standing: Very Good" : "تقدير جيد جداً";
            standingElem.style.color = "var(--accent-cyan)";
        } else if (calculatedGpa >= 2.50) {
            standingElem.textContent = isEn ? "Standing: Good" : "تقدير جيد";
            standingElem.style.color = "var(--accent-amber)";
        } else {
            standingElem.textContent = isEn ? "Standing: Pass" : "تقدير مقبول";
            standingElem.style.color = "var(--muc-bright-red)";
        }
    }

    // Update Course count & credits summary
    const countElem = document.getElementById('gpa-summary-courses');
    if (countElem) countElem.textContent = studentCourses.length;

    const hoursElem = document.getElementById('gpa-summary-hours');
    if (hoursElem) hoursElem.textContent = totalCredits;

    // Update hero dashboard stat if exists
    const heroGpa = document.getElementById('hero-stat-gpa');
    if (heroGpa) heroGpa.textContent = gpaDisplay;
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedCourses();
    renderCourseRows();
});
