// js/main.js

// ─── Adjust dirt height based on content ─────────────────────────────────────
function adjustDirtHeight() {
  const dirtEl = document.getElementById("dirt");
  const children = dirtEl.querySelectorAll("*");
  const dirtTop = dirtEl.getBoundingClientRect().top + window.scrollY;
  let maxBottom = 0;

  children.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const bottom = rect.top + window.scrollY + el.offsetHeight - dirtTop;
    if (el.tagName === "DIV" && bottom > maxBottom) {
      maxBottom = bottom;
    }
  });

  dirtEl.style.height = `${Math.max(maxBottom + 128, 900)}px`;
}

// ─── Draw connector line between img1 & img2 ─────────────────────────────────
function drawConnector() {
  const canvas = document.getElementById("lineCanvas");
  const doc = document.documentElement;
  const fullW = Math.max(doc.scrollWidth, doc.clientWidth);
  const fullH = Math.max(doc.scrollHeight, doc.clientHeight) - 800;

  canvas.width = fullW;
  canvas.height = fullH;
  canvas.style.width = `${fullW}px`;
  canvas.style.height = `${fullH}px`;

  const img1 = document.getElementById("img1");
  const img2 = document.getElementById("img2");
  const r1 = img1.getBoundingClientRect();
  const r2 = img2.getBoundingClientRect();

  const sX = r1.left + window.scrollX + r1.width * 0.575;
  const sY = r1.top + window.scrollY + r1.height * 0.55;
  const eX = r2.left + window.scrollX + r2.width * 0.35;
  const eY = r2.top + window.scrollY + r2.height * 0.17;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, fullW, fullH);
  ctx.beginPath();
  ctx.moveTo(sX, sY);
  ctx.lineTo(eX, eY);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ─── Build star-field & dirt layers on DOMContentLoaded ─────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // STAR FIELD
  const field = document.querySelector(".star-field");
  const STAR_COUNT = 80;
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("span");
    star.className =
      "star " +
      (Math.random() < 0.15 ? "big" : Math.random() < 0.5 ? "medium" : "small");
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 6}s`;
    star.style.animationDuration = `${5 + Math.random() * 4}s`;
    field.appendChild(star);
  }

  // DIRT LAYERS
  const dirt = document.getElementById("dirt");
  const svgNS = "http://www.w3.org/2000/svg";
  const viewW = 1440;
  const viewH = 900;
  const layers = 4;
  const colours = ["#5a3b1f", "#4b3019", "#3b2412", "#2e1d11"];

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${viewW} ${viewH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  dirt.appendChild(svg);

  // Top layer: reuse hill-curve
  const hillCurve =
    "M 0 0 " +
    "C 240 80 600 140 900 60 " +
    "C 1180 10 1320 20 1440 80 " +
    `L ${viewW} ${viewH} L 0 ${viewH} Z`;
  const topLayer = document.createElementNS(svgNS, "path");
  topLayer.setAttribute("d", hillCurve);
  topLayer.setAttribute("fill", colours[0]);
  svg.appendChild(topLayer);

  // Lower, undulating layers
  let currentY = 180;
  for (let i = 1; i < layers; i++) {
    const layerH = 250 + Math.random() * 120;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", colours[i]);

    let d = `M 0 ${currentY} `;
    const midX = viewW * 0.5;
    d += `C ${viewW * 0.18} ${currentY + 60}
          ${viewW * 0.35} ${currentY - 40}
          ${midX} ${currentY + 50} `;
    d += `C ${viewW * 0.65} ${currentY + 120}
          ${viewW * 0.85} ${currentY - 30}
          ${viewW} ${currentY + layerH} `;
    d += `L ${viewW} ${viewH} L 0 ${viewH} Z`;

    path.setAttribute("d", d);
    svg.appendChild(path);

    currentY += layerH * 0.45;
  }

  // Gravel pebbles
  for (let g = 0; g < 140; g++) {
    const pebble = document.createElement("span");
    const size = 3 + Math.random() * 10;
    pebble.className = "gravel";
    pebble.style.width = `${size}px`;
    pebble.style.height = `${size}px`;
    const topPercent = 100 - Math.random() * Math.random() * 100;
    pebble.style.top = `${topPercent}%`;
    pebble.style.left = `${Math.random() * 100}%`;
    pebble.style.transform = `rotate(${Math.random() * 360}deg)`;
    pebble.style.opacity = "30%";
    dirt.appendChild(pebble);
  }

  // Initial height adjustment
  adjustDirtHeight();
});

// ─── After full page load: lazy‑load media & draw connector when images ready ─
window.addEventListener("load", () => {
  // Lazy‑load images
  document.querySelectorAll("img[data-src]").forEach((img) => {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  });

  // Lazy‑load video + poster
  const video = document.getElementById("main-demo");
  if (video) {
    if (video.dataset.poster) {
      video.poster = video.dataset.poster;
      video.removeAttribute("data-poster");
    }
    const srcEl = document.createElement("source");
    srcEl.src = video.dataset.src;
    srcEl.type = "video/mp4";
    video.appendChild(srcEl);
    video.load();
    video.removeAttribute("data-src");
  }

  // Wait for both images before drawing connector
  const img1 = document.getElementById("img1");
  const img2 = document.getElementById("img2");
  let loadedCount = 0;
  function tryDraw() {
    loadedCount++;
    if (loadedCount === 2) {
      drawConnector();
      window.addEventListener("resize", drawConnector);
    }
  }
  [img1, img2].forEach((img) => {
    if (img.complete) tryDraw();
    else img.addEventListener("load", tryDraw);
  });
});

// ─── Periodically update the red line & footer (via dirt height) every 100ms ─
setInterval(() => {
  drawConnector();
  adjustDirtHeight();
}, 100);
