    function blockBottomWhenReady(fn) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn);
      } else {
        fn();
      }
    }
      (function () {
        blockBottomWhenReady(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.querySelectorAll(".dot-chart-wrapper").forEach((wrap) => {
            const animateEl = wrap.querySelector("svg.line-chart animate");
            if (!animateEl) return;
            if (reduced) {
              const rect = wrap.querySelector(".clip-rect");
              if (rect) rect.setAttribute("width", "100");
              return;
            }
            let started = false;
            const io = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && !started) {
                  started = true;
                  try { animateEl.beginElement(); } catch (err) { /* noop */ }
                  io.disconnect();
                }
              });
            }, { threshold: 0.5 });
            io.observe(wrap);
          });
        });
      })();
      (function () {
        const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/>?";
        const PRIVATE_WORD = "PRIVATE";
        const ROWS = 9;
        const COLS = 15;
        const PRIVATE_ROW_INDEX = 4;
        const PRIVATE_START = Math.floor((COLS - PRIVATE_WORD.length) / 2);
        const HIGHLIGHT_CLASS = "PrivacyVisual_highlight__SWmNr";
        const TICK_MS = 250;
        const HIGHLIGHT_CHANCE = 0.05;
        const randChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
        blockBottomWhenReady(() => {
          const grids = document.querySelectorAll(".PrivacyVisual_privacyGrid__Pnjg_");
          if (!grids.length) return;
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          grids.forEach((grid) => {
            const rows = grid.querySelectorAll(".PrivacyVisual_privacyRow__E0cxl");
            if (reduced || !rows.length) return;
            const tick = () => {
              rows.forEach((row, rowIdx) => {
                if (rowIdx === PRIVATE_ROW_INDEX) return;
                const spans = row.querySelectorAll("span");
                spans.forEach((sp) => {
                  sp.textContent = randChar();
                  sp.classList.remove(HIGHLIGHT_CLASS);
                });
                if (Math.random() < HIGHLIGHT_CHANCE && spans.length) {
                  const pick = spans[Math.floor(Math.random() * spans.length)];
                  pick.classList.add(HIGHLIGHT_CLASS);
                }
              });
            };
            tick();
            const interval = setInterval(tick, TICK_MS);
            window.addEventListener("beforeunload", () => clearInterval(interval), { once: true });
          });
        });
      })();
      (function () {
        const TARGET_VALUE = 2311;
        const COUNT_DELAY_MS = 1000;
        const COUNT_DURATION_MS = 2500;
        const JITTER_RANGE = 50;
        const JITTER_LERP = 0.08;
        const JITTER_MIN_MS = 800;
        const JITTER_MAX_MS = 400;
        const GAUGE_BASE_DEG = 280;
        const GAUGE_RANGE_DEG = 5;
        const formatNumber = (n) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ").replace(/\u00A0/g, " ");
        blockBottomWhenReady(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.querySelectorAll(".SyncVisual_syncVisual__pz6oN").forEach((root) => {
            const glow = root.querySelector(".SyncVisual_syncGlow__Ut5nb");
            const fill = root.querySelector(".SyncVisual_syncFill__9Yfe1");
            const numberEl = root.querySelector(".SyncVisual_syncNumber__e74IZ");
            if (!glow || !fill || !numberEl) return;
            if (reduced) {
              numberEl.textContent = formatNumber(TARGET_VALUE);
              return;
            }
            let io = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                runCountUp();
              });
            }, { threshold: 0.3 });
            io.observe(root);

            const setGauge = (deg) => {
              glow.style.setProperty("--gauge-progress", deg + "deg");
              fill.style.setProperty("--gauge-progress", deg + "deg");
            };

            function runCountUp() {
              numberEl.textContent = "0";
              let startTs = null;
              const step = (ts) => {
                if (startTs === null) startTs = ts;
                const elapsed = ts - startTs - COUNT_DELAY_MS;
                if (elapsed < 0) { requestAnimationFrame(step); return; }
                const p = Math.min(elapsed / COUNT_DURATION_MS, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const current = Math.floor(eased * TARGET_VALUE);
                numberEl.textContent = formatNumber(current);
                if (p < 1) {
                  requestAnimationFrame(step);
                } else {
                  glow.style.animation = "none";
                  fill.style.animation = "none";
                  runJitter();
                }
              };
              requestAnimationFrame(step);
            }

            function runJitter() {
              let current = TARGET_VALUE;
              let target = TARGET_VALUE;
              let lastSwitch = performance.now();
              let nextWindow = JITTER_MIN_MS + Math.random() * JITTER_MAX_MS;
              const loop = (now) => {
                if (now - lastSwitch > nextWindow) {
                  target = Math.round(TARGET_VALUE + (Math.random() - 0.5) * JITTER_RANGE * 2);
                  lastSwitch = now;
                  nextWindow = JITTER_MIN_MS + Math.random() * JITTER_MAX_MS;
                }
                current += JITTER_LERP * (target - current);
                numberEl.textContent = formatNumber(current);
                const deg = GAUGE_BASE_DEG + ((current - TARGET_VALUE) / JITTER_RANGE) * GAUGE_RANGE_DEG;
                setGauge(deg);
                requestAnimationFrame(loop);
              };
              requestAnimationFrame(loop);
            }
          });
        });
      })();
      (function () {
        const TICK_MS = 3000;
        const LAST_N = 3;
        blockBottomWhenReady(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.querySelectorAll(".eff-strip").forEach((strip) => {
            const spans = strip.querySelectorAll("span");
            if (spans.length < LAST_N) return;
            const targets = Array.from(spans).slice(-LAST_N);
            if (reduced) return;
            const roll = () => {
              targets.forEach((sp) => {
                if (Math.random() < 0.5) {
                  sp.classList.add("is-off");
                } else {
                  sp.classList.remove("is-off");
                }
              });
            };
            setInterval(roll, TICK_MS);
          });
        });
      })();
      (function () {
        const TICK_MS = 700;
        const COLUMN_WIDTH = 16;
        const MIN_DOTS = 1;
        const MAX_DOTS = 7;
        const INITIAL_PATTERN = [2, 1, 3, 2, 4, 6, 3, 1, 2, 3, 5, 4, 6, 5, 4, 5, 3, 7, 4, 5, 2, 3, 2, 3, 2];
        const randomDots = () => Math.floor(Math.random() * MAX_DOTS) + MIN_DOTS;
        const buildColumn = (count) => {
          const col = document.createElement("div");
          col.className = "dot-col";
          for (let i = 0; i < count; i++) col.appendChild(document.createElement("span"));
          return col;
        };
        blockBottomWhenReady(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.querySelectorAll(".dot-chart-wrapper .dot-chart").forEach((chart) => {
            if (reduced) return;
            const measureMax = () => Math.max(1, Math.floor(chart.offsetWidth / COLUMN_WIDTH));
            let maxCols = measureMax();
            chart.innerHTML = "";
            const seed = INITIAL_PATTERN.slice(0, maxCols);
            while (seed.length < maxCols) seed.push(randomDots());
            seed.forEach((n) => chart.appendChild(buildColumn(n)));

            if (typeof ResizeObserver !== "undefined") {
              const ro = new ResizeObserver(() => {
                const next = measureMax();
                if (next === maxCols) return;
                if (next > maxCols) {
                  for (let i = 0; i < next - maxCols; i++) chart.appendChild(buildColumn(randomDots()));
                } else {
                  for (let i = 0; i < maxCols - next; i++) {
                    if (chart.lastChild) chart.removeChild(chart.lastChild);
                  }
                }
                maxCols = next;
              });
              ro.observe(chart);
            }

            const tick = () => {
              const newCol = buildColumn(randomDots());
              chart.insertBefore(newCol, chart.firstChild);
              while (chart.children.length > maxCols) {
                chart.removeChild(chart.lastChild);
              }
            };
            setInterval(tick, TICK_MS);
          });
        });
      })();
      (function () {
        blockBottomWhenReady(() => {
          document.querySelectorAll("[data-anim-radar]").forEach((root) => {
            const sweep = root.querySelector(".anim-radar__sweep");
            const points = root.querySelectorAll(".anim-radar__point");
            if (!sweep || !points.length) return;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduced) {
              root.classList.add("anim-radar--reduced");
              sweep.style.transform = "translate(-50%, -50%) rotate(32deg)";
              return;
            }
            function calculateAngles() {
              const rect = root.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.bottom;
              points.forEach((point) => {
                const pRect = point.getBoundingClientRect();
                const px = pRect.left + pRect.width / 2;
                const py = pRect.top + pRect.height / 2;
                const angleRad = Math.atan2(py - centerY, px - centerX);
                let angleDeg = angleRad * (180 / Math.PI);
                let cssAngle = angleDeg + 90;
                if (cssAngle < 0) cssAngle += 360;
                point.dataset.angle = String(cssAngle);
              });
            }
            calculateAngles();
            window.addEventListener("resize", calculateAngles);
            let startTime = null;
            const scanDuration = 4000;
            const beamWidth = 60;
            function animateRadar(time) {
              if (!startTime) startTime = time;
              const elapsed = time - startTime;
              const progress = (elapsed % scanDuration) / scanDuration;
              const currentAngle = progress * 360;
              sweep.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
              points.forEach((point) => {
                const targetAngle = parseFloat(point.dataset.angle) || 0;
                let diff = currentAngle - targetAngle;
                if (diff < -180) diff += 360;
                if (diff > 180) diff -= 360;
                if (diff >= 0 && diff <= beamWidth) point.classList.add("anim-radar__point--scanned");
                else point.classList.remove("anim-radar__point--scanned");
              });
              requestAnimationFrame(animateRadar);
            }
            requestAnimationFrame(animateRadar);
          });
        });
      })();
      (function () {
        blockBottomWhenReady(() => {
          document.querySelectorAll("[data-anim-voice]").forEach((root) => {
            const wave = root.querySelector(".anim-voice__wave");
            if (!wave) return;
            const BAR_COUNT = 45;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            wave.replaceChildren();
            for (let i = 0; i < BAR_COUNT; i++) {
              const bar = document.createElement("div");
              bar.className = "anim-voice__bar";
              wave.appendChild(bar);
            }
            const bars = root.querySelectorAll(".anim-voice__bar");
            let time = 0;
            if (reduced) {
              bars.forEach((bar) => { bar.style.height = "8px"; });
              return;
            }
            function tick() {
              time += 0.03;
              bars.forEach((bar, index) => {
                const centerIndex = BAR_COUNT / 2;
                const distFromCenter = Math.abs(index - centerIndex);
                const activityFactor = Math.exp(-(distFromCenter * distFromCenter) / 40);
                const baseHeight = 6 + 18 * activityFactor;
                const wave1 = Math.sin(time + index * 0.4);
                const wave2 = Math.cos(time * 0.7 + index * 0.2);
                const animHeight = 12 * activityFactor * ((wave1 + wave2) / 2);
                bar.style.height = `${Math.max(6, baseHeight + animHeight)}px`;
              });
              requestAnimationFrame(tick);
            }
            tick();
          });
        });
      })();
      (function () {
        blockBottomWhenReady(() => {
          document.querySelectorAll("[data-anim-globe]").forEach((root) => {
            const canvas = root.querySelector(".anim-globe__canvas");
            if (!canvas || !canvas.getContext) return;
            const ctx = canvas.getContext("2d");
            let bw; let bh; let cx; let cy; let radius;
            const dots = []; const hotspots = [];
            const DOT_DENSITY = 0.028;
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            function isLand(lat, lon) {
              const n = Math.sin(lat * 5.5) * Math.cos(lon * 4) + Math.sin(lat * 2.5 - lon * 3) * 0.8 + Math.cos(lon * 7) * 0.3;
              return n > 0.1;
            }
            function spawnHotspot(existingHotspot = null) {
              const greenDots = dots.filter((d) => d.isGreen && d.z > 0 && d.y < 0);
              if (!greenDots.length) return;
              const target = greenDots[Math.floor(Math.random() * greenDots.length)];
              const glowR = radius * (0.1 + Math.random() * 0.08);
              const newSpot = { targetX: target.x, targetY: target.y, targetZ: target.z, life: 0, maxLife: Math.random() * 150 + 100, radius: glowR };
              if (existingHotspot) Object.assign(existingHotspot, newSpot); else hotspots.push(newSpot);
            }
            function initDots() {
              dots.length = 0; hotspots.length = 0;
              for (let lat = 0; lat <= Math.PI; lat += DOT_DENSITY) {
                for (let lon = 0; lon <= Math.PI * 2; lon += DOT_DENSITY) {
                  if (!isLand(lat, lon)) continue;
                  const x = radius * Math.sin(lat) * Math.cos(lon);
                  const y = radius * Math.cos(lat);
                  const z = radius * Math.sin(lat) * Math.sin(lon);
                  const tilt = -0.4;
                  const rotY = y * Math.cos(tilt) - z * Math.sin(tilt);
                  const rotZ = z * Math.cos(tilt) + y * Math.sin(tilt);
                  if (rotZ > -radius * 0.5) {
                    const isGreen = Math.random() > 0.88;
                    dots.push({ x, y: rotY, z: rotZ, isGreen, sizeMod: isGreen ? Math.random() * 1.5 + 0.5 : Math.random() * 0.5 + 0.8 });
                  }
                }
              }
              for (let i = 0; i < 4; i++) spawnHotspot();
            }
            let time = 0; let rafId = 0;
            function layout() {
              const rect = root.getBoundingClientRect();
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              bw = Math.max(1, Math.floor(rect.width * dpr));
              bh = Math.max(1, Math.floor(rect.height * dpr));
              canvas.width = bw; canvas.height = bh;
              canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
              const minDim = Math.min(rect.width, rect.height) * dpr;
              cx = bw * 0.58; cy = bh * 1.22; radius = minDim * 0.9;
              initDots();
            }
            function draw() {
              ctx.clearRect(0, 0, bw, bh);
              if (!reduced) time += 0.0015;
              hotspots.forEach((spot) => {
                const cosT = Math.cos(time); const sinT = Math.sin(time);
                const hx = spot.targetX * cosT - spot.targetZ * sinT;
                const hy = spot.targetY;
                const hz = spot.targetZ * cosT + spot.targetX * sinT;
                if (hz > -100) {
                  const screenX = cx + hx; const screenY = cy + hy;
                  const alpha = Math.sin((spot.life / spot.maxLife) * Math.PI) * 0.35;
                  const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, spot.radius);
                  gradient.addColorStop(0, `rgba(52, 211, 153, ${alpha})`);
                  gradient.addColorStop(1, "rgba(52, 211, 153, 0)");
                  ctx.fillStyle = gradient;
                  ctx.beginPath(); ctx.arc(screenX, screenY, spot.radius, 0, Math.PI * 2); ctx.fill();
                }
                spot.life++; if (spot.life >= spot.maxLife) spawnHotspot(spot);
              });
              for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                const cosT = Math.cos(time); const sinT = Math.sin(time);
                const rotX = dot.x * cosT - dot.z * sinT;
                const rotZ = dot.z * cosT + dot.x * sinT;
                if (rotZ > -radius * 0.1) {
                  const perspective = (radius + rotZ) / (radius * 1.5);
                  const screenX = cx + rotX; const screenY = cy + dot.y;
                  const size = 1.5 * perspective * dot.sizeMod;
                  ctx.fillStyle = dot.isGreen ? `rgba(52, 211, 153, ${0.4 + perspective * 0.6})` : `rgba(60, 50, 90, ${0.2 + perspective * 0.5})`;
                  ctx.beginPath(); ctx.ellipse(screenX, screenY, size * 1.5, size, 0, 0, Math.PI * 2); ctx.fill();
                }
              }
              rafId = requestAnimationFrame(draw);
            }
            function start() { cancelAnimationFrame(rafId); layout(); rafId = requestAnimationFrame(draw); }
            const ro = new ResizeObserver(() => start());
            ro.observe(root);
            start();
          });
        });
      })();