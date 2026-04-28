const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const showToast = (message) => {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
};

const clampNumber = (value, min, max, fallback) => {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};

const toSlug = (text) =>
  text
    .trim()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const toTitleCase = (text) =>
  text
    .toLocaleLowerCase("vi-VN")
    .replace(/(^|[\s([{/"'-])([^\s([{/"'-])/gu, (match, prefix, letter) => {
      return prefix + letter.toLocaleUpperCase("vi-VN");
    });

const toSentenceCase = (text) =>
  text
    .toLocaleLowerCase("vi-VN")
    .replace(/(^|[.!?\n]\s*)([^\s.!?])/gu, (match, prefix, letter) => {
      return prefix + letter.toLocaleUpperCase("vi-VN");
    });

const cleanText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getYouTubeId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];
  } catch (error) {
    return "";
  }
  return "";
};

const detectVideoType = (url, selectedType) => {
  if (selectedType !== "auto") return selectedType;
  if (getYouTubeId(url)) return "youtube";
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return "file";
  return "iframe";
};

const initTabs = () => {
  $$(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".tab-button").forEach((item) => item.classList.remove("active"));
      $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      $(`#${button.dataset.tab}`).classList.add("active");
    });
  });
};

const initToolMenu = () => {
  $$("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(`#${button.dataset.jump}`);
      const menu = button.closest(".tool-menu");
      if (!target || !menu) return;

      menu.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
};

const updateTextStats = () => {
  const text = $("#text-input").value;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.match(/[^\s]+/g) || [] : [];
  const lines = trimmed ? text.replace(/\n$/, "").split(/\r?\n/).length : 0;

  $("#char-count").textContent = text.length;
  $("#char-no-space-count").textContent = text.replace(/\s/g, "").length;
  $("#word-count").textContent = words.length;
  $("#line-count").textContent = lines;
};

const initTextTools = () => {
  $("[data-clear='text-input']").addEventListener("click", () => {
    $("#text-input").value = "";
    $("#text-output").value = "";
    updateTextStats();
  });

  $$("[data-text-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $("#text-input").value;
      const action = button.dataset.textAction;
      const output = $("#text-output");

      if (action === "slug") output.value = toSlug(input);
      if (action === "uppercase") output.value = input.toLocaleUpperCase("vi-VN");
      if (action === "lowercase") output.value = input.toLocaleLowerCase("vi-VN");
      if (action === "titlecase") output.value = toTitleCase(input);
      if (action === "sentencecase") output.value = toSentenceCase(input);
      if (action === "clean") output.value = cleanText(input);
    });
  });

  $("#text-input").addEventListener("input", updateTextStats);
  $("#clean-to-output").addEventListener("click", () => {
    $("#text-output").value = cleanText($("#text-input").value);
  });
  updateTextStats();
};

const generateOrderedList = () => {
  const start = clampNumber($("#ol-start").value, 1, 999999, 1);
  const itemCount = clampNumber($("#ol-items").value, 1, 50, 3);
  const lines = $("#ol-content").value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items = Array.from({ length: Math.max(lines.length, itemCount) }, (_, index) => {
    const content = escapeHtml(lines[index] || `Mục ${index + 1}`);
    return `  <li>${content}</li>`;
  });

  $("#ol-output").value = `<ol start="${start}">\n${items.join("\n")}\n</ol>`;
};

const generateLink = () => {
  const text = escapeHtml($("#link-text").value.trim() || "Xem thêm");
  const url = escapeHtml($("#link-url").value.trim() || "#");
  const color = $("#link-color").value;
  const background = $("#link-bg").value;
  const padding = escapeHtml($("#link-padding").value.trim() || "10px 16px");
  const isNofollow = $("#link-nofollow").checked;
  const isNewTab = $("#link-newtab").checked;
  const relValues = [];

  if (isNofollow) relValues.push("nofollow");
  if (isNewTab) relValues.push("noopener", "noreferrer");

  const rel = relValues.length ? ` rel="${relValues.join(" ")}"` : "";
  const target = isNewTab ? ' target="_blank"' : "";
  const style = [
    "display: inline-block",
    `color: ${color}`,
    `background-color: ${background}`,
    `padding: ${padding}`,
    "border-radius: 6px",
    "text-decoration: none",
    "font-weight: 700"
  ].join("; ");

  const code = `<a href="${url}" style="${style};"${target}${rel}>${text}</a>`;
  $("#link-output").value = code;
  $("#link-preview").innerHTML = code;
};

