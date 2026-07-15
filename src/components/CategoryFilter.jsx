/**
 * CategoryFilter — unified capsule category selector for all primary tabs.
 */
(function (global) {
  global.CategoryFilter = {
    render(containerId, { active, theme, onChange }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const categories = global.CategoryData?.CATEGORIES || [];
      el.innerHTML = `
        <div class="category-filter theme-${theme || "industry"}">
          <div class="category-filter-label">品类选择</div>
          <div class="category-filter-row">
            ${categories.map((c) => `
              <button type="button" class="cat-pill ${c.key === active ? "active" : ""}" data-cat="${c.key}">${c.label}</button>
            `).join("")}
          </div>
        </div>`;
      el.querySelectorAll("[data-cat]").forEach((btn) => {
        btn.onclick = () => onChange(btn.dataset.cat);
      });
    },
  };
})(window);
