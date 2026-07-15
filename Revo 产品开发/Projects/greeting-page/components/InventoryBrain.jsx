/**
 * InventoryBrain — 智脑「我的库存大脑」
 * 独立组件，数据来自 InventoryData，后续可接真实库存库
 */
(function (global) {
  function overviewCards(overview) {
    const items = [
      { label: "库存总量", value: `${overview.total}件`, tone: "total" },
      { label: "风险库存", value: `${overview.risk}件`, tone: "risk" },
      { label: "高利润机会", value: `${overview.profitOpp}件`, tone: "profit" },
      { label: "待处理", value: `${overview.pending}件`, tone: "pending" },
    ];
    return items.map((c, i) => `
      <div class="inv-brain-stat inv-brain-stat--${c.tone}" style="animation-delay:${60 + i * 50}ms">
        <span class="inv-brain-stat-label">${c.label}</span>
        <span class="inv-brain-stat-value">${c.value}</span>
      </div>`).join("");
  }

  function diagnoseCards(list) {
    return (list || []).map((item, i) => `
      <article class="inv-brain-diag inv-brain-diag--${item.type}" style="animation-delay:${i * 70}ms">
        <div class="inv-brain-diag-top">
          <span class="inv-brain-diag-kicker">${item.icon} ${item.title}</span>
        </div>
        <h4 class="inv-brain-diag-name">${item.name}</h4>
        <div class="inv-brain-diag-meta">
          ${(item.meta || []).map((m) => `<span>${m}</span>`).join("")}
        </div>
        <p class="inv-brain-diag-suggest">建议：${item.suggest}</p>
      </article>`).join("");
  }

  global.InventoryBrain = {
    render(containerId, { data, onImport, onDiagClick } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el) return;

      const brain = data || (global.InventoryData && global.InventoryData.getBrain()) || null;
      if (!brain) {
        el.innerHTML = "";
        return;
      }

      const { overview, diagnoses, importSchema } = brain;
      const fields = (importSchema || []).map((f) => f.label).join(" · ");

      el.innerHTML = `
        <section class="ai-section inv-brain">
          <div class="ai-section-head">
            <span class="ai-section-icon">🧠</span>
            <span class="ai-section-title">我的库存大脑</span>
          </div>

          <div class="inv-brain-card">
            <div class="inv-brain-overview">
              ${overviewCards(overview)}
            </div>

            <div class="inv-brain-diag-head">
              <span>AI 库存诊断</span>
            </div>
            <div class="inv-brain-diag-list">
              ${diagnoseCards(diagnoses)}
            </div>

            <button type="button" class="inv-brain-import" id="invBrainImportBtn">
              <span class="inv-brain-import-title">导入库存</span>
              <span class="inv-brain-import-sub">支持 Excel / CSV</span>
              <span class="inv-brain-import-fields">${fields}</span>
            </button>
          </div>
        </section>`;

      const importBtn = el.querySelector("#invBrainImportBtn");
      if (importBtn) {
        importBtn.onclick = () => onImport && onImport(brain.importSchema);
      }

      el.querySelectorAll(".inv-brain-diag").forEach((card, idx) => {
        card.style.cursor = onDiagClick ? "pointer" : "default";
        if (!onDiagClick) return;
        card.onclick = () => onDiagClick(diagnoses[idx]);
      });
    },
  };
})(window);
