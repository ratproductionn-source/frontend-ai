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

const toolTabs = document.querySelectorAll(".tool-tab");
const toolCv = document.querySelector("#toolCv");
const toolDownload = document.querySelector("#toolDownload");
const detailsStrip = document.querySelector("#detailsStrip");
const heroEyebrowText = document.querySelector("#heroEyebrowText");
const heroTitle = document.querySelector("#heroTitle");
const heroCopy = document.querySelector("#heroCopy");
const trustRow = document.querySelector("#trustRow");
const videoUrl = document.querySelector("#videoUrl");
const fetchButton = document.querySelector("#fetchButton");
const downloadError = document.querySelector("#downloadError");
const downloadStepLabel = document.querySelector("#downloadStepLabel");
const downloadEmpty = document.querySelector("#downloadEmpty");
const downloadEmptyTitle = document.querySelector("#downloadEmptyTitle");
const downloadEmptyCopy = document.querySelector("#downloadEmptyCopy");
const downloadLoading = document.querySelector("#downloadLoading");
const downloadLoadingMessage = document.querySelector("#downloadLoadingMessage");
const downloadProgressBar = document.querySelector("#downloadProgressBar");
const downloadReady = document.querySelector("#downloadReady");
const downloadActions = document.querySelector("#downloadActions");
const videoThumb = document.querySelector("#videoThumb");
const videoTitle = document.querySelector("#videoTitle");
const videoMeta = document.querySelector("#videoMeta");
const saveVideoButton = document.querySelector("#saveVideoButton");

const checkIcon = '<svg viewBox="0 0 20 20"><path d="m5 10 3 3 7-7"/></svg>';
const toolCopy = {
  cv: {
    eyebrow: "AI CV PHOTO STUDIO",
    title: "Your best first<br /><em>impression.</em>",
    copy: "Turn any clear portrait into a polished, professional 4×6 cm CV photo in moments.",
    trust: ["Identity preserved", "Print ready", "No sign-up"],
  },
  youtube: {
    eyebrow: "YOUTUBE DOWNLOADER",
    title: "Save any<br /><em>YouTube</em> video.",
    copy: "Paste a YouTube link to fetch the video and download it as a file.",
    trust: ["Public videos", "No playlist", "MP4 when possible"],
    placeholder: "https://www.youtube.com/watch?v=...",
    step: "PASTE YOUTUBE LINK",
    emptyTitle: "Your YouTube video will appear here",
    emptyCopy: "Paste a public YouTube link to continue.",
  },
  tiktok: {
    eyebrow: "TIKTOK DOWNLOADER",
    title: "Download <em>TikToks</em><br />in seconds.",
    copy: "Paste a TikTok link to save the video without opening the app.",
    trust: ["Public videos", "HD when available", "Direct file save"],
    placeholder: "https://www.tiktok.com/@user/video/...",
    step: "PASTE TIKTOK LINK",
    emptyTitle: "Your TikTok will appear here",
    emptyCopy: "Paste a public TikTok link to continue.",
  },
};

let activeTool = "cv";
let pendingVideo;
let downloadTimer;
let videoFileUrl;

function showDownloadError(message) {
  downloadError.textContent = message;
  downloadError.hidden = false;
}

function clearDownloadError() {
  downloadError.hidden = true;
  downloadError.textContent = "";
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function resetDownloadPanel() {
  pendingVideo = undefined;
  clearDownloadError();
  downloadEmpty.hidden = false;
  downloadLoading.hidden = true;
  downloadReady.hidden = true;
  downloadActions.hidden = true;
  fetchButton.disabled = false;
  fetchButton.dataset.loading = "false";
  fetchButton.querySelector("span").textContent = "GET VIDEO INFO";
  saveVideoButton.disabled = false;
  if (videoFileUrl) URL.revokeObjectURL(videoFileUrl);
  videoFileUrl = undefined;
  window.clearInterval(downloadTimer);
}

function beginDownloadProgress(message) {
  let progress = 14;
  downloadProgressBar.style.width = `${progress}%`;
  downloadLoadingMessage.textContent = message;
  window.clearInterval(downloadTimer);
  downloadTimer = window.setInterval(() => {
    progress = Math.min(progress + Math.random() * 7, 91);
    downloadProgressBar.style.width = `${progress}%`;
  }, 800);
}

function setTool(tool) {
  activeTool = tool;
  const copy = toolCopy[tool];
  toolTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tool === tool));
  toolCv.hidden = tool !== "cv";
  toolDownload.hidden = tool === "cv";
  detailsStrip.hidden = tool !== "cv";
  heroEyebrowText.textContent = copy.eyebrow;
  heroTitle.innerHTML = copy.title;
  heroCopy.textContent = copy.copy;
  trustRow.innerHTML = copy.trust.map((item) => `<span>${checkIcon} ${item}</span>`).join("");
  document.title = tool === "cv" ? "Portraitly | CV Photo 4×6" : `Portraitly | ${tool === "youtube" ? "YouTube" : "TikTok"} Downloader`;
  if (tool !== "cv") {
    videoUrl.placeholder = copy.placeholder;
    downloadStepLabel.textContent = copy.step;
    downloadEmptyTitle.textContent = copy.emptyTitle;
    downloadEmptyCopy.textContent = copy.emptyCopy;
    resetDownloadPanel();
  }
}

