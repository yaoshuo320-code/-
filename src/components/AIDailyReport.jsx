/**
 * AIDailyReport — V1.7 AI 经营日报
 * 智脑每日打开理由：今天发生什么 / 应该做什么 / 哪里有风险
 * 晨曦橙 + 白色玻璃，数据来自 DailyReportData
 */
(function (global) {
  function greetingMeta() {
    const h = new Date().getHours();
    if (h < 5) return { text: "夜深了", emoji: "🌙" };
    if (h < 12) return { text: "早上好", emoji: "☀️" };
    if (h < 18) return { text: "下午好", emoji: "☀️" };
    return { text: "晚上好", emoji: "🌙" };
  }

  function greetingBlock(report) {
    const greet = greetingMeta();
    const delta = report.todayDelta || "";
    const deltaGood = String(delta).startsWith("+");
    return `
      <section class="ai-section daily-report-greet">
        <div class="daily-report-greet-card">
          <h2 class="daily-report-hello">${greet.text}，老板 ${greet.emoji}</h2>
          <div class="daily-report-health-row">
            <div class="daily-report-health">
              <span class="daily-report-health-label">经营健康度</span>
              <span class="daily-report-health-num">${report.healthScore}</span>
              <span class="daily-report-health-unit">分</span>
            </div>
            <div class="daily-report-delta ${deltaGood ? "is-good" : "is-warn"}">
              <span class="daily-report-delta-label">今日变化</span>
              <span class="daily-report-delta-value">${delta}</span>
              <span class="daily-report-delta-text">${report.todayDeltaText || ""}</span>
            </div>
          </div>
        </div>
      </section>`;
  }

  function oneLinerBlock(text) {
    if (!text) return "";
    return `
      <section class="ai-section">
        <div class="daily-report-oneliner">
          <p class="daily-report-oneliner-kicker">今日一句话判断</p>
          <p class="daily-report-oneliner-text">“${text}”</p>
        </div>
      </section>`;
  }

  function actionCard(item) {
    if (!item) return "";
    const extra = item.type === "profit" && item.profit
      ? `<span class="daily-action-profit">${item.profit}</span>`
      : "";
    return `
      <article class="daily-action-card daily-action-card--${item.type}" data-action-type="${item.type}">
        <div class="daily-action-top">
          <span class="daily-action-kicker">${item.icon} ${item.label}</span>
          ${extra}
        </div>
        <h4 class="daily-action-name">${item.name}</h4>
        <p class="daily-action-reason">${item.reason || ""}</p>
        <p class="daily-action-suggest">建议：${item.suggest || "—"}</p>
      </article>`;
  }

  function actionsBlock(actions) {
    const a = actions || {};
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">✅</span>
          <span class="ai-section-title">今日三个动作</span>
        </div>
        <div class="daily-action-list">
          ${actionCard(a.opportunity)}
          ${actionCard(a.risk)}
          ${actionCard(a.profit)}
        </div>
      </section>`;
  }

  function changesBlock(changes) {
    const rows = (changes || []).map((t, i) => `
      <div class="inv-trend-row" style="animation-delay:${i * 60}ms">
        <span class="inv-trend-label">${t.label}</span>
        <span class="inv-trend-main">
          <span class="inv-trend-value ${t.good ? "is-good" : "is-warn"}">${t.dir === "up" ? "↑" : "↓"} ${t.value}</span>
          <span class="inv-trend-text">${t.text}</span>
        </span>
      </div>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">📊</span>
          <span class="ai-section-title">我的经营变化</span>
        </div>
        <div class="inv-trend-card">${rows}</div>
      </section>`;
  }

  function historyBlock(history) {
    const rows = (history || []).map((h, i) => `
      <div class="daily-history-row" style="animation-delay:${i * 50}ms">
        <span class="daily-history-date">${h.date}</span>
        <span class="daily-history-body">
          <span class="daily-history-advice">${h.advice}</span>
          <span class="daily-history-result daily-history-result--${h.status || "done"}">${h.result}</span>
        </span>
      </div>`).join("");

    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">📝</span>
          <span class="ai-section-title">AI 经营记录</span>
        </div>
        <div class="daily-history-card">${rows}</div>
      </section>`;
  }

  global.AIDailyReport = {
    render(containerId, { data, onActionClick, onHistoryClick } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const report = data || (global.DailyReportData && DailyReportData.getReport()) || null;
      if (!report) {
        el.innerHTML = "";
        return;
      }

      el.innerHTML = `
        <div class="daily-report">
          <div class="ai-section-head daily-report-title-row">
            <span class="ai-section-icon">☀️</span>
            <span class="ai-section-title">AI 经营日报</span>
            <span class="ai-section-count">${report.generatedAt || "今日"}</span>
          </div>
          ${greetingBlock(report)}
          ${oneLinerBlock(report.oneLiner)}
          ${actionsBlock(report.actions)}
          ${changesBlock(report.changes)}
          ${historyBlock(report.history)}
        </div>`;

      el.querySelectorAll("[data-action-type]").forEach((card) => {
        if (!onActionClick) return;
        card.style.cursor = "pointer";
        card.onclick = () => {
          const key = card.dataset.actionType;
          onActionClick(report.actions && report.actions[key]);
        };
      });

      el.querySelectorAll(".daily-history-row").forEach((row, idx) => {
        if (!onHistoryClick) return;
        row.style.cursor = "pointer";
        row.onclick = () => onHistoryClick((report.history || [])[idx]);
      });
    },
  };
})(window);
