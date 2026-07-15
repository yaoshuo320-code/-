/**
 * HubPage — V2 一级入口页（生意 / 市场）
 * 只负责导航映射：每个入口卡跳转到既有页面，旧组件全部保留
 * 晨曦橙 + 白色玻璃，复用 ai-dash 视觉体系
 */
(function (global) {
  global.HubPage = {
    render(containerId, { kicker, title, subtitle, entries, onEnter } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const cards = (entries || []).map((item, i) => `
        <button type="button" class="hub-entry" data-hub-id="${item.id}" style="animation-delay:${i * 70}ms" ${item.soon ? 'data-soon="1"' : ""}>
          <span class="hub-entry-icon">${item.icon}</span>
          <span class="hub-entry-body">
            <span class="hub-entry-top">
              <span class="hub-entry-title">${item.title}</span>
              ${item.soon ? '<span class="hub-entry-soon">即将上线</span>' : ""}
            </span>
            <span class="hub-entry-desc">${item.desc || ""}</span>
          </span>
          <span class="hub-entry-arrow">›</span>
        </button>`).join("");

      el.innerHTML = `
        <div class="ai-dash hub-page">
          <section class="hub-hero">
            <p class="hub-kicker">${kicker || ""}</p>
            <h1 class="hub-title">${title || ""}</h1>
            <p class="hub-subtitle">${subtitle || ""}</p>
          </section>
          <section class="ai-section ai-section-last">
            <div class="hub-entry-list">${cards}</div>
          </section>
        </div>`;

      el.querySelectorAll("[data-hub-id]").forEach((btn) => {
        btn.onclick = () => {
          const item = (entries || []).find((e) => e.id === btn.dataset.hubId);
          onEnter && onEnter(item);
        };
      });
    },
  };
})(window);
