/**
 * TradeDecisionCard — V1.6 AI 即时交易判断卡
 * 拍照识别后的第一次价值反馈：值不值得收？
 * 不独立成交易页，嵌在 AIInventoryCapture 流程内
 */
(function (global) {
  function productBlock(product) {
    const p = product || {};
    return `
      <div class="trade-dec-product">
        <p class="trade-dec-kicker">商品信息</p>
        <h3 class="trade-dec-name">${p.name || [p.brand, p.model, p.capacity].filter(Boolean).join(" ")}</h3>
        <div class="trade-dec-specs">
          <span>${p.brand || "—"}</span>
          <span>${p.model || "—"}</span>
          <span>${p.capacity || "—"}</span>
          <span>${p.condition || "—"}</span>
        </div>
      </div>`;
  }

  function marketBlock(market) {
    const m = market || {};
    return `
      <div class="trade-dec-market">
        <p class="trade-dec-kicker">AI 市场判断</p>
        <div class="trade-dec-market-grid">
          <div class="trade-dec-metric">
            <span class="trade-dec-metric-label">预计销售区间</span>
            <strong>${m.sellRange || "—"}</strong>
          </div>
          <div class="trade-dec-metric">
            <span class="trade-dec-metric-label">建议收货价格</span>
            <strong>${m.buySuggest || "—"}</strong>
          </div>
          <div class="trade-dec-metric">
            <span class="trade-dec-metric-label">预计利润空间</span>
            <strong class="is-profit">${m.profitRange || "—"}</strong>
          </div>
          <div class="trade-dec-metric trade-dec-metric--full">
            <span class="trade-dec-metric-label">${m.liquidityLabel || "流通速度"}</span>
            <strong class="trade-dec-stars">${m.liquidityStars || "★★★★☆"}</strong>
          </div>
        </div>
      </div>`;
  }

  function adviceBlock(advice) {
    const a = advice || {};
    const tone = a.verdict === "caution" ? "caution" : "buy";
    return `
      <div class="trade-dec-advice trade-dec-advice--${tone}">
        <p class="trade-dec-advice-title">${a.icon || "🔥"} ${a.title || "AI建议"}</p>
        <p class="trade-dec-advice-desc">${a.desc || ""}</p>
      </div>`;
  }

  global.TradeDecisionCard = {
    /** 返回 HTML 片段，供 Capture 流程嵌入 */
    html(decision) {
      if (!decision) return "";
      return `
        <div class="trade-dec-card">
          <div class="trade-dec-head">
            <span class="trade-dec-badge">AI 价值判断</span>
            <span class="trade-dec-hint">第一次反馈 · 30秒看懂值不值得收</span>
          </div>
          ${productBlock(decision.product)}
          ${marketBlock(decision.market)}
          ${adviceBlock(decision.advice)}
        </div>`;
    },

    /** 也可独立渲染到容器 */
    render(containerId, { decision } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = this.html(decision);
    },
  };
})(window);
