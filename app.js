const STORAGE_KEY = "pn_supervision_records_v1";

const teacherNames = [
  "นายเทพเทวัญ ดวงดี",
  "นางปนัดดา ศรีสะอาด",
  "นายสุเมธ เที่ยงดาห์",
  "นายศุภฤกษ์ ทัศน์เจริญ",
  "นายณรัฐ จันทจร",
  "นางสาวสายสมร ทองก้านเหลือง",
  "นางเอื้อมพร ทัศน์เจริญ",
  "นางดัชนี จันทจร",
  "นางจิรฉัตร เกี่ยสุวรรณศิลป์",
  "นางสาววิชุตา ไลออน",
  "นางสาวสุกัญญา ขันหนองจอก",
  "นางสาวจิตรานันท์ นนจันทร์",
  "นางบุษราภรณ์ ชาวทอง",
  "นายอภิเดช พันธ์แซง",
  "นางสาวจันทมรี ไปหนี้",
  "นางสาวสิรินันทา สุนทรศิลป์",
  "นางสาววรรณกมลภ์ แสงแก้ว",
  "นางสาวลัดดาวัลย์ ขันขวา",
  "นางปิยะฉัตร แสงอินทร์",
  "นางสาวขนิษฐา อิ่มสำอางค์",
  "นายภูวดล บรรทัดเรียน",
  "นางสาวศศิธร นุ่นภักดี",
  "นางสาววรรณลี พูลสวัสดิ์",
  "นางสาวธีราพร ถนอมสัตย์",
  "นางวัชรี สิงห์สู่ถ้ำ",
  "นางสาวอรพรรณ หม่อมกระโทก",
  "นางสาวศริญญา ญาณสิทธิ์",
  "นางปทุมกาญจน์ เกื้อวงศ์ตระกูล",
  "นางสาวจิราพรรณ เกษามา",
  "นางเสาวนีย์ ศรีเศรษฐา",
  "นางสาวสิริแพรว คงสบาย",
  "นางสาวธนิษฐา เสนาวงค์",
  "นางสาวศรัณย์ยา ศักดาสินธุ์",
  "นางนภาพร หลี่",
  "นางสาวกาญจนา ยศมา",
  "นางสาววรรณภา พงษ์ซื่อ",
  "นางสาวกิตยาพร คัมภีระ",
  "นางรัตนาภรณ์ นาโม",
  "นางสาวดวงพร อาจเดช",
  "นางสาวกุลขวัญ โอษะคลัง"
];

const categories = [
  {
    id: "planning",
    title: "ด้านการวางแผนการจัดการเรียนรู้",
    items: [
      "มีแผนการจัดการเรียนรู้ครบถ้วน",
      "จุดประสงค์การเรียนรู้ชัดเจน",
      "เนื้อหาสอดคล้องกับตัวชี้วัด",
      "เตรียมสื่อ/อุปกรณ์เหมาะสม"
    ]
  },
  {
    id: "activities",
    title: "ด้านการจัดกิจกรรมการเรียนรู้",
    items: [
      "เปิดโอกาสให้นักเรียนมีส่วนร่วม",
      "ใช้วิธีสอนที่หลากหลาย",
      "ส่งเสริมการคิดวิเคราะห์",
      "ใช้คำถามกระตุ้นการเรียนรู้",
      "บริหารเวลาเหมาะสม"
    ]
  },
  {
    id: "media",
    title: "ด้านสื่อและเทคโนโลยี",
    items: [
      "ใช้สื่อการเรียนรู้อย่างเหมาะสม",
      "ใช้เทคโนโลยีสนับสนุนการสอน",
      "สื่อช่วยให้นักเรียนเข้าใจบทเรียน"
    ]
  },
  {
    id: "climate",
    title: "ด้านบรรยากาศในชั้นเรียน",
    items: [
      "ห้องเรียนมีบรรยากาศเอื้อต่อการเรียนรู้",
      "นักเรียนมีความกระตือรือร้น",
      "ครูดูแลนักเรียนทั่วถึง"
    ]
  },
  {
    id: "assessment",
    title: "ด้านการวัดและประเมินผล",
    items: [
      "มีการประเมินระหว่างเรียน",
      "วิธีประเมินสอดคล้องกับจุดประสงค์",
      "ให้ข้อมูลย้อนกลับแก่นักเรียน"
    ]
  }
].map((category) => ({
  ...category,
  items: category.items.map((label, index) => ({
    id: `${category.id}_${index + 1}`,
    label
  }))
}));

