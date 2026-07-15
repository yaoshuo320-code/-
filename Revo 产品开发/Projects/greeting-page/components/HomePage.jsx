/**
 * HomePage — Revo V1.1 AI店长 Dashboard
 * 智脑 Tab 唯一主入口：AI 二手3C经营伙伴
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

  function guideCard() {
    if (hasSeenGuide()) return "";
    return `
      <section class="ai-section">
        <div class="ai-guide-card">
          <p class="ai-guide-kicker">第一次使用</p>
          <h3 class="ai-guide-title">试试 Revo AI判断</h3>
          <p class="ai-guide-desc">输入你今天收到的一台机器<br>AI帮你判断：值不值得收</p>
          <button type="button" class="ai-guide-btn" id="aiGuideBtn">立即判断</button>
        </div>
      </section>`;
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
      onGuideStart,
    }) {
      const el = document.getElementById(containerId);
      if (!el || !data) return;

      const { summary, opportunities, trends, notice, brandLine, welcomeSummary } = data;
      const greet = greetingMeta();

      el.innerHTML = `
        <div class="ai-dash">
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

          <section class="ai-welcome">
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
            <p class="ai-welcome-sub">Revo 已经分析今日市场：</p>
            <p class="ai-welcome-summary">${welcomeSummary || ""}</p>
            <p class="ai-brand-line">“${brandLine || "我帮你盯市场，你负责做决定。"}”</p>
          </section>

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

          <section class="ai-section">
            <div class="ai-section-head">
              <span class="ai-section-icon">🔥</span>
              <span class="ai-section-title">今日赚钱机会</span>
              <span class="ai-section-count">TOP ${Math.min(3, (opportunities || []).length)}</span>
            </div>
            <div class="ai-opp-list">${oppCards((opportunities || []).slice(0, 3))}</div>
          </section>

          ${guideCard()}

          <div id="inventoryBrainMount"></div>

          <section class="ai-section">
            <button type="button" class="ai-ask-card" id="aiAskMain">
              <div class="ai-ask-glow"></div>
              <div class="ai-ask-head">
                <span class="ai-ask-kicker">✨ 问 Revo</span>
                <span class="ai-ask-hint">30秒判断是否值得交易</span>
              </div>
              <p class="ai-ask-cta">输入型号 / 拍照 / 语音</p>
              <div class="ai-ask-modes">
                <span class="ai-ask-mode" data-mode="type">⌨️ 输入</span>
                <span class="ai-ask-mode" data-mode="photo">📷 拍照</span>
                <span class="ai-ask-mode" data-mode="voice">🎙 语音</span>
              </div>
            </button>
          </section>

          <section class="ai-section ai-section-last">
            <div class="ai-section-head">
              <span class="ai-section-icon">🌎</span>
              <span class="ai-section-title">今日行业趋势</span>
            </div>
            <div class="ai-trend-card">
              <div class="ai-trend-chips">${trendChips(trends)}</div>
              <button type="button" class="ai-trend-btn" id="aiIndustryBtn">查看行业雷达</button>
            </div>
          </section>
        </div>`;

      el.querySelectorAll("[data-opp-id]").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          onOppClick && onOppClick(btn.dataset.oppId);
        };
      });

      const askMain = document.getElementById("aiAskMain");
      if (askMain) {
        askMain.onclick = (e) => {
          const mode = e.target.closest("[data-mode]")?.dataset?.mode;
          if (mode && onAskMode) {
            e.stopPropagation();
            onAskMode(mode);
            return;
          }
          onAskRevo && onAskRevo();
        };
      }

      const guideBtn = document.getElementById("aiGuideBtn");
      if (guideBtn) {
        guideBtn.onclick = () => {
          markGuideSeen();
          if (onGuideStart) onGuideStart();
          else if (onAskRevo) onAskRevo();
        };
      }

      const industryBtn = document.getElementById("aiIndustryBtn");
      if (industryBtn) industryBtn.onclick = () => onIndustryClick && onIndustryClick();

      const msgBtn = document.getElementById("aiMsgBtn");
      if (msgBtn) msgBtn.onclick = () => onMessage && onMessage();

      const setBtn = document.getElementById("aiSetBtn");
      if (setBtn) setBtn.onclick = () => onSettings && onSettings();
    },
  };
})(window);
