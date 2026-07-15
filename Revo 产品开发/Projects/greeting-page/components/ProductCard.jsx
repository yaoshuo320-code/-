/**
 * ProductCard — Revo AI value judgment result.
 */
(function (global) {
  function valueStars(score) {
    const s = Math.min(100, Math.max(0, score || 0));
    const filled = Math.round(s / 20);
    return { stars: "★".repeat(filled) + "☆".repeat(5 - filled), score: s };
  }

  function statusVerdict(level) {
    if (level === "strong") return { text: "🔥 值得收货", cls: "buy" };
    if (level === "good") return { text: "✅ 可以买入", cls: "buy" };
    if (level === "warn") return { text: "⚠️ 谨慎观望", cls: "caution" };
    return { text: "❌ 不建议", cls: "avoid" };
  }

  function riskBar(item) {
    const cls = item.level === "低" ? "low" : item.level === "中" ? "mid" : "high";
    return `
      <div class="risk-bar-row">
        <div class="risk-bar-head"><span>${item.label}</span><em class="risk-tag ${cls}">${item.level}</em></div>
        <div class="risk-bar-track"><div class="risk-bar-fill ${cls}" style="width:${item.value}%"></div></div>
      </div>`;
  }

  function trendTagHtml(tag) {
    const cls = tag.type || "neutral";
    return `<span class="value-trend-tag ${cls}">${tag.icon || ""}${tag.label}</span>`;
  }

  global.ProductCard = {
    render(containerId, data) {
      const el = document.getElementById(containerId);
      if (!el) return;

      if (!data) {
        el.innerHTML = `<div class="search-result-empty">填写型号信息，获取 AI 价值判断</div>`;
        return;
      }

      if (data.error) {
        el.innerHTML = `
          <div class="decision-card expand-in">
            <div class="decision-error">${data.error}</div>
          </div>`;
        return;
      }

      const vs = valueStars(data.valueScore);
      const v = statusVerdict(data.verdictLevel);
      const riskSimple = data.riskSimple || (data.riskRadar?.[0]?.level) || "中";
      const riskCls = riskSimple === "低" ? "low" : riskSimple === "高" ? "high" : "mid";
      const trendTags = data.trendTags || [];
      const aiAdvice = data.aiAdvice || data.verdict || "等待 AI 分析";

      el.innerHTML = `
        <div class="decision-stack expand-in">
          <section class="decision-card decision-conclusion value-result-card">
            <div class="decision-product value-product-name">${data.productName || data.name}</div>
            <div class="value-score-block">
              <div class="value-score-label">AI价值评分</div>
              <div class="value-stars">${vs.stars}</div>
              <div class="value-score-num">${vs.score}分</div>
            </div>
            <div class="value-status ${v.cls}">${v.text}</div>
            <div class="value-metrics-grid">
              <div class="value-metric"><label>市场价格</label><span>${data.marketRangeText || "—"}</span></div>
              <div class="value-metric"><label>预计销售</label><span>${data.sellRangeText || "—"}</span></div>
              <div class="value-metric highlight"><label>预计利润</label><span>${data.profitRangeText || "—"}</span></div>
              <div class="value-metric"><label>周转</label><span>${data.turnoverDays || "—"}</span></div>
              <div class="value-metric"><label>风险</label><span class="risk-simple ${riskCls}">${riskSimple}</span></div>
            </div>
            ${trendTags.length ? `<div class="value-trend-tags">${trendTags.map(trendTagHtml).join("")}</div>` : ""}
            <div class="value-ai-advice">
              <span class="value-ai-label">AI建议</span>
              <p>${aiAdvice}</p>
            </div>
            ${data.priceConfidenceHint ? `<p class="decision-hint">${data.priceConfidenceHint}</p>` : ""}
          </section>

          <section class="decision-card">
            <div class="decision-section-title">价格依据</div>
            <div class="price-basis-list">
              <div class="price-basis-row">
                <span class="price-basis-label">建议收货</span>
                <span class="price-basis-value">${data.buyRangeText || "—"}</span>
              </div>
              <div class="price-basis-row">
                <span class="price-basis-label">平台成交</span>
                <span class="price-basis-value">${data.dealRangeText ? `¥${data.dealRangeText}` : "—"}</span>
              </div>
              <div class="price-basis-row">
                <span class="price-basis-label">商家出货</span>
                <span class="price-basis-value">${data.dealerRangeText ? `¥${data.dealerRangeText}` : "—"}</span>
              </div>
            </div>
          </section>

          <section class="decision-card">
            <div class="decision-section-title">风险雷达</div>
            <div class="risk-radar">
              ${(data.riskRadar || []).map((r) => riskBar(r)).join("")}
            </div>
          </section>

          <section class="decision-actions">
            <button type="button" class="decision-action primary" data-action="buy">我要收货</button>
            <button type="button" class="decision-action" data-action="sell">我要卖货</button>
            <button type="button" class="decision-action ghost" data-action="watch">${data.watched ? "已关注 ✓" : "加入关注"}</button>
          </section>
        </div>`;

      if (data.onAction) {
        el.querySelectorAll("[data-action]").forEach((btn) => {
          btn.onclick = () => data.onAction(btn.dataset.action, data);
        });
      }
    },
  };
})(window);
