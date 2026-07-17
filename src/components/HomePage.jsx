/**
 * HomePage — Revo V2.0 智脑首页（手机 MVP）
 * 第一屏：问Revo → 首次体验 → 经营提醒 → 库存大脑 → 行业趋势
 */
(function (global) {
  const GUIDE_KEY = "revo_brain_guide_seen_v1";

  function greetingMeta() {
    const h = new Date().getHours();
    if (h < 5) return { text: "夜深了", emoji: "🌙" };
    if (h < 12) return { text: "早上好", emoji: "☀️" };
    if (h < 18) return { text: "下午好", emoji: "☀️" };
    return { text: "晚上好", emoji: "🌙" };
  }

  function hasSeenGuide() {
    try {
      return !!localStorage.getItem(GUIDE_KEY);
    } catch {
      return true;
    }
  }

  function markGuideSeen() {
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch { /* ignore */ }
  }

  function summaryCards(summary) {
    const chance = summary.chance ?? summary.opportunity ?? 0;
    const attention = summary.attention ?? 0;
    const risk = summary.risk ?? 0;
    const heat = summary.heat ?? summary.market ?? "—";

    return [
      { tone: "good", icon: "🟢", label: "机会", value: `${chance}个` },
      { tone: "warn", icon: "🟡", label: "关注", value: `${attention}个` },
      { tone: "bad", icon: "🔴", label: "风险", value: `${risk}个` },
      { tone: "heat", icon: "📈", label: "市场热度", value: heat },
    ].map((c, i) => `
      <div class="ai-stat-card ai-stat-${c.tone}" style="animation-delay:${80 + i * 60}ms">
        <span class="ai-stat-icon">${c.icon}</span>
        <span class="ai-stat-label">${c.label}</span>
        <span class="ai-stat-value">${c.value}</span>
      </div>`).join("");
  }

  function oppCards(list) {
    return (list || []).map((item, i) => `
      <article class="ai-opp-card float-card" style="animation-delay:${i * 100}ms">
        <div class="ai-opp-top">
          <div>
            <p class="ai-opp-name">${item.name}</p>
            <span class="ai-opp-badge">${item.tag || item.suggest || "关注"}</span>
          </div>
          <div class="ai-opp-score-wrap">
            <span class="ai-opp-score-label">机会指数</span>
            <span class="ai-opp-score">${item.score}</span>
          </div>
        </div>
        ${(item.reason || []).length ? `
          <div class="ai-opp-reasons">
            ${item.reason.map((r) => `<span class="ai-opp-reason">${r}</span>`).join("")}
          </div>` : ""}
        <div class="ai-opp-advise">
          <span class="ai-opp-advise-label">AI建议</span>
          <strong>${item.suggest || "—"}</strong>
        </div>
        <button type="button" class="ai-opp-detail" data-opp-id="${item.id}">查看详情</button>
      </article>`).join("");
  }

  function trendChips(trends) {
    return (trends || []).map((t) => `
      <span class="ai-trend-chip ai-trend-${t.level}">
        ${t.label} <em>${t.text}</em>
      </span>`).join("");
  }

  global.HomePage = {
    GUIDE_KEY,
    markGuideSeen,

    render(containerId, {
      data,
      onOppClick,
      onAskRevo,
      onAskMode,
      onIndustryClick,
      onMessage,
      onSettings,
    }) {
      const el = document.getElementById(containerId);
      if (!el || !data) return;

      const { summary, opportunities, trends, notice, brandLine, welcomeSummary } = data;
      const greet = greetingMeta();

      el.innerHTML = `
        <div class="ai-dash ai-dash--mvp">
          <header class="ai-dash-header">
            <button type="button" class="ai-brand" id="aiBrandBtn" aria-label="Revo">
              <span class="ai-brand-mark"></span>
              <span class="ai-brand-text">Revo</span>
            </button>
            <div class="ai-dash-actions">
              <button type="button" class="ai-icon-btn" id="aiMsgBtn" aria-label="消息">💬</button>
              <button type="button" class="ai-icon-btn" id="aiSetBtn" aria-label="设置">⚙️</button>
            </div>
          </header>

          <section class="ai-section ai-section-top-entry">
            <div class="ai-ask-card ai-ask-card--hero" id="aiAskMain">
              <div class="ai-ask-glow"></div>
              <div class="ai-ask-head">
                <span class="ai-ask-kicker">✨ 问Revo</span>
                <p class="ai-ask-hero-copy">拍一件货，<br>30秒知道值不值得收。</p>
              </div>
              <div class="ai-ask-modes ai-ask-modes--hero">
                <button type="button" class="ai-ask-mode" data-mode="photo">📷 拍照分析</button>
                <button type="button" class="ai-ask-mode" data-mode="type">⌨ 输入型号</button>
                <button type="button" class="ai-ask-mode" data-mode="voice">🎤 语音描述</button>
              </div>
            </div>
          </section>

          <div id="firstExperienceMount"></div>
          <div id="dailyInsightMount"></div>
          <div id="inventoryBrainMount"></div>

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">🌎</span>
              <span class="ai-section-title">今日行业趋势</span>
            </div>
            <div class="ai-trend-card">
              <div class="ai-trend-chips">${trendChips(trends)}</div>
              <button type="button" class="ai-trend-btn" id="aiIndustryBtn">查看行业雷达</button>
            </div>
          </section>

          <section class="ai-welcome ai-welcome--shifted">
            <h1 class="ai-welcome-title">${greet.text}，老板 ${greet.emoji}</h1>
            <p class="ai-welcome-sub">Revo 已经分析今日市场：</p>
            <p class="ai-welcome-summary">${welcomeSummary || ""}</p>
            <p class="ai-brand-line">“${brandLine || "我帮你盯市场，你负责做决定。"}”</p>
          </section>

          <div id="aiDailyReportMount"></div>

          ${notice ? `
          <section class="ai-section">
            <div class="ai-notice-card">
              <p class="ai-notice-title">Revo提醒</p>
              <p class="ai-notice-text">“${notice}”</p>
            </div>
          </section>` : ""}

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-title">今日市场</span>
            </div>
            <div class="ai-stat-grid">${summaryCards(summary)}</div>
          </section>

          <section class="ai-section ai-section-last">
            <div class="ai-section-head">
              <span class="ai-section-icon">🔥</span>
              <span class="ai-section-title">今日赚钱机会</span>
              <span class="ai-section-count">TOP ${Math.min(3, (opportunities || []).length)}</span>
            </div>
            <div class="ai-opp-list">${oppCards((opportunities || []).slice(0, 3))}</div>
          </section>
        </div>`;

      el.querySelectorAll("[data-opp-id]").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          onOppClick && onOppClick(btn.dataset.oppId);
        };
      });

      el.querySelectorAll("#aiAskMain [data-mode]").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const mode = btn.dataset.mode;
          if (onAskMode) onAskMode(mode);
          else if (onAskRevo) onAskRevo();
        };
      });

      const industryBtn = document.getElementById("aiIndustryBtn");
      if (industryBtn) industryBtn.onclick = () => onIndustryClick && onIndustryClick();

      const msgBtn = document.getElementById("aiMsgBtn");
      if (msgBtn) msgBtn.onclick = () => onMessage && onMessage();

      const setBtn = document.getElementById("aiSetBtn");
      if (setBtn) setBtn.onclick = () => onSettings && onSettings();
    },
  };
})(window);
