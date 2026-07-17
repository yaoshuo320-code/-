/**
 * InventoryCaptureResult — V1.9 拍照识别结果页
 * 展示 AI 识别商品 + 价值判断摘要
 */
(function (global) {
  global.InventoryCaptureResult = {
    render(containerId, { pending, onBack, onConfirm, onRetry } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const data = pending || (global.InventoryBrainData && InventoryBrainData.getPendingCapture());
      if (!data || !data.vision) {
        el.innerHTML = `
          <div class="ai-dash ib-page">
            <section class="inv-import-hero">
              <button type="button" class="inv-import-back" id="ibResultBack">← 返回</button>
              <h1 class="ai-welcome-title">识别结果</h1>
            </section>
            <div class="stc-empty">暂无识别结果，请重新拍照</div>
          </div>`;
        const back = el.querySelector("#ibResultBack");
        if (back) back.onclick = () => onBack && onBack();
        return;
      }

      const v = data.vision;
      const d = data.decision || {};
      const conf = v.confidence != null ? Math.round(v.confidence * 100) : null;
      const cardHtml = global.TradeDecisionCard ? TradeDecisionCard.html(d) : "";

      el.innerHTML = `
        <div class="ai-dash ib-page">
          <section class="inv-import-hero">
            <button type="button" class="inv-import-back" id="ibResultBack">← 重新拍照</button>
            <h1 class="ai-welcome-title">识别结果</h1>
            <p class="ai-welcome-sub">AI 已完成识别与价值判断</p>
          </section>

          ${data.previewUrl
            ? `<img class="ai-capture-preview ai-capture-preview--sm" src="${data.previewUrl}" alt="商品预览" />`
            : ""}

          <section class="ai-section">
            <div class="ib-result-meta glass-card">
              <div class="ib-result-meta-row">
                <span>识别置信度</span>
                <strong>${conf != null ? conf + "%" : "—"}</strong>
              </div>
              <div class="ib-result-meta-row">
                <span>品类</span>
                <strong>${v.category || "—"}</strong>
              </div>
              <div class="ib-result-meta-row">
                <span>成色</span>
                <strong>${v.condition || "—"}</strong>
              </div>
            </div>
          </section>

          <section class="ai-section">
            <div id="ibResultDecision">${cardHtml}</div>
          </section>

          <section class="ai-section ai-section-last">
            <button type="button" class="ai-capture-confirm" id="ibResultNext">确认，下一步入库</button>
            <button type="button" class="ai-capture-retry" id="ibResultRetry">重新拍照</button>
          </section>
        </div>`;

      el.querySelector("#ibResultBack").onclick = () => (onRetry || onBack) && (onRetry || onBack)();
      el.querySelector("#ibResultRetry").onclick = () => onRetry && onRetry();
      el.querySelector("#ibResultNext").onclick = () => onConfirm && onConfirm(data);
    },
  };
})(window);
