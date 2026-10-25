const percentageForm = document.querySelector("#percentage-form");
const percentageInput = document.querySelector("#percentage");
const amountInput = document.querySelector("#amount");

const resultBox = document.querySelector("#result");
const resultValue = document.querySelector("#result-value");
const copyButton = document.querySelector("#copy-result");

const yearElement = document.querySelector("#year");

yearElement.textContent = new Date().getFullYear();

percentageForm.addEventListener("submit", function (event) {
event.preventDefault();

const percentage = Number(percentageInput.value);
const amount = Number(amountInput.value);

if (
percentageInput.value.trim() === "" ||
amountInput.value.trim() === "" ||
!Number.isFinite(percentage) ||
!Number.isFinite(amount) ||
percentage < 0 ||
percentage > 1000000 ||
amount < -1000000000000 ||
amount > 1000000000000
) {
resultBox.hidden = false;
resultValue.textContent = "Please enter valid numbers.";
copyButton.hidden = true;
return;
}

const result = (percentage / 100) * amount;

if (!Number.isFinite(result)) {
resultBox.hidden = false;
resultValue.textContent = "Result is outside the supported range.";
copyButton.hidden = true;
return;
}

resultBox.hidden = false;
resultValue.textContent = new Intl.NumberFormat("en-US", {
maximumFractionDigits: 8
}).format(result);

copyButton.hidden = false;
});

