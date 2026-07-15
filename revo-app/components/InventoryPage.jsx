/**
 * InventoryPage — Revo V2 库存大脑独立页（inventory-dashboard）
 * 晨曦橙 + 白色玻璃，复用 ai-dash / ai-section / inv-brain 视觉体系
 * 数据来自 InventoryData.getDashboard()，未来接真实库存库
 */
(function (global) {
  function greetingMeta() {
    const h = new Date().getHours();
    if (h < 5) return { text: "夜深了", emoji: "🌙" };
    if (h < 12) return { text: "早上好", emoji: "☀️" };
    if (h < 18) return { text: "下午好", emoji: "☀️" };
    return { text: "晚上好", emoji: "🌙" };
  }

  function healthModule(health) {
    if (!health) return "";
    const stats = (health.stats || []).map((s, i) => `
      <div class="inv-brain-stat inv-brain-stat--${s.tone}" style="animation-delay:${80 + i * 50}ms">
        <span class="inv-brain-stat-label">${s.icon} ${s.label}</span>
        <span class="inv-brain-stat-value">${s.value}</span>
      </div>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🧠</span>
          <span class="ai-section-title">库存健康度</span>
        </div>
        <div class="inv-health-card">
          <div class="inv-health-score-wrap">
            <div class="inv-health-score" style="--score:${health.score}">
              <span class="inv-health-score-num">${health.score}</span>
              <span class="inv-health-score-unit">分</span>
            </div>
            <div class="inv-health-score-meta">
              <p class="inv-health-score-label">${health.scoreLabel || "库存健康度"}</p>
              <p class="inv-health-score-desc">${health.scoreDesc || ""}</p>
            </div>
          </div>
          <div class="inv-brain-overview">${stats}</div>
        </div>
      </section>`;
  }

  function diagnoseModule(diagnoses) {
    const cards = (diagnoses || []).map((item, i) => `
      <article class="inv-brain-diag inv-brain-diag--${item.type}" data-diag-idx="${i}" style="animation-delay:${i * 70}ms">
        <div class="inv-brain-diag-top">
          <span class="inv-brain-diag-kicker">${item.icon} ${item.title}</span>
        </div>
        <h4 class="inv-brain-diag-name">${item.name}</h4>
        <div class="inv-brain-diag-meta">
          ${(item.meta || []).map((m) => `<span>${m}</span>`).join("")}
        </div>
        <p class="inv-brain-diag-suggest">建议：${item.suggest}</p>
      </article>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🔍</span>
          <span class="ai-section-title">AI 库存诊断</span>
        </div>
        <div class="inv-brain-diag-list inv-page-diag-list">${cards}</div>
      </section>`;
  }

  function actionModule(actions) {
    const rows = (actions || []).slice(0, 3).map((a, i) => `
      <button type="button" class="inv-action-row" data-action-id="${a.id}" style="animation-delay:${i * 80}ms">
        <span class="inv-action-icon">${a.icon}</span>
        <span class="inv-action-body">
          <span class="inv-action-top">
            <span class="inv-action-tag">${a.tag}</span>
            <span class="inv-action-title">${a.title}</span>
          </span>
          <span class="inv-action-desc">${a.desc}</span>
        </span>
        <span class="inv-action-cta">${a.cta || "查看"}</span>
      </button>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">✅</span>
          <span class="ai-section-title">今日经营行动</span>
          <span class="ai-section-count">优先 3 件</span>
        </div>
        <div class="inv-action-list">${rows}</div>
      </section>`;
  }

  function trendModule(trends) {
    const rows = (trends || []).map((t, i) => `
      <div class="inv-trend-row" style="animation-delay:${i * 70}ms">
        <span class="inv-trend-label">${t.label}</span>
        <span class="inv-trend-main">
          <span class="inv-trend-value ${t.good ? "is-good" : "is-warn"}">${t.dir === "up" ? "↑" : "↓"} ${t.value}</span>
          <span class="inv-trend-text">${t.text}</span>
        </span>
      </div>`).join("");

    return `
      <section class="ai-section ai-section-last">
        <div class="ai-section-head">
          <span class="ai-section-icon">📈</span>
          <span class="ai-section-title">库存趋势</span>
        </div>
        <div class="inv-trend-card">${rows}</div>
      </section>`;
  }

  global.InventoryPage = {
    render(containerId, { data, onImport, onDiagClick, onActionClick } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const dash = data || (global.InventoryData && global.InventoryData.getDashboard()) || null;
      if (!dash) {
        el.innerHTML = "";
        return;
      }

      const greet = greetingMeta();

      el.innerHTML = `
        <div class="ai-dash inv-page">
          <section class="ai-welcome inv-page-welcome">
            <div class="ai-orb-wrap">
              <div class="ai-orb" aria-hidden="true">
                <span class="ai-orb-halo"></span>
                <span class="ai-orb-halo ai-orb-halo-2"></span>
                <span class="ai-orb-ring"></span>
                <span class="ai-orb-ring-2"></span>
                <span class="ai-orb-core"></span>
              </div>
            </div>
            <h1 class="ai-welcome-title">${greet.text}，老板 ${greet.emoji}</h1>
            <p class="ai-welcome-sub">${dash.welcomeSub || "Revo 已分析你的库存，发现新的经营机会"}</p>
          </section>

          ${healthModule(dash.health)}
          ${diagnoseModule(dash.diagnoses)}
          ${actionModule(dash.actions)}

          <section class="ai-section">
            <button type="button" class="inv-brain-import" id="invPageImportBtn">
              <span class="inv-brain-import-title">导入库存</span>
              <span class="inv-brain-import-sub">支持 Excel / CSV</span>
              <span class="inv-brain-import-fields">${
                ((global.InventoryData && global.InventoryData.getImportSchema()) || [])
                  .map((f) => f.label).join(" · ")
              }</span>
            </button>
          </section>

          ${trendModule(dash.trends)}
        </div>`;

      const importBtn = el.querySelector("#invPageImportBtn");
      if (importBtn) {
        importBtn.onclick = () =>
          onImport && onImport(global.InventoryData && global.InventoryData.getImportSchema());
      }

      el.querySelectorAll("[data-diag-idx]").forEach((card) => {
        card.style.cursor = onDiagClick ? "pointer" : "default";
        if (!onDiagClick) return;
        card.onclick = () => onDiagClick(dash.diagnoses[Number(card.dataset.diagIdx)]);
      });

      el.querySelectorAll("[data-action-id]").forEach((btn) => {
        btn.onclick = () => {
          const item = (dash.actions || []).find((a) => a.id === btn.dataset.actionId);
          onActionClick && onActionClick(item);
        };
      });
    },
  };
})(window);
