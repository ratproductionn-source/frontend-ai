import "./styles.css";
import { API_URL } from "./config.js";

const photoInput = document.querySelector("#photoInput");
const dropZone = document.querySelector("#dropZone");
const dropEmpty = document.querySelector("#dropEmpty");
const previewWrap = document.querySelector("#previewWrap");
const sourcePreview = document.querySelector("#sourcePreview");
const replaceButton = document.querySelector("#replaceButton");
const convertButton = document.querySelector("#convertButton");
const errorMessage = document.querySelector("#errorMessage");
const resultEmpty = document.querySelector("#resultEmpty");
const loadingState = document.querySelector("#loadingState");
const loadingPreview = document.querySelector("#loadingPreview");
const loadingMessage = document.querySelector("#loadingMessage");
const progressBar = document.querySelector("#progressBar");
const finishedState = document.querySelector("#finishedState");
const resultImage = document.querySelector("#resultImage");
const resultActions = document.querySelector("#resultActions");
const downloadButton = document.querySelector("#downloadButton");
const startOverButton = document.querySelector("#startOverButton");

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 10 * 1024 * 1024;
let selectedFile;
let sourceUrl;
let resultUrl;
let progressTimer;

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function selectFile(file) {
  clearError();
  if (!acceptedTypes.includes(file.type)) {
    showError("Please choose a JPG, PNG, or WebP image.");
    return;
  }

  if (file.size > maxSize) {
    showError("This image is larger than 10 MB. Please choose a smaller file.");
    return;
  }

  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  selectedFile = file;
  sourceUrl = URL.createObjectURL(file);
  sourcePreview.src = sourceUrl;
  loadingPreview.src = sourceUrl;
  dropEmpty.hidden = true;
  previewWrap.hidden = false;
  convertButton.disabled = false;
}

function openPicker() {
  if (convertButton.dataset.loading === "true") return;
  photoInput.click();
}

dropZone.addEventListener("click", (event) => {
  if (event.target.closest("#replaceButton")) return;
  openPicker();
});
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openPicker();
  }
});
replaceButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openPicker();
});
photoInput.addEventListener("change", () => {
  if (photoInput.files[0]) selectFile(photoInput.files[0]);
});

for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
}

dropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  if (file) selectFile(file);
});

function beginProgress() {
  let progress = 12;
  const messages = [
    [24, "Analyzing face and composition..."],
    [43, "Creating a professional studio look..."],
    [66, "Balancing background and lighting..."],
    [82, "Preparing the 4×6 print format..."],
  ];
  let messageIndex = 0;
  progressBar.style.width = `${progress}%`;
  loadingMessage.textContent = "Preparing your portrait...";

  progressTimer = window.setInterval(() => {
    progress = Math.min(progress + Math.random() * 6, 91);
    progressBar.style.width = `${progress}%`;
    if (messages[messageIndex] && progress >= messages[messageIndex][0]) {
      loadingMessage.textContent = messages[messageIndex][1];
      messageIndex += 1;
    }
  }, 850);
}

async function convertPhoto() {
  if (!selectedFile) return;
  clearError();
  convertButton.disabled = true;
  convertButton.dataset.loading = "true";
  convertButton.querySelector("span").textContent = "CREATING PHOTO...";
  resultEmpty.hidden = true;
  finishedState.hidden = true;
  resultActions.hidden = true;
  loadingState.hidden = false;
  beginProgress();
  document.querySelector("#resultCard").scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    const response = await fetch(`${API_URL}/api/convert`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(250_000),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "The conversion failed. Please try again.");
    }

    const imageBlob = await response.blob();
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(imageBlob);
    resultImage.src = resultUrl;
    downloadButton.href = resultUrl;
    progressBar.style.width = "100%";
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    loadingState.hidden = true;
    finishedState.hidden = false;
    resultActions.hidden = false;
  } catch (error) {
    loadingState.hidden = true;
    resultEmpty.hidden = false;
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    showError(timedOut ? "The AI took too long to respond. Please try again." : error.message);
  } finally {
    window.clearInterval(progressTimer);
    convertButton.disabled = false;
    convertButton.dataset.loading = "false";
    convertButton.querySelector("span").textContent = "CREATE MY CV PHOTO";
  }
}

function resetApp() {
  selectedFile = undefined;
  photoInput.value = "";
  dropEmpty.hidden = false;
  previewWrap.hidden = true;
  convertButton.disabled = true;
  resultEmpty.hidden = false;
  loadingState.hidden = true;
  finishedState.hidden = true;
  resultActions.hidden = true;
  clearError();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  sourceUrl = undefined;
  resultUrl = undefined;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

convertButton.addEventListener("click", convertPhoto);
startOverButton.addEventListener("click", resetApp);