copyButton.addEventListener("click", async function () {
try {
await navigator.clipboard.writeText(resultValue.textContent);
copyButton.textContent = "Copied!";

setTimeout(function () {
copyButton.textContent = "Copy result";
}, 1500);
} catch {
copyButton.textContent = "Copy unavailable";
}
});
/* SmartKit Tools — Integrated GPA & CGPA Calculator */
(() => {
const $ = id => document.getElementById(id);

const courses = $("semester-courses");
const semesterResult = $("semester-result");
const semesterRows = $("cgpa-semesters");
const cgpaResult = $("cgpa-result");
const levelResults = $("cgpa-level-results");

if (!courses || !semesterRows) return;

const levels = ["100", "200", "300", "400", "500", "600", "700"];
let lastSemesterSummary = null;

function addCourse() {
const row = document.createElement("tr");
row.innerHTML = `
<td><input class="course-code" type="text"
placeholder="CSC201" aria-label="Course code"></td>
<td><input class="course-score" type="number"
min="0" max="100" step="any" placeholder="Score"
aria-label="Course score" required></td>
<td><input class="course-units" type="number"
min="1" max="10" step="1" value="2"
aria-label="Course units" required></td>
<td><input class="course-gp" type="number"
min="0" step="any" placeholder="GP"
aria-label="Course GP" required></td>
<td><button type="button" class="course-remove">Remove</button></td>
`;
courses.appendChild(row);

row.querySelector(".course-remove").addEventListener("click", () => {
row.remove();
lastSemesterSummary = null;
});

row.addEventListener("input", () => {
lastSemesterSummary = null;
});
}

function calculateSemester() {
const rows = [...courses.querySelectorAll("tr")];

if (!rows.length) {
semesterResult.textContent = "Add at least one course first.";
lastSemesterSummary = null;
return;
}

let units = 0;
let points = 0;

for (const row of rows) {
const scoreText = row.querySelector(".course-score").value.trim();
const unitsText = row.querySelector(".course-units").value.trim();
const gpText = row.querySelector(".course-gp").value.trim();

const score = Number(scoreText);
const unit = Number(unitsText);
const gp = Number(gpText);

if (
scoreText === "" || !Number.isFinite(score) ||
score < 0 || score > 100 ||
unitsText === "" || !Number.isInteger(unit) ||
unit < 1 || unit > 10 ||
gpText === "" || !Number.isFinite(gp) || gp < 0
) {
semesterResult.textContent =
"Check each course: enter a score from 0–100, valid units, and the GP from your portal.";
lastSemesterSummary = null;
return;
}

units += unit;
points += gp;
}

if (units <= 0) {
semesterResult.textContent = "Total units must be greater than zero.";
lastSemesterSummary = null;
return;
}

const gpa = points / units;
lastSemesterSummary = { units, points, gpa };

semesterResult.textContent =
`Total units: ${units} | Total GP: ${points.toFixed(2)} | ` +
`Calculated GPA: ${gpa.toFixed(2)}`;
}

function addSemester(level = "100", semester = "1", unit = "", points = "", portal = "") {
const row = document.createElement("tr");

row.innerHTML = `
<td><select class="entry-level" aria-label="Level">
${levels.map(levelNumber =>
`<option value="${levelNumber}">${levelNumber} Level</option>`
).join("")}
</select></td>
<td><select class="entry-semester" aria-label="Semester">
<option value="1">First</option>
<option value="2">Second</option>
</select></td>
<td><input class="entry-units" type="number" min="1"
step="1" placeholder="Units" aria-label="Total units" required></td>
<td><input class="entry-points" type="number" min="0"
step="any" placeholder="Total GP" aria-label="Total GP" required></td>
<td><input class="entry-portal" type="number" min="0"
step="any" placeholder="Optional" aria-label="Portal GPA"></td>
<td><button type="button" class="entry-remove">Remove</button></td>
`;

semesterRows.appendChild(row);
row.querySelector(".entry-level").value = level;
row.querySelector(".entry-semester").value = semester;
row.querySelector(".entry-units").value = unit;
row.querySelector(".entry-points").value = points;
row.querySelector(".entry-portal").value = portal;

row.querySelector(".entry-remove").addEventListener("click", () => {
row.remove();
});
}

function transferTotals() {
if (!lastSemesterSummary) {
semesterResult.textContent =
"Calculate the semester GPA successfully before transferring totals.";
return;
}

const level = $("transfer-level").value;
const semester = $("transfer-semester").value;

let row = [...semesterRows.querySelectorAll("tr")].find(item =>
item.querySelector(".entry-level").value === level &&
item.querySelector(".entry-semester").value === semester
);

if (!row) {
addSemester(level, semester);
row = semesterRows.lastElementChild;
}

row.querySelector(".entry-units").value = lastSemesterSummary.units;
row.querySelector(".entry-points").value = lastSemesterSummary.points;

cgpaResult.textContent =
`${level} Level ${semester === "1" ? "first" : "second"} semester totals transferred. ` +
"Enter the portal GPA if you want to compare it, then calculate CGPA.";
}

function calculateCGPA() {
const rows = [...semesterRows.querySelectorAll("tr")];

if (!rows.length) {
cgpaResult.textContent = "Add at least one semester.";
levelResults.replaceChildren();
return;
}

const entries = [];
const seen = new Set();

for (const row of rows) {
const level = row.querySelector(".entry-level").value;
const semester = row.querySelector(".entry-semester").value;
const unitsText = row.querySelector(".entry-units").value.trim();
const pointsText = row.querySelector(".entry-points").value.trim();
const portalText = row.querySelector(".entry-portal").value.trim();

const unit = Number(unitsText);
const points = Number(pointsText);
const portal = portalText === "" ? null : Number(portalText);
const key = `${level}-${semester}`;

if (seen.has(key)) {
cgpaResult.textContent =
`There is more than one entry for ${level} Level, semester ${semester}.`;
levelResults.replaceChildren();
return;
}

if (
unitsText === "" || !Number.isInteger(unit) || unit <= 0 ||
pointsText === "" || !Number.isFinite(points) || points < 0 ||
(portal !== null && (!Number.isFinite(portal) || portal < 0))
) {
cgpaResult.textContent =
"Enter valid total units and total GP for every semester.";
levelResults.replaceChildren();
return;
}

seen.add(key);
entries.push({ level, semester, unit, points, portal });
}

entries.sort((a, b) =>
Number(a.level) - Number(b.level) ||
Number(a.semester) - Number(b.semester)
);

const totalUnits = entries.reduce((sum, item) => sum + item.unit, 0);
const totalPoints = entries.reduce((sum, item) => sum + item.points, 0);
const cgpa = totalPoints / totalUnits;

cgpaResult.textContent =
`Overall CGPA: ${cgpa.toFixed(2)} | Total units: ${totalUnits} | ` +
`Total GP: ${totalPoints.toFixed(2)}`;

levelResults.replaceChildren();

const heading = document.createElement("h3");
heading.textContent = "Results by level";
levelResults.appendChild(heading);

for (const level of levels) {
const levelEntries = entries.filter(item => item.level === level);
if (!levelEntries.length) continue;

const units = levelEntries.reduce((sum, item) => sum + item.unit, 0);
const points = levelEntries.reduce((sum, item) => sum + item.points, 0);
const card = document.createElement("div");
card.className = "cgpa-result";
card.style.marginTop = "12px";

const title = document.createElement("strong");
title.textContent = `${level} Level GPA: ${(points / units).toFixed(2)}`;
card.appendChild(title);

const detail = document.createElement("p");
detail.textContent =
`${units} total units · ${points.toFixed(2)} total GP`;
card.appendChild(detail);

for (const item of levelEntries) {
const calculated = item.points / item.unit;
const line = document.createElement("p");
const name = item.semester === "1" ? "First semester" : "Second semester";

if (item.portal === null) {
line.textContent = `${name}: calculated GPA ${calculated.toFixed(2)}.`;
} else {
const matches = Math.abs(calculated - item.portal) < 0.005;
line.textContent = matches
? `${name}: ${calculated.toFixed(2)} — matches portal GPA.`
: `${name}: calculated ${calculated.toFixed(2)}, portal ${item.portal.toFixed(2)} — check the figures.`;
}

card.appendChild(line);
}

levelResults.appendChild(card);
}
}

function resetSemester() {
courses.replaceChildren();
addCourse();
addCourse();
addCourse();
lastSemesterSummary = null;
semesterResult.textContent = "Your semester result will appear here.";
}

function resetCGPA() {
semesterRows.replaceChildren();
addSemester("100", "1");
addSemester("100", "2");
cgpaResult.textContent = "Your cumulative result will appear here.";
levelResults.replaceChildren();
}

$("add-course").addEventListener("click", addCourse);
$("calculate-semester").addEventListener("click", calculateSemester);
$("reset-semester").addEventListener("click", resetSemester);
$("transfer-totals").addEventListener("click", transferTotals);
$("cgpa-add-semester").addEventListener("click", () => addSemester());
$("cgpa-calculate").addEventListener("click", calculateCGPA);
$("cgpa-reset").addEventListener("click", resetCGPA);

resetSemester();
resetCGPA();
})();
/* SmartKit Tools — Word & Character Counter */
(() => {
const input = document.getElementById("word-input");

// Avoid errors if this section is not on the current page.
if (!input) return;

const wordCount = document.getElementById("word-count");
const characterCount = document.getElementById("character-count");
const characterNoSpaces = document.getElementById("character-no-spaces");
const sentenceCount = document.getElementById("sentence-count");
const paragraphCount = document.getElementById("paragraph-count");
const readingTime = document.getElementById("reading-time");
const message = document.getElementById("word-message");

function updateCounts() {
const text = input.value;
const trimmed = text.trim();

const words = trimmed
? trimmed.split(/\s+/u).length
: 0;

const sentences = trimmed
? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/gu) || [])
.filter(sentence => sentence.trim().length > 0).length
: 0;

const paragraphs = trimmed
? trimmed.split(/\n\s*\n/u).filter(p => p.trim()).length
: 0;

const minutes = words === 0
? 0
: Math.ceil(words / 200);

wordCount.textContent = words;
characterCount.textContent = [...text].length;
characterNoSpaces.textContent = [...text.replace(/\s/gu, "")].length;
sentenceCount.textContent = sentences;
paragraphCount.textContent = paragraphs;
readingTime.textContent = `${minutes} min`;
}

