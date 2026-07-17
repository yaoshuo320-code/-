/**
 * InventoryDashboard — V1.9 我的库存大脑
 * 库存数量 / 价值 / 预计利润 + AI诊断 + 赚钱机会 / 风险 / 等待
 */
(function (global) {
  function itemCard(item, i) {
    return `
      <article class="ib-dash-item" data-item-id="${item.id}" style="animation-delay:${i * 45}ms">
        <div class="ib-dash-item-top">
          <h4>${item.name}</h4>
          <span class="ib-dash-item-action">${(item.advice && item.advice.action) || "—"}</span>
        </div>
        <div class="ib-dash-item-meta">
          <span>采购 ¥${(item.cost || 0).toLocaleString()}</span>
          <span>区间 ${item.sellRange || "—"}</span>
          <span>${item.days}天</span>
        </div>
        <p class="ib-dash-item-reason">${(item.advice && item.advice.reason) || ""}</p>
      </article>`;
  }

  function bucketBlock(key, title, icon, list) {
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">${icon}</span>
          <span class="ai-section-title">${title}</span>
          <span class="ai-section-count">${(list || []).length} 款</span>
        </div>
        <div class="ib-dash-list">
          ${(list || []).length
            ? list.map((item, i) => itemCard(item, i)).join("")
            : `<div class="ib-dash-empty">暂无${title}</div>`}
        </div>
      </section>`;
  }

  global.InventoryDashboard = {
    render(containerId, { onCapture, onImport, onItemClick, onBack } = {}) {
      const el = document.getElementById(containerId);
      if (!el || !global.InventoryBrainData) return;

      const dash = InventoryBrainData.getDashboard();
      const { summary, diagnosis, buckets } = dash;

      el.innerHTML = `
        <div class="ai-dash ib-dash-page">
          <section class="ai-welcome">
            <h1 class="ai-welcome-title">我的库存大脑</h1>
            <p class="ai-welcome-sub">拍照入库 → AI分析 → 库存决策</p>
          </section>

          <section class="ai-section">
            <div class="ib-dash-stats glass-card">
              <div class="ib-dash-stat">
                <span class="ib-dash-stat-label">库存数量</span>
                <strong>${summary.countText}</strong>
              </div>
              <div class="ib-dash-stat">
                <span class="ib-dash-stat-label">库存价值</span>
                <strong>${summary.valueText}</strong>
              </div>
              <div class="ib-dash-stat ib-dash-stat--profit">
                <span class="ib-dash-stat-label">预计利润</span>
                <strong>${summary.profitText}</strong>
              </div>
            </div>
          </section>

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">🧠</span>
              <span class="ai-section-title">AI库存诊断</span>
            </div>
            <div class="ib-diag-list">
              ${(diagnosis || []).map((d, i) => `
                <div class="ib-diag-card ib-diag-card--${d.tone}" style="animation-delay:${i * 50}ms">
                  ${d.text}
                </div>`).join("")}
            </div>
          </section>

          <section class="ai-section">
            <div class="inv-entry-stack">
              <button type="button" class="inv-entry-primary" id="ibDashCapture">
                <span class="inv-entry-primary-icon">📷</span>
                <span class="inv-entry-primary-body">
                  <span class="inv-entry-primary-title">AI拍照入库</span>
                  <span class="inv-entry-primary-sub">识别 → 分析 → 加入库存大脑</span>
                </span>
              </button>
              <button type="button" class="inv-entry-secondary" id="ibDashImport">
                <span>📄 Excel导入</span>
                <span class="inv-entry-secondary-hint">批量导入</span>
              </button>
            </div>
          </section>

          ${bucketBlock("earn", "赚钱机会", "🔥", buckets.earn)}
          ${bucketBlock("risk", "风险库存", "⚠️", buckets.risk)}
          ${bucketBlock("wait", "等待机会", "💡", buckets.wait)}
        </div>`;

      const capture = el.querySelector("#ibDashCapture");
      if (capture) capture.onclick = () => onCapture && onCapture();
      const importBtn = el.querySelector("#ibDashImport");
      if (importBtn) importBtn.onclick = () => onImport && onImport();

      el.querySelectorAll("[data-item-id]").forEach((card) => {
        card.onclick = () => {
          const item = InventoryBrainData.getItem(card.dataset.itemId);
          onItemClick && onItemClick(item);
        };
      });
    },
  };
})(window);