async function fetchVideoInfo() {
  const url = videoUrl.value.trim();
  if (!url) {
    showDownloadError("Please paste a video link first.");
    return;
  }

  clearDownloadError();
  pendingVideo = undefined;
  fetchButton.disabled = true;
  fetchButton.dataset.loading = "true";
  fetchButton.querySelector("span").textContent = "FETCHING...";
  downloadEmpty.hidden = true;
  downloadReady.hidden = true;
  downloadActions.hidden = true;
  downloadLoading.hidden = false;
  beginDownloadProgress("Fetching video details...");

  try {
    const response = await fetch(
      `${API_URL}/api/download/info?url=${encodeURIComponent(url)}&platform=${activeTool}`,
      { signal: AbortSignal.timeout(70_000) },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error || "Could not read this video.");
    }

    pendingVideo = { url, platform: activeTool, ...body };
    videoTitle.textContent = body.title || "Untitled video";
    videoMeta.textContent = `${activeTool === "youtube" ? "YouTube" : "TikTok"} · ${formatDuration(body.duration)}`;
    if (body.thumbnail) {
      videoThumb.hidden = false;
      videoThumb.src = `${API_URL}/api/download/thumbnail?url=${encodeURIComponent(body.thumbnail)}`;
    } else {
      videoThumb.hidden = true;
      videoThumb.removeAttribute("src");
    }
    downloadProgressBar.style.width = "100%";
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    downloadLoading.hidden = true;
    downloadReady.hidden = false;
    downloadActions.hidden = false;
  } catch (error) {
    downloadLoading.hidden = true;
    downloadEmpty.hidden = false;
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    showDownloadError(timedOut ? "Timed out while reading this video. Please try again." : error.message);
  } finally {
    window.clearInterval(downloadTimer);
    fetchButton.disabled = false;
    fetchButton.dataset.loading = "false";
    fetchButton.querySelector("span").textContent = "GET VIDEO INFO";
  }
}

async function saveVideo() {
  if (!pendingVideo?.url) return;
  clearDownloadError();
  saveVideoButton.disabled = true;
  downloadReady.hidden = true;
  downloadActions.hidden = true;
  downloadLoading.hidden = false;
  beginDownloadProgress("Downloading video file...");

  try {
    const response = await fetch(`${API_URL}/api/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pendingVideo.url, platform: pendingVideo.platform }),
      signal: AbortSignal.timeout(200_000),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Could not download this video.");
    }

    const blob = await response.blob();
    if (videoFileUrl) URL.revokeObjectURL(videoFileUrl);
    videoFileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ext = pendingVideo.ext || "mp4";
    link.href = videoFileUrl;
    link.download = `${(pendingVideo.title || "video").replace(/[^\w\s.-]+/g, "").slice(0, 80) || "video"}.${ext}`;
    document.body.append(link);
    link.click();
    link.remove();
    downloadProgressBar.style.width = "100%";
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    downloadLoading.hidden = true;
    downloadReady.hidden = false;
    downloadActions.hidden = false;
  } catch (error) {
    downloadLoading.hidden = true;
    downloadReady.hidden = Boolean(pendingVideo);
    downloadEmpty.hidden = !pendingVideo;
    downloadActions.hidden = !pendingVideo;
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    showDownloadError(timedOut ? "The download took too long. Please try again." : error.message);
  } finally {
    window.clearInterval(downloadTimer);
    saveVideoButton.disabled = false;
  }
}

toolTabs.forEach((tab) => {
  tab.addEventListener("click", () => setTool(tab.dataset.tool));
});
fetchButton.addEventListener("click", fetchVideoInfo);
saveVideoButton.addEventListener("click", saveVideo);
videoUrl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    fetchVideoInfo();
  }
});