let selectedFiles = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const form = $("#supervisionForm");
const assessmentContainer = $("#assessmentContainer");
const imageInput = $("#evidenceInput");
const imagePreview = $("#imagePreview");
const toast = $("#toast");
const reportDialog = $("#reportDialog");
const reportContent = $("#reportContent");

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function getQuality(average) {
  if (average >= 4.5) return "ดีเยี่ยม";
  if (average >= 3.5) return "ดี";
  if (average >= 2.5) return "พอใช้";
  return "ควรปรับปรุง";
}

function renderAssessment() {
  assessmentContainer.innerHTML = categories
    .map(
      (category) => `
        <article class="assessment-card">
          <div class="assessment-title">${category.title}</div>
          ${category.items
            .map(
              (item) => `
                <div class="assessment-row">
                  <div>${item.label}</div>
                  <div class="rating-group" role="radiogroup" aria-label="${item.label}">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (score) => `
                          <label class="rating-pill">
                            <input type="radio" name="${item.id}" value="${score}" required />
                            <span>${score}</span>
                          </label>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              `
            )
            .join("")}
        </article>
      `
    )
    .join("");
}

function renderTeacherOptions() {
  $("#teacherOptions").innerHTML = teacherNames
    .map((name) => `<option value="${name}"></option>`)
    .join("");
}

function setAllRatings(score) {
  categories.forEach((category) => {
    category.items.forEach((item) => {
      const input = form.querySelector(`input[name="${item.id}"][value="${score}"]`);
      if (input) input.checked = true;
    });
  });
  updateLiveSummary();
  showToast(`เลือกคะแนน ${score} ทุกข้อแล้ว`);
}

function collectRatings() {
  const ratings = {};
  categories.forEach((category) => {
    category.items.forEach((item) => {
      const checked = form.querySelector(`input[name="${item.id}"]:checked`);
      ratings[item.id] = checked ? Number(checked.value) : 0;
    });
  });
  return ratings;
}

function calculateScores(ratings) {
  const categoryAverages = {};
  let total = 0;
  let count = 0;

  categories.forEach((category) => {
    const values = category.items.map((item) => ratings[item.id] || 0).filter(Boolean);
    const categoryAverage = values.length
      ? values.reduce((sum, score) => sum + score, 0) / values.length
      : 0;
    categoryAverages[category.id] = Number(categoryAverage.toFixed(2));
    total += values.reduce((sum, score) => sum + score, 0);
    count += values.length;
  });

  const average = count ? Number((total / count).toFixed(2)) : 0;
  return {
    total,
    count,
    average,
    quality: average ? getQuality(average) : "-",
    categoryAverages
  };
}

function updateLiveSummary() {
  const scores = calculateScores(collectRatings());
  $("#liveAverage").textContent = scores.average.toFixed(2);
  $("#liveQuality").textContent = scores.quality;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function imageToPayload(file) {
  const dataUrl = await resizeImage(file);
  return {
    name: file.name,
    type: "image/jpeg",
    size: file.size,
    dataUrl,
    base64: dataUrl.split(",")[1]
  };
}

async function resizeImage(file) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function renderImagePreview() {
  imagePreview.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const tile = document.createElement("div");
    tile.className = "image-tile";
    tile.innerHTML = `<img src="${url}" alt="หลักฐานรูปที่ ${index + 1}" /><span>รูปที่ ${index + 1}</span>`;
    imagePreview.appendChild(tile);
  });
}

function getFormDataObject() {
  const data = new FormData(form);
  return {
    teacherName: data.get("teacherName").trim(),
    learningArea: data.get("learningArea").trim(),
    course: data.get("course").trim(),
    gradeLevel: data.get("gradeLevel").trim(),
    supervisionDate: data.get("supervisionDate"),
    supervisionTime: data.get("supervisionTime"),
    supervisorName: data.get("supervisorName").trim(),
    supervisorPosition: data.get("supervisorPosition").trim(),
    strengths: data.get("strengths").trim(),
    recommendations: data.get("recommendations").trim(),
    developmentPlan: data.get("developmentPlan").trim()
  };
}

function validateRecord(ratings) {
  const missingRating = categories.some((category) =>
    category.items.some((item) => !ratings[item.id])
  );
  if (missingRating) {
    showToast("กรุณาให้คะแนนครบทุกข้อ");
    return false;
  }
  if (selectedFiles.length < 4) {
    showToast("กรุณาอัปโหลดรูปภาพอย่างน้อย 4 รูป");
    return false;
  }
  return true;
}

async function saveToServer(record, images) {
  const result = await fetchJson(apiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify({
      record: {
        ...record,
        images: images.map(({ base64, ...image }) => image)
      },
      images
    })
  });

  if (!result.ok) {
    throw new Error(result.message || "บันทึกลง server ไม่สำเร็จ");
  }

  return result;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const ratings = collectRatings();
  if (!validateRecord(ratings)) return;

  const scores = calculateScores(ratings);
  const images = await Promise.all(selectedFiles.map(imageToPayload));
  const record = {
    id: `PN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    general: getFormDataObject(),
    ratings,
    scores,
    storage: { saved: false },
    images: images.map(({ base64, ...image }) => image)
  };

  try {
    const serverResult = await saveToServer(record, images);
    if (serverResult.ok) {
      Object.assign(record, serverResult.record);
      showToast("บันทึกลง server ของ Codex แล้ว");
    } else {
      showToast("บันทึกในเครื่องแล้ว แต่ยังไม่ได้บันทึกลง server");
    }
  } catch (error) {
    record.storage = { saved: false, error: error.message };
    showToast(`บันทึกในเครื่องแล้ว แต่ server แจ้งว่า: ${error.message}`);
  }

  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);
  resetForm();
  renderAll();
  switchTab("dashboard");
}

