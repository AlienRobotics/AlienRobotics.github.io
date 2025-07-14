/*  ──────────────────────────────────────────────────────────
    RANDOM STARS  (unchanged – keep your original code here)
   ────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* ⭐ EXISTING STAR-FIELD code stays as-is … */
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

  /* ──────────────────────────────────────────────────────────
   DIRT  – first layer copies the hill-ridge path
   ────────────────────────────────────────────────────────── */
  const dirt = document.getElementById("dirt");
  const svgNS = "http://www.w3.org/2000/svg";
  const viewW = 1440;
  const viewH = 900;
  const layers = 4; // total strata
  const colours = ["#5a3b1f", "#4b3019", "#3b2412", "#2e1d11"]; // light → dark

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${viewW} ${viewH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  dirt.appendChild(svg);

  /* ── Layer 0  : reuse the grass-ridge curve ─────────────── */
  /* this is the SAME curve you used for the hill top, just    */
  /* stretched to the dirt SVG’s height so it fills downward   */
  const hillCurve =
    "M 0 0                                         " + // start
    "C 240 80 600 140 900 60                      " + // first bump
    "C 1180 10 1320 20 1440 80                    " + // second bump
    `L ${viewW} ${viewH} L 0 ${viewH} Z`; // close to bottom
  const topLayer = document.createElementNS(svgNS, "path");
  topLayer.setAttribute("d", hillCurve);
  topLayer.setAttribute("fill", colours[0]);
  svg.appendChild(topLayer);

  /* ── Lower layers : generate fresh undulating curves ────── */
  let currentY = 180; // start a bit below hill line
  for (let i = 1; i < layers; i++) {
    const layerH = 250 + Math.random() * 120; // 250–370 px tall
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", colours[i]);

    // gentle Bézier wave (random each run)
    let d = `M 0 ${currentY} `;
    const midX = viewW * 0.5;

    d += `C ${viewW * 0.18} ${currentY + 60}
        ${viewW * 0.35} ${currentY - 40}
        ${midX} ${currentY + 50} `;

    d += `C ${viewW * 0.65} ${currentY + 120}
        ${viewW * 0.85} ${currentY - 30}
        ${viewW}  ${currentY + layerH} `;

    d += `L ${viewW} ${viewH} L 0 ${viewH} Z`;
    path.setAttribute("d", d);
    svg.appendChild(path);

    currentY += layerH * 0.45; // overlap ≈45 %
  }

  /*  ────────────────────────────────────────────────────────
      GRAVEL  – grey random pebbles
     ──────────────────────────────────────────────────────── */
  for (let g = 0; g < 140; g++) {
    const pebble = document.createElement("span");
    const size = 3 + Math.random() * 10; // 3–13 px
    pebble.className = "gravel";
    pebble.style.width = `${size}px`;
    pebble.style.height = `${size}px`;

    /* ▸ y-position must be below the green layer */
    const topPercent = 100 - Math.random() * Math.random() * 100;
    pebble.style.top = `${topPercent}%`;
    pebble.style.left = `${Math.random() * 100}%`;
    pebble.style.transform = `rotate(${Math.random() * 360}deg)`;
    pebble.style.opacity = "30%";
    // pebble.style.zIndex =
    dirt.appendChild(pebble);
  }

  function adjustDirtHeight() {
    const dirt = document.getElementById("dirt");
    const children = dirt.querySelectorAll("*"); // all absolutely positioned kids
    const dirtTop = dirt.getBoundingClientRect().top + window.scrollY;
    let maxBottom = 0;

    children.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const bottom = rect.top + window.scrollY + el.offsetHeight - dirtTop;

      console.log(el.tagName);
      if (el.tagName == "DIV") if (bottom > maxBottom) maxBottom = bottom;
    });

    // Add 20px buffer and ensure at least your original design height (e.g. 900)
    const newHeight = Math.max(maxBottom + 128, 900);
    dirt.style.height = `${newHeight}px`;
  }

  window.addEventListener("load", adjustDirtHeight);
  window.addEventListener("resize", () => {
    // debounce if you like
    adjustDirtHeight();
  });
});
