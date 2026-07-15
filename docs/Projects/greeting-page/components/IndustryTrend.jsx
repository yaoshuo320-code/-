/**
 * IndustryTrend — trend map + sector filter.
 */
(function (global) {
  function trendSection(title, icon, cls, items, renderItem) {
    if (!items || !items.length) return "";
    return `
      <div class="trend-map-section ${cls}">
        <div class="trend-map-head"><span class="trend-map-icon">${icon}</span><span>${title}</span></div>
        <div class="trend-map-items">
          ${items.map(renderItem).join("")}
        </div>
      </div>`;
  }

  global.IndustryTrend = {
    render(containerId, { sector, trends, trendMap }) {
      const el = document.getElementById(containerId);
      if (!el) return;

      if (!sector || sector === "all") {
        el.innerHTML = `
          <div class="industry-trend-hint">选择二级品类，查看二手市场趋势地图</div>`;
        return;
      }

      if (trendMap) {
        el.innerHTML = `
          <div class="trend-map">
            ${trendSection("上涨", "↑", "rising", trendMap.rising, (item) => `
              <div class="trend-map-item">
                <span class="trend-map-name">${item.name}</span>
                <span class="trend-map-change up">${item.change}</span>
              </div>`)}
            ${trendSection("稳定", "→", "stable", trendMap.stable, (item) => `
              <div class="trend-map-item">
                <span class="trend-map-name">${item.name}</span>
                <span class="trend-map-change flat">${item.change}</span>
              </div>`)}
            ${trendSection("下降", "↓", "falling", trendMap.falling, (item) => `
              <div class="trend-map-item">
                <span class="trend-map-name">${item.name}</span>
                <span class="trend-map-change down">${item.change}</span>
              </div>`)}
            ${trendSection("机会", "✨", "opportunity", trendMap.opportunity, (item) => `
              <div class="trend-map-item opp">
                <span class="trend-map-name">${item.name}</span>
                <span class="trend-map-note">${item.note}</span>
              </div>`)}
          </div>`;
        return;
      }

      if (!trends.length) {
        el.innerHTML = `<div class="industry-trend-hint">该行业暂无趋势数据</div>`;
        return;
      }

      el.innerHTML = trends.map((item) => `
        <div class="trend-card">
          <div class="trend-card-top">
            <strong>${item.name}</strong>
            <span class="trend-heat">${item.heat}</span>
          </div>
          <div class="trend-meta">
            <span class="trend-growth">${item.growth}</span>
            <span class="trend-label">增长趋势</span>
          </div>
          <p class="trend-opportunity">${item.opportunity}</p>
        </div>`).join("");
    },

    renderSectorFilter(containerId, { active, onChange }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const sectors = global.IndustryData?.SECTORS || [];
      el.innerHTML = `
        <div class="category-filter theme-industry">
          <div class="category-filter-label">二级品类</div>
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
