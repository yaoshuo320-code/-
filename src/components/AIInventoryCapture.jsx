/**
 * AIInventoryCapture — V1.9 AI 拍照入库（闭环入口）
 * 拍照 → 识别 → 分析 → 交给识别结果页 / 入库确认页 → 库存大脑
 * @future visionAPI → inventoryAPI
 */
(function (global) {
  global.AIInventoryCapture = {
    render(containerId, { onBack, onRecognized, toast } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      let previewUrl = null;

      function cleanupPreview() {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          previewUrl = null;
        }
      }

      function shell(bodyHtml) {
        el.innerHTML = `
          <div class="ai-dash ai-capture-page">
            <section class="inv-import-hero">
              <button type="button" class="inv-import-back" id="aiCaptureBack">← 返回库存大脑</button>
              <h1 class="ai-welcome-title">AI 拍照入库</h1>
              <p class="ai-welcome-sub">拍一件货 · 马上知道值不值得收</p>
            </section>
            ${bodyHtml}
          </div>`;
        const back = el.querySelector("#aiCaptureBack");
        if (back) {
          back.onclick = () => {
            cleanupPreview();
            onBack && onBack();
          };
        }
      }

      function paintIdle() {
        shell(`
          <section class="ai-section">
            <div class="ai-capture-upload">
              <input type="file" id="aiCaptureCamera" accept="image/*" capture="environment" hidden />
              <input type="file" id="aiCaptureAlbum" accept="image/*" hidden />
              <button type="button" class="ai-capture-upload-btn" id="aiCapturePick">
                <span class="ai-capture-upload-icon">📷</span>
                <span class="ai-capture-upload-title">打开摄像头拍照</span>
                <span class="ai-capture-upload-sub">调用手机摄像头 · AI 自动识别并判断</span>
              </button>
              <div class="ai-capture-alt-row">
                <button type="button" class="ai-capture-alt-btn" id="aiCaptureAlbumBtn">从相册选择</button>
                <button type="button" class="ai-capture-demo-btn" id="aiCaptureDemo">使用示例体验</button>
              </div>
            </div>
          </section>
          <section class="ai-section ai-section-last">
            <div class="inv-import-tip">
              <p>拍照 → 识别结果 → 入库确认 → 库存大脑</p>
              <p>不是简单记库存，而是帮你做经营决策</p>
            </div>
          </section>`);

        const cameraInput = el.querySelector("#aiCaptureCamera");
        const albumInput = el.querySelector("#aiCaptureAlbum");
        const pick = el.querySelector("#aiCapturePick");
        const albumBtn = el.querySelector("#aiCaptureAlbumBtn");
        const demo = el.querySelector("#aiCaptureDemo");

        function bindFileInput(input) {
          if (!input) return;
          input.onchange = () => {
            const file = input.files && input.files[0];
            if (file) runPipeline(file);
            input.value = "";
          };
        }
        bindFileInput(cameraInput);
        bindFileInput(albumInput);

        if (pick && cameraInput) pick.onclick = () => cameraInput.click();
        if (albumBtn && albumInput) albumBtn.onclick = () => albumInput.click();
        if (demo) demo.onclick = () => runPipeline(null);
      }

      function paintThinking(stepText, subText) {
        shell(`
          <section class="ai-section">
            <div class="ai-capture-loading">
              ${previewUrl
                ? `<img class="ai-capture-preview" src="${previewUrl}" alt="商品预览" />`
                : `<div class="ai-capture-preview ai-capture-preview--placeholder">📷</div>`}
              <div class="ai-orb-wrap" style="margin-top:18px">
                <div class="ai-orb" aria-hidden="true">
                  <span class="ai-orb-halo"></span>
                  <span class="ai-orb-halo ai-orb-halo-2"></span>
                  <span class="ai-orb-ring"></span>
                  <span class="ai-orb-ring-2"></span>
                  <span class="ai-orb-core"></span>
                </div>
              </div>
              <p class="ai-capture-loading-text">${stepText}</p>
              <p class="ai-capture-loading-sub">${subText}</p>
            </div>
          </section>`);
      }

      async function runPipeline(file) {
        cleanupPreview();
        if (file) previewUrl = URL.createObjectURL(file);

        if (!global.VisionInventoryData || !global.TradeDecisionData) {
          toast && toast("识别模块未加载");
          paintIdle();
          return;
        }

        try {
          paintThinking("AI 正在识别商品…", "品牌 · 型号 · 容量 · 成色");
          const visionRes = await VisionInventoryData.recognizeImage(file || null);
          if (!visionRes || !visionRes.ok) {
            toast && toast((visionRes && visionRes.message) || "识别失败");
            paintIdle();
            return;
          }

          paintThinking("AI 正在分析…", "市场区间 · 利润 · 值不值得收");
          const decisionRes = await TradeDecisionData.analyze(visionRes.result);
          if (!decisionRes || !decisionRes.ok) {
            toast && toast("价值判断失败，请重试");
            paintIdle();
            return;
          }

          const payload = {
            vision: visionRes.result,
            decision: decisionRes.decision,
            previewUrl,
          };

          if (global.InventoryBrainData) {
            InventoryBrainData.setPendingCapture(payload);
          }

          toast && toast(`${decisionRes.decision.advice.icon} ${decisionRes.decision.advice.title}`);
          // 预览 URL 交给下一页，此处不 revoke
          previewUrl = null;
          onRecognized && onRecognized(payload);
        } catch (err) {
          toast && toast("分析出错，请重试");
          paintIdle();
        }
      }

      paintIdle();
    },
  };
})(window);