input.addEventListener("input", updateCounts);

document.getElementById("clear-text").addEventListener("click", () => {
input.value = "";
updateCounts();
message.textContent = "Text cleared.";
input.focus();
});

document.getElementById("copy-text").addEventListener("click", async () => {
if (!input.value) {
message.textContent = "Enter some text first.";
return;
}

try {
await navigator.clipboard.writeText(input.value);
message.textContent = "Text copied successfully.";
} catch {
input.focus();
input.select();
message.textContent =
"Automatic copying was blocked. Your text is selected; copy it manually.";
}
});

updateCounts();
})();
/* SmartKit Tools — Complete Image Compressor */
(() => {
const $ = (id) => document.getElementById(id);

const fileInput = $("image-file");
const dropArea = $("image-drop-area");
const message = $("image-message");
const mode = $("compression-mode");
const targetOptions = $("target-size-options");
const targetSelect = $("target-size-value");
const customContainer = $("custom-size-container");
const customInput = $("custom-target-kb");
const qualityInput = $("image-quality");
const qualityValue = $("quality-value");
const widthInput = $("image-width");
const formatInput = $("image-format");
const compressButton = $("compress-image-btn");
const results = $("image-results");
const download = $("download-compressed");

if (
!fileInput || !dropArea || !message || !mode ||
!targetOptions || !targetSelect || !qualityInput ||
!widthInput || !formatInput || !compressButton || !results
) {
console.error("Image Compressor: One or more required HTML elements are missing.");
return;
}

let originalURL = null;
let compressedURL = null;

const showMessage = (text) => {
message.textContent = text;
};

mode.addEventListener("change", () => {
targetOptions.hidden = mode.value !== "target";
});

targetSelect.addEventListener("change", () => {
customContainer.hidden = targetSelect.value !== "custom";
});

qualityInput.addEventListener("input", () => {
if (qualityValue) qualityValue.textContent = `${qualityInput.value}%`;
});

fileInput.addEventListener("change", () => {
validateSelectedFile(fileInput.files[0]);
});

// Drag-and-drop support
["dragenter", "dragover"].forEach((eventName) => {
dropArea.addEventListener(eventName, (event) => {
event.preventDefault();
dropArea.classList.add("drag-over");
});
});

["dragleave", "drop"].forEach((eventName) => {
dropArea.addEventListener(eventName, (event) => {
event.preventDefault();
dropArea.classList.remove("drag-over");
});
});

dropArea.addEventListener("drop", (event) => {
const file = event.dataTransfer.files[0];
if (!file) return;

try {
const transfer = new DataTransfer();
transfer.items.add(file);
fileInput.files = transfer.files;
validateSelectedFile(file);
} catch {
showMessage("Please use the file picker to select your image.");
}
});

function validateSelectedFile(file) {
results.hidden = true;

if (!file) {
showMessage("");
return false;
}

const allowed = ["image/jpeg", "image/png", "image/webp"];

if (!allowed.includes(file.type)) {
fileInput.value = "";
showMessage("Please choose a JPG, PNG, or WebP image.");
return false;
}

if (file.size > 10 * 1024 * 1024) {
fileInput.value = "";
showMessage("This image is over 10 MB. Please choose a smaller image.");
return false;
}

showMessage(
`Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB).`
);
return true;
}

compressButton.addEventListener("click", async () => {
const file = fileInput.files[0];

if (!validateSelectedFile(file)) return;

let targetBytes = null;

if (mode.value === "target") {
const targetKB = targetSelect.value === "custom"
? Number(customInput.value)
: Number(targetSelect.value);

if (
!Number.isFinite(targetKB) ||
targetKB < 5 ||
targetKB > 10000
) {
showMessage("Enter a target between 5 KB and 10,000 KB.");
return;
}

targetBytes = targetKB * 1024;
}

compressButton.disabled = true;
compressButton.textContent = "Compressing...";
results.hidden = true;

try {
const image = await loadImage(file);

let width = image.naturalWidth;
let height = image.naturalHeight;

if (widthInput.value !== "original") {
const maxWidth = Number(widthInput.value);

if (width > maxWidth) {
height = Math.round(height * maxWidth / width);
width = maxWidth;
}
}

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;

const context = canvas.getContext("2d");

if (!context) {
throw new Error("Your browser could not process this image.");
}

const format = formatInput.value;

if (format === "image/jpeg") {
context.fillStyle = "#ffffff";
context.fillRect(0, 0, width, height);
}

context.drawImage(image, 0, 0, width, height);

let outputBlob;

if (mode.value === "target" && format !== "image/png") {
outputBlob = await compressToTarget(
canvas,
format,
targetBytes,
Number(qualityInput.value) / 100
);
} else {
outputBlob = await canvasToBlob(
canvas,
format,
format === "image/png"
? undefined
: Number(qualityInput.value) / 100
);
}

displayResults(file, outputBlob, format);

const actualKB = outputBlob.size / 1024;

if (mode.value === "target") {
const wantedKB = targetBytes / 1024;

if (format === "image/png") {
showMessage(
`PNG does not support quality-based size targeting. ` +
`Result: ${actualKB.toFixed(1)} KB. Try JPEG or WebP for target-size compression.`
);
} else if (outputBlob.size <= targetBytes) {
showMessage(
`Success! Your image is ${actualKB.toFixed(1)} KB, ` +
`within your ${wantedKB} KB target.`
);
} else {
showMessage(
`The closest result was ${actualKB.toFixed(1)} KB. ` +
`It could not reach ${wantedKB} KB at this image width. ` +
`Try a smaller width or WebP format.`
);
}
} else {
showMessage(`Compression complete. New size: ${actualKB.toFixed(1)} KB.`);
}
} catch (error) {
console.error("Image compression failed:", error);
showMessage(error.message || "Compression failed. Please try another image.");
} finally {
compressButton.disabled = false;
compressButton.textContent = "Compress Image";
}
});

async function compressToTarget(canvas, format, targetBytes, preferredQuality) {
let bestBlob = await canvasToBlob(canvas, format, 0.05);

// If even very low quality exceeds the target, return the smallest
// result available at this image width.
if (bestBlob.size > targetBytes) {
return bestBlob;
}

let low = 0.05;
let high = 1;

for (let i = 0; i < 12; i++) {
const quality = (low + high) / 2;
const blob = await canvasToBlob(canvas, format, quality);

if (blob.size <= targetBytes) {
bestBlob = blob;
low = quality;
} else {
high = quality;
}
}

// Try the user's preferred quality too, if it meets the target.
const preferredBlob = await canvasToBlob(
canvas, format, preferredQuality
);

if (
preferredBlob.size <= targetBytes &&
preferredBlob.size > bestBlob.size
) {
bestBlob = preferredBlob;
}

return bestBlob;
}

function loadImage(file) {
return new Promise((resolve, reject) => {
const url = URL.createObjectURL(file);
const image = new Image();

image.onload = () => {
URL.revokeObjectURL(url);
resolve(image);
};

image.onerror = () => {
URL.revokeObjectURL(url);
reject(new Error("Could not open this image. Please choose another."));
};

image.src = url;
});
}

function canvasToBlob(canvas, format, quality) {
return new Promise((resolve, reject) => {
canvas.toBlob((blob) => {
if (blob) {
resolve(blob);
} else {
reject(new Error("Could not create the compressed image."));
}
}, format, quality);
});
}

function displayResults(originalFile, compressedBlob, format) {
if (originalURL) URL.revokeObjectURL(originalURL);
if (compressedURL) URL.revokeObjectURL(compressedURL);

originalURL = URL.createObjectURL(originalFile);
compressedURL = URL.createObjectURL(compressedBlob);

$("original-preview").src = originalURL;
$("compressed-preview").src = compressedURL;

$("original-details").textContent =
`${(originalFile.size / 1024).toFixed(1)} KB`;
$("compressed-details").textContent =
`${(compressedBlob.size / 1024).toFixed(1)} KB`;

$("original-size").textContent =
`${(originalFile.size / 1024).toFixed(1)} KB`;
$("compressed-size").textContent =
`${(compressedBlob.size / 1024).toFixed(1)} KB`;

const difference = originalFile.size - compressedBlob.size;
const percent = originalFile.size
? Math.abs(difference / originalFile.size * 100)
: 0;

$("size-change").textContent = difference >= 0
? `${percent.toFixed(1)}% smaller`
: `${percent.toFixed(1)}% larger`;

const extension = format === "image/webp"
? "webp"
: format === "image/png"
? "png"
: "jpg";

download.href = compressedURL;
download.download = `smartkit-compressed.${extension}`;

results.hidden = false;
}
})();
/* SmartKit Tools — Passport Photo Resizer */
(() => {
const $ = (id) => document.getElementById(id);

const fileInput = $("passport-file");
const preset = $("passport-preset");
const customFields = $("passport-custom-fields");
const customWidth = $("passport-custom-width");
const customHeight = $("passport-custom-height");
const background = $("passport-background");
const createButton = $("passport-preview-btn");
const message = $("passport-message");
const results = $("passport-results");
const canvas = $("passport-canvas");
const downloadButton = $("passport-download");

if (
!fileInput || !preset || !customFields || !customWidth ||
!customHeight || !background || !createButton || !message ||
!results || !canvas || !downloadButton
) {
console.error("Passport Photo Resizer: required HTML elements are missing.");
return;
}

let downloadUrl = null;

preset.addEventListener("change", () => {
customFields.hidden = preset.value !== "custom";
results.hidden = true;
message.textContent = "";
});

fileInput.addEventListener("change", () => {
results.hidden = true;

const file = fileInput.files[0];
if (!file) {
message.textContent = "";
return;
}

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

if (!allowedTypes.includes(file.type)) {
fileInput.value = "";
message.textContent = "Please choose a JPG, PNG, or WebP image.";
return;
}

if (file.size > 10 * 1024 * 1024) {
fileInput.value = "";
message.textContent = "Please choose an image smaller than 10 MB.";
return;
}

message.textContent = "Photo selected. Choose your size and create your photo.";
});

createButton.addEventListener("click", async () => {
const file = fileInput.files[0];

if (!file) {
message.textContent = "Please choose a photo first.";
return;
}

let width;
let height;

if (preset.value === "35x45") {
// Approximate pixel dimensions at 300 DPI.
width = 413;
height = 531;
} else if (preset.value === "2x2") {
width = 600;
height = 600;
} else if (preset.value === "600x600") {
width = 600;
height = 600;
} else {
width = Number(customWidth.value);
height = Number(customHeight.value);

if (
!Number.isInteger(width) ||
!Number.isInteger(height) ||
width < 50 || width > 3000 ||
height < 50 || height > 3000
) {
message.textContent =
"Enter valid width and height values between 50 and 3000 pixels.";
return;
}
}

createButton.disabled = true;
createButton.textContent = "Creating Photo...";

try {
const image = await loadImage(file);

canvas.width = width;
canvas.height = height;

const context = canvas.getContext("2d");

if (!context) {
throw new Error("Your browser could not create the photo.");
}

if (background.value === "white") {
context.fillStyle = "#ffffff";
context.fillRect(0, 0, width, height);
} else if (background.value === "lightgray") {
context.fillStyle = "#eeeeee";
context.fillRect(0, 0, width, height);
}

// Center-crop to the selected aspect ratio.
const sourceRatio = image.naturalWidth / image.naturalHeight;
const targetRatio = width / height;

let sourceX = 0;
let sourceY = 0;
let sourceWidth = image.naturalWidth;
let sourceHeight = image.naturalHeight;

if (sourceRatio > targetRatio) {
sourceWidth = image.naturalHeight * targetRatio;
sourceX = (image.naturalWidth - sourceWidth) / 2;
} else if (sourceRatio < targetRatio) {
sourceHeight = image.naturalWidth / targetRatio;
sourceY = (image.naturalHeight - sourceHeight) / 2;
}

context.drawImage(
image,
sourceX, sourceY, sourceWidth, sourceHeight,
0, 0, width, height
);

$("passport-dimensions").textContent =
`Output dimensions: ${width} × ${height} pixels`;

results.hidden = false;
message.textContent =
"Photo created. Check the crop carefully before downloading.";
} catch (error) {
console.error("Passport photo creation failed:", error);
message.textContent =
error.message || "Could not create the photo. Please try another image.";
} finally {
createButton.disabled = false;
createButton.textContent = "Create Passport Photo";
}
});

downloadButton.addEventListener("click", () => {
if (!canvas.width || !canvas.height) {
message.textContent = "Create your photo before downloading.";
return;
}

canvas.toBlob((blob) => {
if (!blob) {
message.textContent = "Could not download the photo. Please try again.";
return;
}

if (downloadUrl) URL.revokeObjectURL(downloadUrl);
downloadUrl = URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = downloadUrl;
link.download = "smartkit-passport-photo.jpg";
document.body.appendChild(link);
link.click();
link.remove();

message.textContent = "Your photo download has started.";
}, "image/jpeg", 0.95);
});

function loadImage(file) {
return new Promise((resolve, reject) => {
const url = URL.createObjectURL(file);
const image = new Image();

image.onload = () => {
URL.revokeObjectURL(url);
resolve(image);
};

image.onerror = () => {
URL.revokeObjectURL(url);
reject(new Error("Could not open this image. Please choose another."));
};

image.src = url;
});
}
})();