function resetForm() {
  form.reset();
  form.elements.learningArea.value = "ภาษาต่างประเทศ";
  selectedFiles = [];
  imagePreview.innerHTML = "";
  updateLiveSummary();
}

function switchTab(tab) {
  $$(".nav-tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#${tab}Panel`).classList.add("active");
  const titles = {
    form: "แบบบันทึกการนิเทศการจัดการเรียนรู้",
    dashboard: "Dashboard การนิเทศรวม",
    reports: "รายงานการนิเทศรายบุคคล",
    settings: "ที่เก็บข้อมูลออนไลน์"
  };
  $("#pageTitle").textContent = titles[tab];
}

function isOnlineDeployment() {
  return !["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

function apiUrl() {
  return isOnlineDeployment()
    ? "/.netlify/functions/supervision-records"
    : "/api/supervision-records";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const trimmed = text.trim();
    const looksLikeHtml = trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html");
    if (looksLikeHtml && isOnlineDeployment()) {
      throw new Error("Netlify Function ยังไม่ได้ deploy หรือไฟล์ functions/supervision-records.js ไม่ได้ถูกอัปขึ้นเว็บ");
    }
    throw new Error(trimmed.slice(0, 180) || "server ไม่ได้ตอบกลับเป็น JSON");
  }

  const result = JSON.parse(text);
  if (!response.ok) {
    throw new Error(result.message || `server ตอบกลับสถานะ ${response.status}`);
  }
  return result;
}

function renderServerStatus() {
  const status = $("#serverStatus");
  status.classList.add("connected");
  status.querySelector("span:last-child").textContent = isOnlineDeployment()
    ? "บันทึกออนไลน์ด้วย Netlify Blobs"
    : "บันทึกลง server local";
}

function average(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function renderDashboard() {
  const records = loadRecords();
  const teachers = new Set(records.map((record) => record.general.teacherName).filter(Boolean));
  $("#metricTotal").textContent = records.length;
  $("#metricAverage").textContent = average(records.map((record) => record.scores.average)).toFixed(2);
  $("#metricTeachers").textContent = teachers.size;
  $("#metricServer").textContent = records.filter((record) => record.storage?.saved).length;

  $("#categoryBars").innerHTML = categories
    .map((category) => {
      const value = average(records.map((record) => record.scores.categoryAverages[category.id]));
      return `
        <div class="bar-row">
          <strong>${category.title.replace("ด้าน", "")}</strong>
          <div class="bar-track"><div class="bar-fill" style="width:${(value / 5) * 100}%"></div></div>
          <span>${value.toFixed(2)}</span>
        </div>
      `;
    })
    .join("");

  const qualityLabels = ["ดีเยี่ยม", "ดี", "พอใช้", "ควรปรับปรุง"];
  $("#qualityChart").innerHTML = qualityLabels
    .map((label) => {
      const count = records.filter((record) => record.scores.quality === label).length;
      return `
        <div class="quality-item">
          <strong>${label}</strong>
          <span>${count} รายการ</span>
        </div>
      `;
    })
    .join("");

  $("#latestTable").innerHTML =
    records.slice(0, 10).map((record) => reportRow(record)).join("") ||
    `<tr><td colspan="6">ยังไม่มีข้อมูลการนิเทศ</td></tr>`;
}

function reportRow(record) {
  return `
    <tr>
      <td>${formatDate(record.general.supervisionDate)}</td>
      <td>${record.general.teacherName}</td>
      <td>${record.general.course}</td>
      <td>${record.general.gradeLevel}</td>
      <td>${record.scores.average.toFixed(2)}</td>
      <td><span class="quality-badge">${record.scores.quality}</span></td>
    </tr>
  `;
}

function renderReports() {
  const keyword = ($("#reportSearch").value || "").trim().toLowerCase();
  const records = loadRecords().filter((record) => {
    const haystack = [
      record.general.teacherName,
      record.general.course,
      record.general.gradeLevel,
      record.general.supervisorName
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(keyword);
  });

  $("#reportCards").innerHTML =
    records
      .map(
        (record) => `
          <article class="report-card">
            <div>
              <h3>${record.general.teacherName}</h3>
              <p>${record.general.course} · ${record.general.gradeLevel} · ${formatDate(record.general.supervisionDate)}</p>
              <span class="quality-badge">${record.scores.quality} (${record.scores.average.toFixed(2)})</span>
            </div>
            <button class="primary-button" type="button" data-report-id="${record.id}">เปิดรายงาน</button>
          </article>
        `
      )
      .join("") || `<div class="form-section">ยังไม่มีรายงานที่ตรงกับการค้นหา</div>`;
}

function renderReport(record) {
  const ratingRows = categories
    .map(
      (category) => `
        <tr><th colspan="3">${category.title}</th></tr>
        ${category.items
          .map(
            (item) => `
              <tr>
                <td>${item.label}</td>
                <td style="width:80px;text-align:center">${record.ratings[item.id]}</td>
                <td style="width:120px;text-align:center">${scoreText(record.ratings[item.id])}</td>
              </tr>
            `
          )
          .join("")}
      `
    )
    .join("");

  reportContent.innerHTML = `
    <h2>รายงานการนิเทศการจัดการเรียนรู้</h2>
    <div class="print-grid">
      <div><strong>ชื่อครูผู้สอน:</strong> ${record.general.teacherName}</div>
      <div><strong>กลุ่มสาระ:</strong> ${record.general.learningArea}</div>
      <div><strong>รายวิชา:</strong> ${record.general.course}</div>
      <div><strong>ระดับชั้น:</strong> ${record.general.gradeLevel}</div>
      <div><strong>วันที่นิเทศ:</strong> ${formatDate(record.general.supervisionDate)}</div>
      <div><strong>เวลา:</strong> ${record.general.supervisionTime || "-"}</div>
      <div><strong>ผู้นิเทศ:</strong> ${record.general.supervisorName}</div>
      <div><strong>ตำแหน่ง:</strong> ${record.general.supervisorPosition || "-"}</div>
    </div>
    <table class="print-table">
      <thead><tr><th>รายการประเมิน</th><th>คะแนน</th><th>ความหมาย</th></tr></thead>
      <tbody>${ratingRows}</tbody>
    </table>
    <div class="print-grid">
      <div><strong>คะแนนรวม:</strong> ${record.scores.total}/${record.scores.count * 5}</div>
      <div><strong>คะแนนเฉลี่ย:</strong> ${record.scores.average.toFixed(2)}</div>
      <div><strong>ระดับคุณภาพ:</strong> ${record.scores.quality}</div>
      <div><strong>สถานะ Server:</strong> ${record.storage?.saved ? "บันทึกแล้ว" : "ยังไม่สำเร็จ"}</div>
    </div>
    <h3>จุดเด่น</h3>
    <p>${plainText(record.general.strengths)}</p>
    <h3>ข้อเสนอแนะเพื่อพัฒนา</h3>
    <p>${plainText(record.general.recommendations)}</p>
    <h3>แนวทางพัฒนาเพิ่มเติม</h3>
    <p>${plainText(record.general.developmentPlan)}</p>
    <h3>หลักฐานประกอบการนิเทศ</h3>
    <div class="print-images">
      ${record.images
        .slice(0, 8)
        .map((image, index) => `<img src="${image.dataUrl || image.localUrl}" alt="หลักฐานรูปที่ ${index + 1}" />`)
        .join("")}
    </div>
    <p style="margin-top:28px;text-align:right">ลงชื่อผู้นิเทศ ________________________________</p>
    <p style="text-align:right">(${record.general.supervisorName})</p>
    <p style="text-align:right">ตำแหน่ง ${record.general.supervisorPosition || "________________________"}</p>
  `;
}

function plainText(value) {
  return (value || "-").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br />");
}

function scoreText(score) {
  return {
    5: "ดีเยี่ยม",
    4: "ดี",
    3: "พอใช้",
    2: "ควรปรับปรุง",
    1: "ต้องปรับปรุงเร่งด่วน"
  }[score];
}

function renderSettings() {
  const status = $("#serverStorageStatus");
  const location = $("#storageLocationLabel");
  if (status) status.textContent = "พร้อมบันทึก";
  if (location) {
    location.textContent = isOnlineDeployment()
      ? "Netlify Blobs: supervision-records"
      : "data/supervision-records";
  }
}

function renderAll() {
  renderServerStatus();
  renderDashboard();
  renderReports();
  renderSettings();
}

function exportCsv() {
  const records = loadRecords();
  const header = [
    "วันที่",
    "เวลา",
    "ครูผู้สอน",
    "กลุ่มสาระ",
    "รายวิชา",
    "ระดับชั้น",
    "ผู้นิเทศ",
    "คะแนนเฉลี่ย",
    "ระดับคุณภาพ",
    "บันทึก Server"
  ];
  const rows = records.map((record) => [
    record.general.supervisionDate,
    record.general.supervisionTime,
    record.general.teacherName,
    record.general.learningArea,
    record.general.course,
    record.general.gradeLevel,
    record.general.supervisorName,
    record.scores.average,
    record.scores.quality,
    record.storage?.saved ? "yes" : "no"
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pn-supervision-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function testServerConnection() {
  try {
    const result = await fetchJson(apiUrl());
    showToast(result.ok ? "เชื่อมต่อที่เก็บข้อมูลสำเร็จ" : result.message || "ทดสอบไม่สำเร็จ");
  } catch (error) {
    showToast(`ทดสอบไม่สำเร็จ: ${error.message}`);
  }
}

async function loadRecordsFromServer() {
  try {
    const result = await fetchJson(apiUrl());
    if (!result.ok) throw new Error(result.message || "โหลดข้อมูลจาก server ไม่สำเร็จ");
    saveRecords(result.records || []);
  } catch (error) {
    showToast(`ใช้ข้อมูลใน browser ชั่วคราว: ${error.message}`);
  }
}

async function clearAllRecords() {
  if (!confirm("ต้องการล้างข้อมูลการนิเทศทั้งหมดทั้งใน browser และ server หรือไม่?")) return;
  saveRecords([]);
  const headers = {};
  if (isOnlineDeployment()) {
    const token = prompt("กรอก admin token สำหรับล้างข้อมูลออนไลน์");
    if (!token) {
      renderAll();
      showToast("ล้างข้อมูลใน browser แล้ว แต่ยังไม่ได้ล้างข้อมูลออนไลน์");
      return;
    }
    headers["x-admin-token"] = token;
  }
  try {
    const result = await fetchJson(apiUrl(), { method: "DELETE", headers });
    if (!result.ok) throw new Error(result.message || "ล้างข้อมูลบน server ไม่สำเร็จ");
    showToast("ล้างข้อมูลทั้งหมดแล้ว");
  } catch (error) {
    showToast(`ล้างข้อมูลใน browser แล้ว แต่ที่เก็บออนไลน์แจ้งว่า: ${error.message}`);
  }
  renderAll();
}

function bindEvents() {
  $$(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  assessmentContainer.addEventListener("change", updateLiveSummary);
  imageInput.addEventListener("change", () => {
    selectedFiles = Array.from(imageInput.files || []);
    renderImagePreview();
  });
  form.addEventListener("submit", handleSubmit);

  $("#newRecordBtn").addEventListener("click", () => {
    resetForm();
    switchTab("form");
  });
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#reportSearch").addEventListener("input", renderReports);
  $("#reportCards").addEventListener("click", (event) => {
    const button = event.target.closest("[data-report-id]");
    if (!button) return;
    const record = loadRecords().find((item) => item.id === button.dataset.reportId);
    if (!record) return;
    renderReport(record);
    reportDialog.showModal();
  });
  $("#closeReportBtn").addEventListener("click", () => reportDialog.close());
  $("#printReportBtn").addEventListener("click", () => window.print());
  $("#clearDataBtn").addEventListener("click", clearAllRecords);
  $("#settingsForm").addEventListener("submit", (event) => event.preventDefault());
  $("#testServerBtn").addEventListener("click", testServerConnection);

  $$(".quick-score-buttons button").forEach((button) => {
    button.addEventListener("click", () => setAllRatings(Number(button.dataset.scoreAll)));
  });
}

async function init() {
  renderTeacherOptions();
  renderAssessment();
  bindEvents();
  await loadRecordsFromServer();
  renderAll();
  updateLiveSummary();
}

init();
