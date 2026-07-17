/**
 * FirstExperience — V2.0 首次体验模式
 * 新用户无库存时：30秒体验一台商品分析（iPhone15 Pro）
 */
(function (global) {
  function recognitionBlock(demo) {
    const r = demo.recognition || {};
    return `
      <div class="fx-block">
        <p class="fx-block-kicker">商品识别</p>
        <h3 class="fx-product-name">${demo.product.name}</h3>
        <div class="fx-fields">
          ${(r.fields || []).map((f) => `
            <div class="fx-field">
              <span>${f.label}</span>
              <strong>${f.value}</strong>
            </div>`).join("")}
        </div>
        ${r.confidence != null
          ? `<p class="fx-confidence">识别置信度 ${Math.round(r.confidence * 100)}%</p>`
          : ""}
      </div>`;
  }

  function marketBlock(market) {
    const m = market || {};
    return `
      <div class="fx-block">
        <p class="fx-block-kicker">市场判断</p>
        <div class="fx-metrics">
          <div class="fx-metric">
            <span>市场区间</span>
            <strong>${m.sellRange || "—"}</strong>
          </div>
          <div class="fx-metric">
            <span>建议收货</span>
            <strong>${m.buySuggest || "—"}</strong>
          </div>
          <div class="fx-metric">
            <span>利润空间</span>
            <strong class="is-profit">${m.profitRange || "—"}</strong>
          </div>
          <div class="fx-metric">
            <span>流通速度</span>
            <strong>${m.liquidity || "—"}</strong>
          </div>
        </div>
      </div>`;
  }

  function adviceBlock(advice) {
    const a = advice || {};
    return `
      <div class="fx-advice">
        <p class="fx-advice-title">${a.icon || "🔥"} AI建议：${a.verdict || a.title || "—"}</p>
        <p class="fx-advice-desc">${a.desc || ""}</p>
        ${(a.reasons || []).length ? `
          <ul class="fx-advice-reasons">
            ${a.reasons.map((r) => `<li>${r}</li>`).join("")}
          </ul>` : ""}
      </div>`;
  }

  global.FirstExperience = {
    render(containerId, { onStartPhoto, onStartType, onComplete, toast } = {}) {
      const el = typeof containerId === "string"
        ? document.getElementById(containerId)
        : containerId;
      if (!el || !global.DemoExperienceData) return;

      if (!DemoExperienceData.shouldShow()) {
        el.innerHTML = "";
        return;
      }

      const demo = DemoExperienceData.getDemo();
      let revealed = false;

      function paint() {
        el.innerHTML = `
          <section class="ai-section first-exp-section">
            <div class="fx-card">
              <div class="fx-head">
                <span class="fx-badge">首次体验</span>
                <h3 class="fx-title">${demo.title}</h3>
                <p class="fx-sub">${demo.subtitle}</p>
              </div>

              ${!revealed ? `
                <button type="button" class="fx-demo-btn" id="fxRevealBtn">
                  <span class="fx-demo-icon">📱</span>
                  <span class="fx-demo-name">分析 ${demo.product.name}</span>
                  <span class="fx-demo-hint">点一下，30秒看懂值不值得收</span>
                </button>
              ` : `
                <div class="fx-result" id="fxResult">
                  ${recognitionBlock(demo)}
                  ${marketBlock(demo.market)}
                  ${adviceBlock(demo.advice)}
                  <p class="fx-tip">${demo.cta.tip}</p>
                  <div class="fx-cta-stack">
                    <button type="button" class="fx-cta-primary" id="fxPhotoBtn">${demo.cta.primary}</button>
                    <button type="button" class="fx-cta-secondary" id="fxTypeBtn">${demo.cta.secondary}</button>
                  </div>
                </div>
              `}
            </div>
          </section>`;

        const reveal = el.querySelector("#fxRevealBtn");
        if (reveal) {
          reveal.onclick = () => {
            revealed = true;
            paint();
            toast && toast(`${demo.advice.icon} ${demo.advice.verdict}`);
            // 稍等后滚到结果
            requestAnimationFrame(() => {
              const result = el.querySelector("#fxResult");
              if (result) result.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          };
        }

        const photoBtn = el.querySelector("#fxPhotoBtn");
        if (photoBtn) {
          photoBtn.onclick = () => {
            DemoExperienceData.markDone();
            onComplete && onComplete("photo");
            onStartPhoto && onStartPhoto();
          };
        }

        const typeBtn = el.querySelector("#fxTypeBtn");
        if (typeBtn) {
          typeBtn.onclick = () => {
            DemoExperienceData.markDone();
            onComplete && onComplete("type");
            onStartType && onStartType();
          };
        }
      }

      paint();
    },
  };
})(window);
