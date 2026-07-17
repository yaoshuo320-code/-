/**
 * DailyInsight — V2.0 今日经营提醒
 * 首页智脑：老板今天需要关注什么
 */
(function (global) {
  function cardHtml(item, i) {
    return `
      <button type="button" class="daily-insight-card daily-insight-card--${item.type}" data-insight-id="${item.id}" style="animation-delay:${i * 50}ms">
        <div class="daily-insight-top">
          <span class="daily-insight-icon">${item.icon || "•"}</span>
          <span class="daily-insight-label">${item.title || ""}</span>
        </div>
        <p class="daily-insight-text">${item.text}</p>
        ${item.suggest ? `<p class="daily-insight-suggest">${item.suggest}</p>` : ""}
      </button>`;
  }

  global.DailyInsight = {
    render(containerId, { data, onCardClick } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el) return;

      const insights = data || (global.DailyInsightData && DailyInsightData.getInsights());
      if (!insights) {
        el.innerHTML = "";
        return;
      }

      const cards = [
        ...(insights.opportunities || []),
        ...(insights.risks || []),
        ...(insights.sellAdvice || []),
      ];

      el.innerHTML = `
        <section class="ai-section daily-insight-section">
          <div class="ai-section-head">
            <span class="ai-section-icon">📌</span>
            <span class="ai-section-title">今日经营提醒</span>
          </div>
          <p class="daily-insight-sub">${insights.headline || "老板今天需要关注什么"}</p>
          <div class="daily-insight-list">
            ${cards.length
              ? cards.map((item, i) => cardHtml(item, i)).join("")
              : `<div class="daily-insight-empty">今日暂无特别提醒</div>`}
          </div>
        </section>`;

      el.querySelectorAll("[data-insight-id]").forEach((btn) => {
        btn.onclick = () => {
          const item = cards.find((c) => c.id === btn.dataset.insightId);
          onCardClick && onCardClick(item);
        };
      });
    },
  };
})(window);
