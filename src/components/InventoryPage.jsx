/**
 * InventoryPage — V1.6 库存资产首页
 * 定位：库存不是商品列表，而是商家的经营资产
 * 数据优先来自 InventoryParser + 本地导入结果，回退到 InventoryData mock
 */
(function (global) {
  const STORE_KEY = "revo_inventory_items_v1";

  function loadStoredItems() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveStoredItems(items) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(items || []));
    } catch { /* ignore */ }
  }

  function resolveItems() {
    const stored = loadStoredItems();
    if (stored) return stored;
    if (global.InventoryParser) {
      const mock = InventoryParser.loadMock();
      if (mock.ok) return mock.items;
    }
    const fallback = (global.InventoryData && InventoryData.getBrain().items) || [];
    return fallback.map((row) => {
      const days = global.InventoryParser
        ? InventoryParser.daysSince(row.purchaseDate)
        : 0;
      const capital = (row.cost || 0) * (row.qty || 0);
      const level = days >= 18 ? "risk" : days >= 12 ? "watch" : "healthy";
      return {
        ...row,
        days,
        capital,
        level,
        name: [row.brand, row.model, row.capacity].filter(Boolean).join(" "),
        suggest: level === "risk" ? "优先出售" : level === "watch" ? "关注价格" : "继续持有",
      };
    });
  }

  function buildView(items) {
    const Parser = global.InventoryParser;
    const summary = Parser
      ? Parser.summarize(items)
      : { count: 0, amountText: "¥0", avgDays: 0, healthScore: 0 };
    const groups = Parser
      ? Parser.groupByLevel(items)
      : { healthy: [], watch: [], risk: [] };
    return { items, summary, groups };
  }

  function summaryCards(summary) {
    const cards = [
      { label: "商品数量", value: `${summary.count}件`, tone: "total" },
      { label: "库存金额", value: summary.amountText, tone: "profit" },
      { label: "平均库存天数", value: `${summary.avgDays}天`, tone: "pending" },
      { label: "库存健康度", value: `${summary.healthScore}分`, tone: "risk" },
    ];
    return cards.map((c, i) => `
      <div class="inv-brain-stat inv-brain-stat--${c.tone}" style="animation-delay:${60 + i * 50}ms">
        <span class="inv-brain-stat-label">${c.label}</span>
        <span class="inv-brain-stat-value">${c.value}</span>
      </div>`).join("");
  }

  function productCard(item, i) {
    const capitalText = item.capital >= 10000
      ? `¥${(item.capital / 10000).toFixed(1)}万`
      : `¥${(item.capital || 0).toLocaleString()}`;
    return `
      <article class="inv-asset-item inv-asset-item--${item.level}" data-item-id="${item.id || i}" style="animation-delay:${i * 50}ms">
        <div class="inv-asset-item-top">
          <h4 class="inv-asset-item-name">${item.name || item.model}</h4>
          <span class="inv-asset-item-suggest">${item.suggest || "—"}</span>
        </div>
        <div class="inv-asset-item-meta">
          <span>库存 ${item.qty}件</span>
          <span>天数 ${item.days}天</span>
          <span>资金 ${capitalText}</span>
        </div>
      </article>`;
  }

  function categorySection(key, title, icon, list) {
    const count = (list || []).length;
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">${icon}</span>
          <span class="ai-section-title">${title}</span>
          <span class="ai-section-count">${count} 款</span>
        </div>
        <div class="inv-asset-list">
          ${count
            ? list.map((item, i) => productCard(item, i)).join("")
            : `<div class="inv-asset-empty">暂无${title}</div>`}
        </div>
      </section>`;
  }

  global.InventoryPage = {
    STORE_KEY,
    loadStoredItems,
    saveStoredItems,
    resolveItems,

    render(containerId, { onImport, onCapture, onItemClick } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const view = buildView(resolveItems());
      const { summary, groups } = view;

      el.innerHTML = `
        <div class="ai-dash inv-asset-page">
          <section class="ai-welcome inv-asset-welcome">
            <h1 class="ai-welcome-title">我的库存 📦</h1>
            <p class="ai-welcome-sub">Revo正在管理你的商品资产</p>
            <div class="biz-health-hero" style="--score:${summary.healthScore}">
              <span class="biz-health-num">${summary.healthScore}</span>
              <span class="biz-health-unit">分</span>
              <span class="biz-health-label">库存健康度</span>
            </div>
          </section>

          <section class="ai-section">
            <div class="biz-overview-card">
              <div class="inv-brain-overview">${summaryCards(summary)}</div>
            </div>
          </section>

          <section class="ai-section">
            <div class="inv-entry-stack">
              <button type="button" class="inv-entry-primary" id="invAssetCaptureBtn">
                <span class="inv-entry-primary-icon">📷</span>
                <span class="inv-entry-primary-body">
                  <span class="inv-entry-primary-title">AI拍照入库</span>
                  <span class="inv-entry-primary-sub">拍一张 · AI识别 · 自动生成库存卡</span>
                </span>
              </button>
              <button type="button" class="inv-entry-secondary" id="invAssetImportBtn">
                <span>📄 Excel导入</span>
                <span class="inv-entry-secondary-hint">高级 · 批量导入 CSV / Excel</span>
              </button>
            </div>
          </section>

          ${categorySection("healthy", "健康库存", "✅", groups.healthy)}
          ${categorySection("watch", "关注库存", "👀", groups.watch)}
          ${categorySection("risk", "风险库存", "⚠️", groups.risk)}
        </div>`;

      const captureBtn = el.querySelector("#invAssetCaptureBtn");
      if (captureBtn) captureBtn.onclick = () => onCapture && onCapture();

      const importBtn = el.querySelector("#invAssetImportBtn");
      if (importBtn) importBtn.onclick = () => onImport && onImport();

      el.querySelectorAll("[data-item-id]").forEach((card) => {
        if (!onItemClick) return;
        card.style.cursor = "pointer";
        card.onclick = () => {
          const flat = [...groups.healthy, ...groups.watch, ...groups.risk];
          const item = flat.find((x) => String(x.id) === String(card.dataset.itemId));
          onItemClick(item);
        };
      });
    },
  };
})(window);
