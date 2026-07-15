/**
 * BarChart component — horizontal industry bars.
 */
(function (global) {
  global.BarChart = {
    render(containerId, { items, theme, metrics }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const fillClass = theme === "industry" ? "bar-fill industry" : "bar-fill";
      if (metrics && metrics.length) {
        el.innerHTML = metrics.map((m) => `
          <div class="bar-row">
            <div class="bar-top"><span>${m.label}</span><span>${m.value}%</span></div>
            <div class="bar-track"><div class="${fillClass}" style="width:${m.value}%"></div></div>
          </div>`).join("");
        return;
      }
      el.innerHTML = items.map((item) => `
        <div class="bar-row">
          <div class="bar-top"><span>${item.name || item.category}</span><span>${item.score || item.heat}%</span></div>
          <div class="bar-track"><div class="${fillClass}" style="width:${item.score || item.heat}%"></div></div>
        </div>`).join("");
    },

    renderIndustryBars(containerId, { items, activeKey, onSelect }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = items.map((item) => `
        <button type="button" class="industry-bar-row ${item.key === activeKey ? "active" : ""}" data-sector-key="${item.key}">
          <div class="bar-top"><span>${item.name}</span><span>${item.heat}%</span></div>
          <div class="bar-track"><div class="bar-fill industry" style="width:${item.heat}%"></div></div>
        </button>`).join("");
      if (onSelect) {
        el.querySelectorAll("[data-sector-key]").forEach((row) => {
          row.onclick = () => onSelect(row.dataset.sectorKey);
        });
      }
    },
  };
})(window);
