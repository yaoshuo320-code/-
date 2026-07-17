/**
 * SeasonTrendChart — 全年市场热度生命周期曲线
 * 平滑折线 + 节点 hover/点按提示；无月份卡片列表
 * 数据：SeasonTrendData.getHeatCurve(productId)
 */
(function (global) {
  function catmullRom2bezier(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function buildGeometry(heats, w, h, pad) {
    const n = heats.length;
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const pts = heats.map((v, i) => {
      const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = pad.t + innerH - (Math.max(0, Math.min(100, v)) / 100) * innerH;
      return [x, y];
    });
    const line = catmullRom2bezier(pts);
    const area = `${line} L${pts[n - 1][0].toFixed(1)},${(h - pad.b).toFixed(1)} L${pts[0][0].toFixed(1)},${(h - pad.b).toFixed(1)} Z`;
    return { pts, line, area };
  }

  function insightBlock(curve) {
    return `
      <div class="stc-insight">
        <div class="stc-insight-row">
          <span class="stc-insight-label">旺季</span>
          <strong>${curve.peakMonths || "—"}</strong>
        </div>
        <div class="stc-insight-row">
          <span class="stc-insight-label">淡季</span>
          <strong>${curve.offMonths || "—"}</strong>
        </div>
        <div class="stc-insight-block">
          <span class="stc-insight-kicker">AI判断</span>
          <p>${curve.aiJudge || "暂无判断"}</p>
        </div>
        <div class="stc-insight-block">
          <span class="stc-insight-kicker">经营建议</span>
          <p>${curve.advise || "暂无建议"}</p>
        </div>
      </div>`;
  }

  global.SeasonTrendChart = {
    /**
     * @param {string|HTMLElement} containerId
     * @param {{ productId?: string, showInsight?: boolean }} opts
     */
    render(containerId, { productId, showInsight = true } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el || !global.SeasonTrendData) return;

      const curve = SeasonTrendData.getHeatCurve(productId);
      if (!curve) {
        el.innerHTML = `<div class="stc-empty">请选择三级品类查看全年趋势</div>`;
        return;
      }

      if (!curve.hasCurve) {
        el.innerHTML = `
          <div class="season-trend-chart">
            <h3 class="stc-title">${curve.name}全年市场趋势</h3>
            <div class="stc-empty">该品类曲线数据待接入</div>
            ${showInsight ? insightBlock(curve) : ""}
          </div>`;
        return;
      }

      const w = 340;
      const h = 200;
      const pad = { t: 18, r: 14, b: 32, l: 36 };
      const { pts, line, area } = buildGeometry(curve.heats, w, h, pad);
      const uid = `stc-${curve.id}-${Date.now().toString(36)}`;

      el.innerHTML = `
        <div class="season-trend-chart" data-stc-root>
          <h3 class="stc-title">${curve.name}全年市场趋势</h3>
          <div class="stc-chart-card">
            <div class="stc-y-label">市场热度指数</div>
            <svg class="stc-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${curve.name}全年市场趋势">
              <defs>
                <linearGradient id="${uid}-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F6A623" stop-opacity="0.32"/>
                  <stop offset="100%" stop-color="#F6A623" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              ${[0, 25, 50, 75, 100].map((p) => {
                const y = pad.t + (h - pad.t - pad.b) * (1 - p / 100);
                return `
                  <line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" class="stc-grid"/>
                  <text x="${pad.l - 6}" y="${y + 3}" text-anchor="end" class="stc-ylabel">${p}</text>`;
              }).join("")}
              <path d="${area}" fill="url(#${uid}-fill)"/>
              <path d="${line}" class="stc-line" fill="none"/>
              ${pts.map((p, i) => `
                <circle
                  class="stc-dot"
                  cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5"
                  data-idx="${i}"
                  data-label="${curve.labels[i]}"
                  data-heat="${curve.heats[i]}"
                  data-season="${curve.points[i].season}"
                />`).join("")}
              ${curve.labels.map((lab, i) => `
                <text x="${pts[i][0].toFixed(1)}" y="${h - 8}" text-anchor="middle" class="stc-xlabel">${lab}</text>
              `).join("")}
            </svg>
            <div class="stc-tooltip" hidden></div>
          </div>
          ${showInsight ? insightBlock(curve) : ""}
        </div>`;

      const root = el.querySelector("[data-stc-root]");
      const tip = el.querySelector(".stc-tooltip");
      const card = el.querySelector(".stc-chart-card");

      function showTip(dot, clientX, clientY) {
        if (!tip || !card) return;
        tip.hidden = false;
        tip.innerHTML = `
          <strong>${dot.dataset.label}</strong>
          <span>热度 ${dot.dataset.heat}</span>
          <em>${dot.dataset.season}</em>`;
        const rect = card.getBoundingClientRect();
        const x = Math.min(Math.max(12, clientX - rect.left - 40), rect.width - 100);
        const y = Math.max(8, clientY - rect.top - 64);
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
      }

      function hideTip() {
        if (tip) tip.hidden = true;
      }

      el.querySelectorAll(".stc-dot").forEach((dot) => {
        dot.addEventListener("mouseenter", (e) => showTip(dot, e.clientX, e.clientY));
        dot.addEventListener("mousemove", (e) => showTip(dot, e.clientX, e.clientY));
        dot.addEventListener("mouseleave", hideTip);
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          showTip(dot, e.clientX, e.clientY);
        });
      });

      if (root) {
        root.addEventListener("click", (e) => {
          if (!e.target.classList.contains("stc-dot")) hideTip();
        });
      }
    },
  };
})(window);
