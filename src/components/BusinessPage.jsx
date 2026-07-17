/**
 * BusinessPage — V1.5 生意 Tab · 经营驾驶舱
 * 回答一个问题：“我的生意现在怎么样？”
 * 晨曦橙 + 白色玻璃，复用 ai-dash / inv-brain 视觉体系
 * 数据来自 BusinessData.getDashboard()
 */
(function (global) {
  function greetingMeta() {
    const h = new Date().getHours();
    if (h < 5) return { text: "夜深了", emoji: "🌙" };
    if (h < 12) return { text: "早上好", emoji: "☀️" };
    if (h < 18) return { text: "下午好", emoji: "☀️" };
    return { text: "晚上好", emoji: "🌙" };
  }

  function scoreTone(value) {
    if (value >= 85) return "good";
    if (value >= 75) return "mid";
    return "low";
  }

  function healthModule(cards) {
    const items = (cards || []).map((c, i) => `
      <button type="button" class="biz-score-card" data-score-key="${c.key}" style="animation-delay:${80 + i * 60}ms">
        <span class="biz-score-label">${c.icon} ${c.label}</span>
        <span class="biz-score-value biz-score--${scoreTone(c.value)}">${c.value}</span>
        <span class="biz-score-bar"><i style="width:${c.value}%"></i></span>
      </button>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🧭</span>
          <span class="ai-section-title">经营健康度</span>
        </div>
        <div class="biz-score-grid">${items}</div>
      </section>`;
  }

  function overviewModule(overview) {
    const items = (overview || []).map((o, i) => `
      <div class="inv-brain-stat" style="animation-delay:${60 + i * 50}ms">
        <span class="inv-brain-stat-label">${o.label}</span>
        <span class="inv-brain-stat-value">${o.value}</span>
      </div>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">📊</span>
          <span class="ai-section-title">经营概览</span>
        </div>
        <div class="biz-overview-card">
          <div class="inv-brain-overview">${items}</div>
        </div>
      </section>`;
  }

  function diagnoseModule(diagnoses) {
    const cards = (diagnoses || []).map((item, i) => `
      <article class="inv-brain-diag inv-brain-diag--${item.type}" data-diag-id="${item.id}" style="animation-delay:${i * 70}ms">
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
          <span class="ai-section-title">AI 经营诊断</span>
        </div>
        <div class="inv-brain-diag-list">${cards}</div>
      </section>`;
  }

  function topRows(list, tone) {
    return (list || []).slice(0, 5).map((p, i) => `
      <div class="biz-top-row" style="animation-delay:${i * 50}ms">
        <span class="biz-top-rank biz-top-rank--${tone}">${i + 1}</span>
        <span class="biz-top-body">
          <span class="biz-top-name">${p.name}</span>
          <span class="biz-top-meta">利润 ${p.profit} · 周转 ${p.turnover}</span>
        </span>
        <span class="biz-top-suggest biz-top-suggest--${tone}">${p.suggest}</span>
      </div>`).join("");
  }

  function productModule(products) {
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🏆</span>
          <span class="ai-section-title">商品分析</span>
        </div>

        <div class="biz-top-card">
          <div class="biz-top-head biz-top-head--profit">💰 赚钱 TOP5</div>
          ${topRows(products && products.earning, "profit")}
        </div>

        <div class="biz-top-card">
          <div class="biz-top-head biz-top-head--risk">⚠️ 风险 TOP5</div>
          ${topRows(products && products.risk, "risk")}
        </div>
      </section>`;
  }

  function quickNavModule() {
    return `
      <section class="ai-section ai-section-last">
        <div class="biz-quick-row">
          <button type="button" class="biz-quick-btn" data-quick-page="buy">📦 收货分析</button>
          <button type="button" class="biz-quick-btn" data-quick-page="sell">📈 卖货分析</button>
          <button type="button" class="biz-quick-btn" data-quick-page="inventory">🧠 我的库存</button>
          <button type="button" class="biz-quick-btn" data-quick-page="profile">👤 经营档案</button>
          <button type="button" class="biz-quick-btn" data-quick-page="profile">👤 经营档案</button>
        </div>
      </section>`;
  }

  global.BusinessPage = {
    render(containerId, { data, onDiagClick, onScoreClick, onQuickNav } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const dash = data || (global.BusinessData && global.BusinessData.getDashboard()) || null;
      if (!dash) {
        el.innerHTML = "";
        return;
      }

      const greet = greetingMeta();

      el.innerHTML = `
        <div class="ai-dash biz-page">
          <section class="ai-welcome biz-welcome">
            <h1 class="ai-welcome-title">${greet.text}，老板 ${greet.emoji}</h1>
            <p class="ai-welcome-sub">${dash.welcomeSub || "Revo 已分析你的经营情况："}</p>
            <div class="biz-health-hero" style="--score:${dash.healthScore}">
              <span class="biz-health-num">${dash.healthScore}</span>
              <span class="biz-health-unit">分</span>
              <span class="biz-health-label">经营健康度</span>
            </div>
          </section>

          ${healthModule(dash.healthCards)}
          ${overviewModule(dash.overview)}
          ${diagnoseModule(dash.diagnoses)}
          ${productModule(dash.products)}
          ${quickNavModule()}
        </div>`;

      el.querySelectorAll("[data-score-key]").forEach((btn) => {
        btn.onclick = () => {
          const item = (dash.healthCards || []).find((c) => c.key === btn.dataset.scoreKey);
          onScoreClick && onScoreClick(item);
        };
      });

      el.querySelectorAll("[data-diag-id]").forEach((card) => {
        card.style.cursor = onDiagClick ? "pointer" : "default";
        if (!onDiagClick) return;
        card.onclick = () => {
          const item = (dash.diagnoses || []).find((d) => d.id === card.dataset.diagId);
          onDiagClick(item);
        };
      });

      el.querySelectorAll("[data-quick-page]").forEach((btn) => {
        btn.onclick = () => onQuickNav && onQuickNav(btn.dataset.quickPage);
      });
    },
  };
})(window);
