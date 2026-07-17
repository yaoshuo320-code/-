/**
 * ProfileBrain — V1.9 我的 AI经营档案
 * 商家的 AI 经营数字画像（非普通个人中心）
 * 数据来自 ProfileData.getBrain()
 */
(function (global) {
  function archiveBlock(archive) {
    const a = archive || {};
    return `
      <section class="ai-welcome profile-hero">
        <h1 class="ai-welcome-title">我的 AI经营档案</h1>
        <p class="ai-welcome-sub">${a.shopName || "经营数字画像"} · Revo 认识你的生意</p>
        <div class="profile-archive-grid">
          <div class="profile-archive-card">
            <span class="profile-archive-label">${a.daysLabel || "经营时间"}</span>
            <span class="profile-archive-value">${a.days}<em>天</em></span>
          </div>
          <div class="profile-archive-card">
            <span class="profile-archive-label">${a.productLabel || "管理商品"}</span>
            <span class="profile-archive-value">${a.productCount}<em>件</em></span>
          </div>
          <div class="profile-archive-card profile-archive-card--wide">
            <span class="profile-archive-label">${a.aiLabel || "累计AI分析"}</span>
            <span class="profile-archive-value">${a.aiAnalysisCount}<em>次</em></span>
          </div>
        </div>
      </section>`;
  }

  function portraitBlock(portrait) {
    const p = portrait || {};
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🧠</span>
          <span class="ai-section-title">AI 认识你</span>
        </div>
        <div class="profile-portrait-card">
          <div class="profile-portrait-row">
            <span class="profile-portrait-label">主营品类</span>
            <strong>${p.mainCategory || "—"}</strong>
          </div>
          <div class="profile-portrait-row">
            <span class="profile-portrait-label">经营习惯</span>
            <strong>${p.habit || "—"}</strong>
          </div>
          <div class="profile-portrait-insight profile-portrait-insight--good">
            <span class="profile-portrait-kicker">你的优势</span>
            <p>${p.strength || "—"}</p>
          </div>
          <div class="profile-portrait-insight profile-portrait-insight--risk">
            <span class="profile-portrait-kicker">你的风险</span>
            <p>${p.risk || "—"}</p>
          </div>
          <p class="profile-portrait-summary">${p.summary || ""}</p>
        </div>
      </section>`;
  }

  function statsBlock(stats) {
    const cards = (stats || []).map((s, i) => `
      <div class="inv-brain-stat" style="animation-delay:${50 + i * 40}ms">
        <span class="inv-brain-stat-label">${s.label}</span>
        <span class="inv-brain-stat-value">${s.value}</span>
      </div>`).join("");
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">📊</span>
          <span class="ai-section-title">我的经营数据</span>
        </div>
        <div class="biz-overview-card">
          <div class="inv-brain-overview">${cards}</div>
        </div>
      </section>`;
  }

  function growthLogBlock(list) {
    const rows = (list || []).map((h, i) => `
      <div class="daily-history-row" data-log-idx="${i}" style="animation-delay:${i * 45}ms">
        <span class="daily-history-date">${h.date}</span>
        <span class="daily-history-body">
          <span class="daily-history-advice">${h.advice}</span>
          <span class="daily-history-result daily-history-result--${h.status || "done"}">${h.result}</span>
        </span>
      </div>`).join("");
    return `
      <section class="ai-section">
        <div class="ai-section-head">
          <span class="ai-section-icon">🌱</span>
          <span class="ai-section-title">AI 成长记录</span>
        </div>
        <div class="daily-history-card">${rows}</div>
      </section>`;
  }

  function levelBlock(level) {
    const l = level || {};
    const tasks = (l.tasks || []).map((t) => `
      <div class="profile-task ${t.done ? "is-done" : ""}">
        <span class="profile-task-check">${t.done ? "✓" : "○"}</span>
        <span class="profile-task-title">${t.title}</span>
      </div>`).join("");

    return `
      <section class="ai-section ai-section-last">
        <div class="ai-section-head">
          <span class="ai-section-icon">🏅</span>
          <span class="ai-section-title">Revo 成长等级</span>
        </div>
        <div class="profile-level-card">
          <div class="profile-level-top">
            <div>
              <p class="profile-level-rank">${l.rank || "Lv.1"}</p>
              <p class="profile-level-name">${l.name || "新手店长"}</p>
            </div>
            <span class="profile-level-next">${l.next || ""}</span>
          </div>
          <div class="profile-level-bar">
            <i style="width:${l.progress || 0}%"></i>
          </div>
          <p class="profile-level-progress">成长进度 ${l.progress || 0}%</p>
          <div class="profile-task-list">
            <p class="profile-task-head">成长任务</p>
            ${tasks}
          </div>
        </div>
      </section>`;
  }

  global.ProfileBrain = {
    render(containerId, { data, onBack, onLogClick } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const brain = data || (global.ProfileData && ProfileData.getBrain()) || null;
      if (!brain) {
        el.innerHTML = "";
        return;
      }

      el.innerHTML = `
        <div class="ai-dash profile-brain-page">
          <button type="button" class="inv-import-back" id="profileBackBtn">← 返回智脑</button>
          ${archiveBlock(brain.archive)}
          ${portraitBlock(brain.portrait)}
          ${statsBlock(brain.stats)}
          ${growthLogBlock(brain.growthLog)}
          ${levelBlock(brain.level)}
        </div>`;

      const back = el.querySelector("#profileBackBtn");
      if (back) back.onclick = () => onBack && onBack();

      el.querySelectorAll("[data-log-idx]").forEach((row) => {
        if (!onLogClick) return;
        row.style.cursor = "pointer";
        row.onclick = () => onLogClick((brain.growthLog || [])[Number(row.dataset.logIdx)]);
      });
    },
  };
})(window);
