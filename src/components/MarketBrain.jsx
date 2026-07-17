/**
 * MarketBrain — V1.8 市场大脑
 * 帮助二手商家理解市场变化的 AI 分析中心（非价格查询工具）
 * 数据来自 MarketData.getBrain()
 */
(function (global) {
  function heroBlock(data) {
    const deltaUp = String(data.delta || "").startsWith("+");
    return `
      <section class="ai-welcome mkt-brain-hero">
        <h1 class="ai-welcome-title">📈 市场大脑</h1>
        <p class="ai-welcome-sub">理解市场变化 · 发现经营机会</p>
        <div class="mkt-temp-card">
          <div class="mkt-temp-main">
            <span class="mkt-temp-label">今日市场温度</span>
            <span class="mkt-temp-score">${data.temperature}<em>分</em></span>
          </div>
          <div class="mkt-temp-delta ${deltaUp ? "is-up" : "is-down"}">
            <span class="mkt-temp-delta-label">变化</span>
            <span class="mkt-temp-delta-value">${data.delta}</span>
            <span class="mkt-temp-delta-text">${data.deltaText || ""}</span>
          </div>
        </div>
      </section>`;
  }

  function categoryCards(list) {
    return (list || []).map((c, i) => `
      <article class="mkt-cat-card mkt-cat-card--${c.trend}" data-cat-id="${c.id}" style="animation-delay:${i * 60}ms">
        <div class="mkt-cat-top">
          <h4 class="mkt-cat-name">${c.name}</h4>
          <span class="mkt-cat-heat">${c.heat}</span>
        </div>
        <p class="mkt-cat-trend">${c.trendText}</p>
        <p class="mkt-cat-judge">AI判断：${c.judge}</p>
      </article>`).join("");
  }

  function opportunityCards(list) {
    return (list || []).map((o, i) => `
      <article class="mkt-opp-card" data-opp-id="${o.id}" style="animation-delay:${i * 60}ms">
        <h4 class="mkt-opp-name">${o.name}</h4>
        <div class="mkt-opp-reasons">
          ${(o.reasons || []).map((r) => `<span>${r}</span>`).join("")}
        </div>
        <p class="mkt-opp-suggest">建议：${o.suggest}</p>
      </article>`).join("");
  }

  function priceRows(list) {
    return (list || []).map((p, i) => `
      <div class="mkt-price-row mkt-price-row--${p.tone || "good"}" data-price-id="${p.id}" style="animation-delay:${i * 50}ms">
        <div class="mkt-price-main">
          <span class="mkt-price-name">${p.name}</span>
          <span class="mkt-price-range">区间 ${p.range}</span>
        </div>
        <div class="mkt-price-side">
          <span class="mkt-price-change">${p.change7d} · ${p.changeText}</span>
          <span class="mkt-price-judge">${p.judge}</span>
        </div>
      </div>`).join("");
  }

  function alertCards(list) {
    return (list || []).map((a, i) => `
      <article class="mkt-alert-card" style="animation-delay:${i * 50}ms">
        <p class="mkt-alert-title">${a.icon} ${a.title}</p>
        <p class="mkt-alert-text">${a.text}</p>
      </article>`).join("");
  }

  global.MarketBrain = {
    render(containerId, { data, onCategoryClick, onOppClick, onPriceClick, onDeepLink } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const brain = data || (global.MarketData && MarketData.getBrain()) || null;
      if (!brain) {
        el.innerHTML = "";
        return;
      }

      let seasonCatId = (brain.categories && brain.categories[0] && brain.categories[0].id) || "phone";

      el.innerHTML = `
        <div class="ai-dash mkt-brain-page">
          ${heroBlock(brain)}

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">📂</span>
              <span class="ai-section-title">品类趋势</span>
            </div>
            <div class="mkt-cat-grid">${categoryCards(brain.categories)}</div>
          </section>

          <div id="seasonTrendMount"></div>

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">💡</span>
              <span class="ai-section-title">市场机会</span>
            </div>
            <div class="mkt-opp-list">${opportunityCards(brain.opportunities)}</div>
          </section>

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">📉</span>
              <span class="ai-section-title">价格趋势</span>
            </div>
            <div class="mkt-price-card">${priceRows(brain.priceTrends)}</div>
          </section>

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">🌎</span>
              <span class="ai-section-title">行业提醒</span>
            </div>
            <div class="mkt-alert-list">${alertCards(brain.industryAlerts)}</div>
          </section>

          <section class="ai-section ai-section-last">
            <div class="biz-quick-row">
              <button type="button" class="biz-quick-btn" data-mkt-link="industry">行业雷达</button>
              <button type="button" class="biz-quick-btn" data-mkt-link="opportunity">机会地图</button>
            </div>
          </section>
        </div>`;

      function paintSeason(id, productId) {
        seasonCatId = id;
        if (global.SeasonTrend) {
          SeasonTrend.render("seasonTrendMount", {
            activeId: seasonCatId,
            productId,
            onCategoryChange: (nextId) => paintSeason(nextId),
            onProductChange: (nextProductId, sectorId) => paintSeason(sectorId, nextProductId),
          });
        }
      }
      paintSeason(seasonCatId);

      el.querySelectorAll("[data-cat-id]").forEach((card) => {
        card.style.cursor = "pointer";
        card.onclick = () => {
          const item = (brain.categories || []).find((c) => c.id === card.dataset.catId);
          paintSeason(card.dataset.catId);
          // 滚到淡旺季模块
          const mount = document.getElementById("seasonTrendMount");
          if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
          onCategoryClick && onCategoryClick(item);
        };
      });

      el.querySelectorAll("[data-opp-id]").forEach((card) => {
        if (!onOppClick) return;
        card.style.cursor = "pointer";
        card.onclick = () => {
          const item = (brain.opportunities || []).find((o) => o.id === card.dataset.oppId);
          onOppClick(item);
        };
      });

      el.querySelectorAll("[data-price-id]").forEach((row) => {
        if (!onPriceClick) return;
        row.style.cursor = "pointer";
        row.onclick = () => {
          const item = (brain.priceTrends || []).find((p) => p.id === row.dataset.priceId);
          onPriceClick(item);
        };
      });

      el.querySelectorAll("[data-mkt-link]").forEach((btn) => {
        btn.onclick = () => onDeepLink && onDeepLink(btn.dataset.mktLink);
      });
    },
  };
})(window);
