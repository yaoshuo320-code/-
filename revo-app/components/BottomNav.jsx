/**
 * BottomNav — V2 3-tab：生意 / 智脑 / 市场
 * 生意 (business) = 管理自己的经营：库存 / 利润 / 收货 / 卖货
 * 智脑 (brain)    = Revo 主入口，AI店长 Dashboard
 * 市场 (market)   = 观察外部变化：行业趋势 / 热门品类 / 市场机会
 * 旧页面（buy/sell/inventory/opportunity/industry）保留，由 app.js 映射到新 Tab
 */
(function (global) {
  const TABS = [
    { page: "business", icon: "📦", label: "生意" },
    { page: "brain", icon: "✨", label: "智脑", center: true },
    { page: "market", icon: "📈", label: "市场" },
  ];

  global.BottomNav = {
    TABS,

    render(containerId, { active, onNavigate }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = TABS.map((tab) => tab.center
        ? `<button type="button" class="nav-item nav-center ${active === tab.page ? "active" : ""}" data-page="${tab.page}" aria-label="智脑">
            <span class="nav-center-glow"></span>
            <span class="nav-center-ring" aria-hidden="true"></span>
            <span class="nav-icon-wrap"><span class="nav-ai-badge">AI</span>${tab.icon}</span>
            <span class="nav-center-label">${tab.label}</span>
          </button>`
        : `<button type="button" class="nav-item ${active === tab.page ? "active" : ""}" data-page="${tab.page}">
            <span class="nav-icon">${tab.icon}</span><span>${tab.label}</span>
          </button>`).join("");
      el.querySelectorAll("[data-page]").forEach((btn) => {
        btn.onclick = () => {
          // 智脑即使已是 active，也必须再次触发 → 重渲 Dashboard
          onNavigate(btn.dataset.page);
        };
      });
    },

    setActive(page) {
      document.querySelectorAll(".bottom-nav .nav-item").forEach((b) => {
        const isActive = !!page && b.dataset.page === page;
        b.classList.toggle("active", isActive);
        if (isActive && b.classList.contains("nav-center")) {
          b.classList.remove("nav-pop");
          void b.offsetWidth;
          b.classList.add("nav-pop");
          clearTimeout(b._popTimer);
          b._popTimer = setTimeout(() => b.classList.remove("nav-pop"), 480);
        }
      });
    },
  };
})(window);