const generateVideo = () => {
  const url = $("#video-url").value.trim() || "https://www.youtube.com/embed/VIDEO_ID";
  const selectedType = $("#video-type").value;
  const videoType = detectVideoType(url, selectedType);
  const ratio = $("#video-ratio").value;
  const radius = clampNumber($("#video-radius").value, 0, 48, 12);
  const shadow = $("#video-shadow").checked ? "box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);" : "";
  const lazy = $("#video-lazy").checked ? ' loading="lazy"' : "";
  const safeUrl = escapeHtml(url);
  const wrapperStyle = `position: relative; width: 100%; aspect-ratio: ${ratio}; overflow: hidden; border-radius: ${radius}px; ${shadow}`;
  const mediaStyle = "width: 100%; height: 100%; border: 0; display: block;";
  let mediaCode = "";

  if (videoType === "file") {
    const controls = $("#video-controls").checked ? " controls" : "";
    mediaCode = `<video src="${safeUrl}" style="${mediaStyle}"${controls}></video>`;
  } else {
    const youtubeId = videoType === "youtube" ? getYouTubeId(url) : "";
    const src = youtubeId ? `https://www.youtube.com/embed/${escapeHtml(youtubeId)}` : safeUrl;
    mediaCode = `<iframe src="${src}" title="Video" style="${mediaStyle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen${lazy}></iframe>`;
  }

  $("#video-output").value = `<div style="${wrapperStyle.trim()}">\n  ${mediaCode}\n</div>`;
};

const generateTable = () => {
  const rows = clampNumber($("#table-rows").value, 1, 50, 3);
  const cols = clampNumber($("#table-cols").value, 1, 12, 3);
  const hasHeader = $("#table-header").value === "yes";
  const headStyle = "border: 1px solid #d8e0e7; padding: 10px; text-align: left; background-color: #eef6f4;";
  const cellStyle = "border: 1px solid #d8e0e7; padding: 10px; text-align: left;";
  const headerCells = Array.from({ length: cols }, (_, index) => `      <th style="${headStyle}">Cột ${index + 1}</th>`).join("\n");
  const bodyRows = Array.from({ length: rows }, (_, rowIndex) => {
    const cells = Array.from({ length: cols }, (_, colIndex) => `      <td style="${cellStyle}">Nội dung ${rowIndex + 1}.${colIndex + 1}</td>`).join("\n");
    return `    <tr>\n${cells}\n    </tr>`;
  }).join("\n");
  const tableHead = hasHeader ? `\n  <thead>\n    <tr>\n${headerCells}\n    </tr>\n  </thead>` : "";

  $("#table-output").value = `<div style="width: 100%; overflow-x: auto;">\n<table style="width: 100%; border-collapse: collapse; table-layout: auto;">${tableHead}\n  <tbody>\n${bodyRows}\n  </tbody>\n</table>\n</div>`;
};

const setMeterState = (row, value, goodMin, goodMax, warnMin, warnMax) => {
  row.classList.remove("good", "warn", "danger");
  if (value >= goodMin && value <= goodMax) {
    row.classList.add("good");
  } else if (value >= warnMin && value <= warnMax) {
    row.classList.add("warn");
  } else {
    row.classList.add("danger");
  }
};

const updateMetaCounters = () => {
  const titleLength = $("#meta-title").value.length;
  const descriptionLength = $("#meta-description").value.length;
  const titleRow = $("#meta-title-count").closest(".meter-row");
  const descriptionRow = $("#meta-description-count").closest(".meter-row");

  $("#meta-title-count").textContent = `${titleLength} ký tự`;
  $("#meta-description-count").textContent = `${descriptionLength} ký tự`;
  setMeterState(titleRow, titleLength, 50, 60, 35, 70);
  setMeterState(descriptionRow, descriptionLength, 140, 160, 110, 170);
};

const generateMeta = () => {
  const title = escapeHtml($("#meta-title").value.trim() || "Tiêu đề SEO của bài viết");
  const description = escapeHtml($("#meta-description").value.trim() || "Mô tả ngắn gọn của trang.");
  const url = escapeHtml($("#meta-url").value.trim());
  const canonical = url ? `\n<link rel="canonical" href="${url}">` : "";
  const ogUrl = url ? `\n<meta property="og:url" content="${url}">` : "";

  $("#meta-output").value = `<title>${title}</title>\n<meta name="description" content="${description}">${canonical}\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">${ogUrl}\n<meta property="og:type" content="article">`;
  updateMetaCounters();
};

const initCopyButtons = () => {
  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = $(`#${button.dataset.copy}`);
      if (!target.value.trim()) {
        showToast("Chưa có nội dung để copy");
        return;
      }

      try {
        await navigator.clipboard.writeText(target.value);
        showToast("Đã copy");
      } catch (error) {
        target.select();
        document.execCommand("copy");
        showToast("Đã copy");
      }
    });
  });
};

const initGenerators = () => {
  $("#generate-ol").addEventListener("click", generateOrderedList);
  $("#generate-link").addEventListener("click", generateLink);
  $("#generate-video").addEventListener("click", generateVideo);
  $("#generate-table").addEventListener("click", generateTable);
  $("#generate-meta").addEventListener("click", generateMeta);
  $("#meta-title").addEventListener("input", updateMetaCounters);
  $("#meta-description").addEventListener("input", updateMetaCounters);

  generateOrderedList();
  generateLink();
  generateVideo();
  generateTable();
  generateMeta();
};

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initToolMenu();
  initTextTools();
  initCopyButtons();
  initGenerators();
});
