/**
 * SeasonCurve — V1.8 全年 12 个月市场热度曲线
 * 数据：SeasonTrendData.getHeatCurve(id)
 */
(function (global) {
  function buildPath(heats, w, h, pad) {
    const n = heats.length;
    if (!n) return "";
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const max = Math.max(100, ...heats);
    const min = Math.min(0, ...heats);
    const span = max - min || 1;

    const pts = heats.map((v, i) => {
      const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = pad.t + innerH - ((v - min) / span) * innerH;
      return [x, y];
    });

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${(h - pad.b).toFixed(1)} L${pts[0][0].toFixed(1)},${(h - pad.b).toFixed(1)} Z`;
    return { line, area, pts };
  }

  function categoryTabs(categories, activeId) {
    return (categories || []).map((c) => `
      <button type="button" class="season-curve-tab ${c.id === activeId ? "active" : ""}" data-curve-cat="${c.id}">
        ${c.name}
      </button>`).join("");
  }

  global.SeasonCurve = {
    /**
     * @param {string|HTMLElement} containerId
     * @param {{ activeId?: string, showTabs?: boolean, onCategoryChange?: Function }} opts
     */
    render(containerId, { activeId, showTabs = true, onCategoryChange } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el || !global.SeasonTrendData) return;

      const categories = SeasonTrendData.getCategories();
      const currentId = activeId || (categories[0] && categories[0].id) || "phone";
      const curve = SeasonTrendData.getHeatCurve(currentId);
      const cat = SeasonTrendData.getById(currentId);

      const w = 320;
      const h = 160;
      const pad = { t: 16, r: 12, b: 28, l: 28 };
      const { line, area, pts } = buildPath(curve.heats, w, h, pad);
      const peakIdx = curve.heats.indexOf(Math.max(...curve.heats));

      el.innerHTML = `
        <div class="season-curve">
          ${showTabs ? `<div class="season-curve-tabs">${categoryTabs(categories, currentId)}</div>` : ""}
          <div class="season-curve-meta">
            <strong>${curve.name}</strong>
            <span>旺季 ${cat.peakMonths || "—"}</span>
          </div>
          <div class="season-curve-svg-wrap">
            <svg class="season-curve-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-label="${curve.name}全年热度曲线">
              <defs>
                <linearGradient id="seasonCurveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F6A623" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#F6A623" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              ${[25, 50, 75].map((p) => {
                const y = pad.t + (h - pad.t - pad.b) * (1 - p / 100);
                return `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" class="season-curve-grid"/>`;
              }).join("")}
              <path d="${area}" fill="url(#seasonCurveFill)"/>
              <path d="${line}" class="season-curve-line" fill="none"/>
              ${pts.map((p, i) => `
                <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === peakIdx ? 4.5 : 3}"
                  class="season-curve-dot ${i === peakIdx ? "is-peak" : ""}"/>
              `).join("")}
              ${curve.labels.map((lab, i) => {
                if (i % 2 !== 0 && i !== 11) return "";
                const x = pts[i][0];
                return `<text x="${x.toFixed(1)}" y="${h - 8}" text-anchor="middle" class="season-curve-xlabel">${lab}</text>`;
              }).join("")}
            </svg>
          </div>
          <div class="season-curve-legend">
            <span>峰值热度 <em>${curve.heats[peakIdx]}</em>（${curve.labels[peakIdx]}）</span>
            <span class="season-curve-hint">${cat.aiSuggest || ""}</span>
          </div>
        </div>`;

      if (showTabs) {
        el.querySelectorAll("[data-curve-cat]").forEach((btn) => {
          btn.onclick = () => {
            const id = btn.dataset.curveCat;
            if (onCategoryChange) onCategoryChange(id);
            else this.render(el, { activeId: id, showTabs, onCategoryChange });
          };
        });
      }
    },
  };
})(window);
