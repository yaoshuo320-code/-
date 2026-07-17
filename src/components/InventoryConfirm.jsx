/**
 * InventoryConfirm — V1.9 入库确认页
 * 填写采购价 → 确认加入库存大脑
 */
(function (global) {
  global.InventoryConfirm = {
    render(containerId, { pending, onBack, onSuccess, toast } = {}) {
      const el = document.getElementById(containerId);
      if (!el) return;

      const data = pending || (global.InventoryBrainData && InventoryBrainData.getPendingCapture());
      if (!data || !data.vision) {
        el.innerHTML = `
          <div class="ai-dash ib-page">
            <section class="inv-import-hero">
              <button type="button" class="inv-import-back" id="ibConfirmBack">← 返回</button>
              <h1 class="ai-welcome-title">入库确认</h1>
            </section>
            <div class="stc-empty">没有待确认商品</div>
          </div>`;
        const back = el.querySelector("#ibConfirmBack");
        if (back) back.onclick = () => onBack && onBack();
        return;
      }

      const v = data.vision;
      const m = (data.decision && data.decision.market) || v.market || {};
      const suggestBuy = (m.buySuggest || "").replace(/以内|以内。/g, "").replace(/[^\d]/g, "");

      el.innerHTML = `
        <div class="ai-dash ib-page">
          <section class="inv-import-hero">
            <button type="button" class="inv-import-back" id="ibConfirmBack">← 返回识别结果</button>
            <h1 class="ai-welcome-title">入库确认</h1>
            <p class="ai-welcome-sub">确认采购信息后，加入库存大脑</p>
          </section>

          <section class="ai-section">
            <div class="ib-confirm-card glass-card">
              <h3 class="ib-confirm-name">${v.name}</h3>
              <div class="ib-confirm-specs">
                <span>${v.brand || "—"}</span>
                <span>${v.model || "—"}</span>
                <span>${v.capacity || "—"}</span>
                <span>${v.condition || "—"}</span>
              </div>
              <div class="ib-confirm-market">
                <div><span>销售区间</span><strong>${m.sellRange || "—"}</strong></div>
                <div><span>建议收货</span><strong>${m.buySuggest || "—"}</strong></div>
                <div><span>利润空间</span><strong class="is-profit">${m.profitRange || "—"}</strong></div>
              </div>
            </div>
          </section>

          <section class="ai-section ai-section-last">
            <label class="ai-capture-cost-label">
              采购价格（必填）
              <input class="ai-capture-cost-input" id="ibConfirmCost" type="number"
                placeholder="${suggestBuy ? `建议 ${suggestBuy} 以内` : "如 5200"}"
                min="0" value="${suggestBuy || ""}" />
            </label>
            <button type="button" class="ai-capture-confirm" id="ibConfirmSubmit">确认加入库存大脑</button>
            <button type="button" class="ai-capture-retry" id="ibConfirmCancel">取消</button>
          </section>
        </div>`;

      el.querySelector("#ibConfirmBack").onclick = () => onBack && onBack();
      el.querySelector("#ibConfirmCancel").onclick = () => onBack && onBack();

      el.querySelector("#ibConfirmSubmit").onclick = () => {
        const costInput = el.querySelector("#ibConfirmCost");
        const cost = costInput ? costInput.value : "";
        if (cost === "" || Number(cost) < 0) {
          toast && toast("请填写采购价格");
          return;
        }
        const res = InventoryBrainData.confirmFromPending({ cost });
        if (!res.ok) {
          toast && toast(res.message || "入库失败");
          return;
        }
        toast && toast(`已加入库存大脑：${res.item.name}`);
        onSuccess && onSuccess(res.item);
      };
    },
  };
})(window);
