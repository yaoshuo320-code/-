/**
 * demoExperienceData — V2.0 首次体验 Mock
 * 新用户无库存时，30秒体验一台商品分析价值
 * @future experienceAPI: GET /api/demo/experience
 */
(function (global) {
  const DONE_KEY = "revo_first_exp_done_v20";

  const DEMO = {
    id: "demo-iphone15pro",
    title: "体验一台商品分析",
    subtitle: "不需要库存，先感受 Revo 怎么帮你判断",
    product: {
      brand: "Apple",
      model: "iPhone15 Pro",
      capacity: "256G",
      condition: "95新",
      color: "原色钛金属",
      name: "iPhone15 Pro 256G",
      category: "手机",
    },
    recognition: {
      confidence: 0.94,
      fields: [
        { label: "品牌", value: "Apple" },
        { label: "型号", value: "iPhone15 Pro" },
        { label: "容量", value: "256G" },
        { label: "成色", value: "95新" },
      ],
    },
    market: {
      sellRange: "5800-6100",
      buySuggest: "5200以内",
      profitRange: "300-600",
      liquidity: "★★★★★",
    },
    advice: {
      icon: "🔥",
      verdict: "推荐收货",
      title: "值得收",
      desc: "当前型号市场需求稳定，预计周转周期较短，适合快收快出。",
      reasons: [
        "成交热度上升",
        "收货成本近期下降约 150 元",
        "Pro 系列利润空间明确",
      ],
    },
    cta: {
      primary: "开始拍照分析",
      secondary: "输入型号判断",
      tip: "刚才只是体验。拍一件真实货，马上给你专属建议。",
    },
  };

  function hasUserInventory() {
    try {
      if (global.InventoryBrainData) {
        const items = InventoryBrainData.getItems() || [];
        if (items.some((x) => x.source === "ai-photo" || x.source === "user")) return true;
      }
      const legacy = localStorage.getItem("revo_inventory_items_v1");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.some((x) => x.source === "ai-photo")) return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  global.DemoExperienceData = {
    DONE_KEY,

    getDemo() {
      return JSON.parse(JSON.stringify(DEMO));
    },

    isDone() {
      try {
        return !!localStorage.getItem(DONE_KEY);
      } catch {
        return false;
      }
    },

    markDone() {
      try {
        localStorage.setItem(DONE_KEY, "1");
      } catch { /* ignore */ }
    },

    /** 新用户 / 无真实库存 → 展示首次体验 */
    shouldShow() {
      if (this.isDone()) return false;
      if (hasUserInventory()) return false;
      return true;
    },

    /** @future experienceAPI */
    async fetchDemo() {
      return this.getDemo();
    },
  };
})(window);
