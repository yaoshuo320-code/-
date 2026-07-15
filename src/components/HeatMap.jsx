/**
 * HeatMap component — treemap tiles with enhanced value metrics.
 */
(function (global) {
  function tileSize(item) {
    if (item.size >= 1.25 || item.score >= 90) return "large";
    if (item.size >= 0.85 || item.score >= 60) return "medium";
    return "small";
  }

  function stars(n) {
    const count = Math.min(5, Math.max(0, n || 0));
    return "★".repeat(count) + "☆".repeat(5 - count);
  }

  function metaHtml(item, mode) {
    if (mode === "buy") {
      const trendCls = (item.trend || "").startsWith("+") ? "up" : (item.trend || "").startsWith("-") ? "down" : "flat";
      return `
        <div class="heat-meta">收货 ${item.buyPrice}</div>
        <div class="heat-extra-row">
          <span class="heat-trend ${trendCls}">趋势 ${item.trend || "—"}</span>
          <span class="heat-efficiency grade-${(item.capitalEfficiency || "B").toLowerCase()}">资金效率 ${item.capitalEfficiency || "B"}</span>
        </div>`;
    }
    if (mode === "sell") {
      return `
        <div class="heat-meta">周转 ${item.days}</div>
        <div class="heat-extra-row">
          <span class="heat-profit-stars" title="利润效率">${stars(item.profitStars)}</span>
          <span class="heat-capital occ-${item.capitalOccupation === "低" ? "low" : item.capitalOccupation === "高" ? "high" : "mid"}">资金 ${item.capitalOccupation || "中"}</span>
        </div>`;
    }
    const reasons = item.reasons || item.tags || [];
    return `<div class="tag-row">${reasons.map((t) => `<span class="mini-tag opp-tag">${t}</span>`).join("")}</div>`;
  }

  function themeClass(mode, item) {
    if (mode === "buy") return `heat-buy ${item.status || ""}`;
    if (mode === "sell") return "heat-sell";
    return "heat-future";
  }

  global.HeatMap = {
    render(containerId, { mode, list, detailPanelId }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = list.map((item, i) => `
        <button type="button" class="heat-tile ${tileSize(item)} ${themeClass(mode, item)}"
          data-heat-id="${item.id}" data-detail="${detailPanelId}" style="animation-delay:${i * 45}ms">
          <div class="heat-name">${item.name}</div>
          <div class="heat-score">${item.score}</div>
          ${metaHtml(item, mode)}
        </button>`).join("");
    },

    renderDetail(panelId, id, getDetail) {
      const d = getDetail(id);
      const panel = document.getElementById(panelId);
      if (!panel) return;
      panel.innerHTML = `
        <div class="detail-title">
          <div><strong>${d.model}</strong><div class="heat-meta">${d.brand} · ${d.capacity} · ${d.condition}</div></div>
          <button type="button" class="detail-close" data-close-detail="${panelId}">×</button>
        </div>
        <div class="detail-grid">
          <div class="detail-cell"><label>品牌</label><span>${d.brand}</span></div>
          <div class="detail-cell"><label>型号</label><span>${d.model}</span></div>
          <div class="detail-cell"><label>容量</label><span>${d.capacity}</span></div>
          <div class="detail-cell"><label>成色</label><span>${d.condition}</span></div>
          <div class="detail-cell"><label>市场价格</label><span>${d.marketPrice}</span></div>
          <div class="detail-cell"><label>建议收货价</label><span>${d.buyPrice}</span></div>
          <div class="detail-cell"><label>利润空间</label><span>${d.profit}</span></div>
          <div class="detail-cell"><label>销售速度</label><span>${d.salesSpeed}</span></div>
          <div class="detail-cell"><label>未来机会</label><span>${d.futureOpportunity}</span></div>
        </div>`;
      panel.classList.add("show");
    },

    bind(containerId, detailPanelId, getDetail) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.onclick = (e) => {
        const tile = e.target.closest("[data-heat-id]");
        if (tile) global.HeatMap.renderDetail(tile.dataset.detail, tile.dataset.heatId, getDetail);
      };
      const panel = document.getElementById(detailPanelId);
      if (panel) {
        panel.onclick = (e) => {
          const close = e.target.closest("[data-close-detail]");
          if (close) panel.classList.remove("show");
        };
      }
    },
  };
})(window);
