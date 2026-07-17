/**
 * SeasonTrend — 品类全年淡旺季（曲线版，无月份卡片）
 * 二级品类 → 三级品类 → SeasonTrendChart
 */
(function (global) {
  global.SeasonTrend = {
    render(containerId, { activeId, productId, onCategoryChange, onProductChange } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el || !global.SeasonTrendData) return;

      const sectors = SeasonTrendData.getSectors();
      const sectorId = activeId || (sectors[0] && sectors[0].id) || "phone";
      const products = SeasonTrendData.getProductsBySector(sectorId);
      const selectedProductId = productId
        || (products.find((p) => p.hasCurve) || products[0] || {}).id;

      el.innerHTML = `
        <section class="ai-section season-trend-section">
          <div class="ai-section-head">
            <span class="ai-section-icon">📅</span>
            <span class="ai-section-title">品类全年淡旺季趋势</span>
          </div>
          <p class="season-trend-sub">提前判断未来机会 · 从被动销售到主动经营</p>
          <div class="season-tabs">
            ${sectors.map((s) => `
              <button type="button" class="season-tab ${s.id === sectorId ? "active" : ""}" data-season-cat="${s.id}">${s.name}</button>
            `).join("")}
          </div>
          <div class="season-product-tabs">
            ${products.map((p) => `
              <button type="button" class="season-product-tab ${p.id === selectedProductId ? "active" : ""}" data-season-product="${p.id}">${p.name}</button>
            `).join("")}
          </div>
          <div id="seasonTrendChartMount"></div>
        </section>`;

      if (global.SeasonTrendChart && selectedProductId) {
        SeasonTrendChart.render("seasonTrendChartMount", {
          productId: selectedProductId,
          showInsight: true,
        });
      }

      el.querySelectorAll("[data-season-cat]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.seasonCat;
          if (onCategoryChange) onCategoryChange(id);
          else this.render(el, { activeId: id, onCategoryChange, onProductChange });
        };
      });

      el.querySelectorAll("[data-season-product]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.seasonProduct;
          if (onProductChange) onProductChange(id, sectorId);
          else this.render(el, {
            activeId: sectorId,
            productId: id,
            onCategoryChange,
            onProductChange,
          });
        };
      });
    },
  };
})(window);
