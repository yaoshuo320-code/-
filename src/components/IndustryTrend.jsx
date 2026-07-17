/**
 * IndustryTrend — 二手3C行业生命周期地图
 * 二级筛选 + 三级品类选择 + AI行业建议
 */
(function (global) {
  global.IndustryTrend = {
    renderProductTabs(containerId, { sector, activeProductId, onSelect }) {
      const el = document.getElementById(containerId);
      if (!el) return;

      if (!sector || sector === "all") {
        el.innerHTML = `<div class="industry-trend-hint">选择二级品类后，再点三级品类查看全年曲线</div>`;
        return;
      }

      const products = (global.SeasonTrendData && SeasonTrendData.getProductsBySector(sector)) || [];
      if (!products.length) {
        el.innerHTML = `<div class="industry-trend-hint">该品类暂无三级数据</div>`;
        return;
      }

      el.innerHTML = `
        <div class="season-product-tabs">
          ${products.map((p) => `
            <button type="button"
              class="season-product-tab ${p.id === activeProductId ? "active" : ""}"
              data-industry-product="${p.id}">
              ${p.name}
            </button>`).join("")}
        </div>`;

      el.querySelectorAll("[data-industry-product]").forEach((btn) => {
        btn.onclick = () => onSelect && onSelect(btn.dataset.industryProduct);
      });
    },

    renderAiAdvice(containerId, { advice }) {
      const el = document.getElementById(containerId);
      if (!el || !advice) return;

      el.innerHTML = `
        <div class="industry-ai-card">
          <h4 class="industry-ai-title">${advice.title}</h4>
          <ul class="industry-ai-points">
            ${(advice.points || []).map((p) => `<li>${p}</li>`).join("")}
          </ul>
          ${advice.action ? `
            <div class="industry-ai-action">
              <span class="industry-ai-kicker">本周动作</span>
              <p>${advice.action}</p>
            </div>` : ""}
        </div>`;
    },

    renderSectorFilter(containerId, { active, onChange }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const sectors = (global.IndustryData?.SECTORS || []).filter((s) => s.key !== "all");
      el.innerHTML = `
        <div class="category-filter theme-industry">
          <div class="category-filter-label">品类选择</div>
          <div class="category-filter-row">
            ${sectors.map((s) => `
              <button type="button" class="cat-pill ${s.key === active ? "active" : ""}" data-sector="${s.key}">${s.label}</button>
            `).join("")}
          </div>
        </div>`;
      el.querySelectorAll("[data-sector]").forEach((btn) => {
        btn.onclick = () => onChange(btn.dataset.sector);
      });
    },
  };
})(window);
