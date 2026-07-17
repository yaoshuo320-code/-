/**
 * InventoryImport — V1.6 库存导入页
 * 支持 CSV（Excel 预留），字段自动识别，写入本地库存资产
 */
(function (global) {
  function schemaChips(schema) {
    return (schema || []).map((f) => `
      <span class="inv-import-chip">${f.label || f}</span>`).join("");
  }

  function previewRows(items) {
    return (items || []).slice(0, 5).map((item, i) => `
      <div class="inv-import-preview-row" style="animation-delay:${i * 40}ms">
        <span class="inv-import-preview-name">${item.name || item.model}</span>
        <span class="inv-import-preview-meta">${item.qty}件 · ¥${item.cost} · ${item.days}天</span>
      </div>`).join("");
  }

  global.InventoryImport = {
    render(containerId, { onBack, onImported, toast } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const schema = (global.InventoryData && InventoryData.getImportSchema()) || [
        { label: "品牌" }, { label: "型号" }, { label: "容量" },
        { label: "成色" }, { label: "采购价" }, { label: "数量" }, { label: "采购日期" },
      ];

      let lastResult = null;

      el.innerHTML = `
        <div class="ai-dash inv-import-page">
          <section class="inv-import-hero">
            <button type="button" class="inv-import-back" id="invImportBack">← 返回库存</button>
            <h1 class="ai-welcome-title">导入库存</h1>
            <p class="ai-welcome-sub">支持 Excel / CSV · 字段自动识别</p>
          </section>

          <section class="ai-section">
            <div class="inv-import-card">
              <p class="inv-import-card-title">自动识别字段</p>
              <div class="inv-import-chips">${schemaChips(schema)}</div>
            </div>
          </section>

          <section class="ai-section">
            <div class="inv-import-upload">
              <input type="file" id="invImportFile" accept=".csv,.xlsx,.xls,text/csv" hidden />
              <button type="button" class="inv-import-upload-btn" id="invImportPick">
                <span class="inv-import-upload-icon">📤</span>
                <span class="inv-import-upload-title">上传库存文件</span>
                <span class="inv-import-upload-sub">推荐 CSV · Excel 即将支持</span>
              </button>
              <button type="button" class="inv-import-demo-btn" id="invImportDemo">
                使用示例 CSV 演示导入
              </button>
            </div>
          </section>

          <section class="ai-section" id="invImportResultSection" hidden>
            <div class="ai-section-head">
              <span class="ai-section-icon">🧾</span>
              <span class="ai-section-title">识别结果</span>
              <span class="ai-section-count" id="invImportCount">0 条</span>
            </div>
            <div class="inv-import-preview" id="invImportPreview"></div>
            <button type="button" class="inv-import-confirm" id="invImportConfirm" hidden>
              确认导入到我的库存
            </button>
          </section>

          <section class="ai-section ai-section-last">
            <div class="inv-import-tip">
              <p>商家自己的数据闭环</p>
              <p>不接外部平台 · 数据只留在你这边</p>
            </div>
          </section>
        </div>`;

      const fileInput = el.querySelector("#invImportFile");
      const pickBtn = el.querySelector("#invImportPick");
      const demoBtn = el.querySelector("#invImportDemo");
      const backBtn = el.querySelector("#invImportBack");
      const resultSection = el.querySelector("#invImportResultSection");
      const preview = el.querySelector("#invImportPreview");
      const countEl = el.querySelector("#invImportCount");
      const confirmBtn = el.querySelector("#invImportConfirm");

      function showResult(result) {
        lastResult = result;
        if (!result || !result.ok) {
          toast && toast((result && result.message) || "解析失败");
          resultSection.hidden = true;
          confirmBtn.hidden = true;
          return;
        }
        resultSection.hidden = false;
        confirmBtn.hidden = false;
        countEl.textContent = `${result.count} 条`;
        preview.innerHTML = previewRows(result.items)
          + (result.count > 5 ? `<p class="inv-import-more">… 还有 ${result.count - 5} 条</p>` : "");
        toast && toast(`已识别 ${result.count} 条库存`);
      }

      if (backBtn) backBtn.onclick = () => onBack && onBack();

      if (pickBtn && fileInput) {
        pickBtn.onclick = () => fileInput.click();
        fileInput.onchange = async () => {
          const file = fileInput.files && fileInput.files[0];
          if (!file || !global.InventoryParser) return;
          const result = await InventoryParser.parseFile(file);
          showResult(result);
        };
      }

      if (demoBtn) {
        demoBtn.onclick = () => {
          if (!global.InventoryParser) return;
          showResult(InventoryParser.loadMock());
        };
      }

      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          if (!lastResult || !lastResult.ok) return;
          if (global.InventoryPage && InventoryPage.saveStoredItems) {
            InventoryPage.saveStoredItems(lastResult.items);
          }
          if (global.InventoryParser && InventoryParser.saveToDatabase) {
            await InventoryParser.saveToDatabase(lastResult.items);
          }
          toast && toast(`已导入 ${lastResult.count} 条到我的库存`);
          onImported && onImported(lastResult.items);
        };
      }
    },
  };
})(window);
