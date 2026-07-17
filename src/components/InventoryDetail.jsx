/**
 * InventoryDetail — V2.0 库存商品详情 + AI 行动按钮
 * 从分析展示升级为经营决策：关注 / 出售提醒 / 立即卖货
 */
(function (global) {
  global.InventoryDetail = {
    render(containerId, { itemId, item, onBack, onAction, toast } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const row = item
        || (global.InventoryBrainData && InventoryBrainData.getItem(itemId))
        || null;

      if (!row) {
        el.innerHTML = `
          <div class="ai-dash ib-page">
            <section class="inv-import-hero">
              <button type="button" class="inv-import-back" id="ibDetailBack">← 返回库存大脑</button>
              <h1 class="ai-welcome-title">商品详情</h1>
            </section>
            <div class="stc-empty">未找到该商品</div>
          </div>`;
        const back = el.querySelector("#ibDetailBack");
        if (back) back.onclick = () => onBack && onBack();
        return;
      }

      const advice = row.advice || {};
      const tone = row.bucket === "risk" ? "risk" : row.bucket === "earn" ? "earn" : "wait";

      el.innerHTML = `
        <div class="ai-dash ib-page">
          <section class="inv-import-hero">
            <button type="button" class="inv-import-back" id="ibDetailBack">← 返回库存大脑</button>
            <h1 class="ai-welcome-title">商品详情</h1>
            <p class="ai-welcome-sub">AI 持续跟踪这件货的经营决策</p>
          </section>

          <section class="ai-section">
            <div class="ib-detail-hero glass-card">
              <h2 class="ib-detail-name">${row.name}</h2>
              <div class="ib-detail-specs">
                <span>${row.brand || "—"}</span>
                <span>${row.model || "—"}</span>
                <span>${row.capacity || "—"}</span>
                <span>${row.condition || "—"}</span>
                ${row.color ? `<span>${row.color}</span>` : ""}
              </div>
            </div>
          </section>

          <section class="ai-section">
            <div class="ib-detail-metrics glass-card">
              <div class="ib-detail-metric">
                <span>采购价格</span>
                <strong>¥${(row.cost || 0).toLocaleString()}</strong>
              </div>
              <div class="ib-detail-metric">
                <span>当前市场价格区间</span>
                <strong>${row.sellRange || "—"}</strong>
              </div>
              <div class="ib-detail-metric">
                <span>利润空间</span>
                <strong class="is-profit">${row.profitText || "—"}</strong>
              </div>
              <div class="ib-detail-metric">
                <span>库存周期</span>
                <strong>${row.days} 天 · ${row.qty || 1} 件</strong>
              </div>
            </div>
          </section>

          <section class="ai-section">
            <div class="ib-advice-card ib-advice-card--${tone}">
              <span class="ib-advice-kicker">AI经营建议</span>
              <h3 class="ib-advice-action">当前建议：${advice.action || "持续关注"}</h3>
              <p class="ib-advice-reason"><span>原因：</span>${advice.reason || "—"}</p>
              <p class="ib-advice-detail">${advice.detail || ""}</p>
            </div>
          </section>

          <section class="ai-section ai-section-last">
            <p class="ib-action-label">AI 行动</p>
            <div class="ib-action-stack">
              <button type="button" class="ib-action-btn ib-action-btn--watch" data-ib-action="watch">
                加入关注
              </button>
              <button type="button" class="ib-action-btn ib-action-btn--alert" data-ib-action="sell-alert">
                设置出售提醒
              </button>
              <button type="button" class="ib-action-btn ib-action-btn--sell" data-ib-action="sell-now">
                立即卖货
              </button>
            </div>
          </section>
        </div>`;

      el.querySelector("#ibDetailBack").onclick = () => onBack && onBack();

      el.querySelectorAll("[data-ib-action]").forEach((btn) => {
        btn.onclick = () => {
          const action = btn.dataset.ibAction;
          if (onAction) {
            onAction(action, row);
            return;
          }
          // 默认本地处理
          if (global.DailyInsightData) {
            if (action === "watch") {
              DailyInsightData.addWatch(row);
              toast && toast(`已加入关注：${row.name}`);
            } else if (action === "sell-alert") {
              DailyInsightData.setSellAlert(row);
              toast && toast(`已设置出售提醒：${row.name}`);
            } else if (action === "sell-now") {
              toast && toast(`准备卖货：${row.name}`);
            }
          }
        };
      });
    },
  };
})(window);
