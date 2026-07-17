/**
 * visionInventoryData — V1.6 AI 拍照入库 Mock
 * 第一阶段：本地 mock 识别结果
 * @future Vision AI API: POST /api/vision/inventory  上传图片 → 结构化商品信息
 * @future Price Brain:   识别后联动市场分析 / 收货建议
 */
(function (global) {
  const MOCK_RESULTS = [
    {
      id: "vision-iphone15pro",
      brand: "Apple",
      model: "iPhone15 Pro",
      capacity: "256G",
      color: "原色钛金属",
      condition: "95新",
      battery: "电池健康 91%",
      serial: "F2LX…8K2Q",
      category: "手机",
      qty: 1,
      cost: null,
      costLabel: "待填写",
      name: "iPhone15 Pro 256G",
      market: {
        sellRange: "5800-6100",
        buySuggest: "5200以内",
        profitRange: "300-600",
      },
      confidence: 0.94,
      source: "mock",
    },
    {
      id: "vision-macbook-air-m2",
      brand: "Apple",
      model: "MacBook Air M2",
      capacity: "8GB+256GB",
      color: "午夜色",
      condition: "99新",
      battery: "循环 48 次",
      serial: "C02Y…9TPL",
      category: "电脑",
      qty: 1,
      cost: null,
      costLabel: "待填写",
      name: "MacBook Air M2 256G",
      market: {
        sellRange: "4800-5200",
        buySuggest: "4300以内",
        profitRange: "400-700",
      },
      confidence: 0.91,
      source: "mock",
    },
    {
      id: "vision-airpods-pro2",
      brand: "Apple",
      model: "AirPods Pro2",
      capacity: "标准版",
      color: "白色",
      condition: "充新",
      battery: null,
      serial: null,
      category: "配件",
      qty: 1,
      cost: null,
      costLabel: "待填写",
      name: "AirPods Pro2",
      market: {
        sellRange: "1050-1180",
        buySuggest: "920以内",
        profitRange: "130-220",
      },
      confidence: 0.88,
      source: "mock",
    },
  ];

  let cursor = 0;

  global.VisionInventoryData = {
    /** 轮换返回 mock 识别结果，模拟不同商品拍照 */
    getMockResult() {
      const item = MOCK_RESULTS[cursor % MOCK_RESULTS.length];
      cursor += 1;
      return { ...item, recognizedAt: new Date().toISOString() };
    },

    getAllMocks() {
      return MOCK_RESULTS.map((x) => ({ ...x }));
    },

    /**
     * @future Vision AI API
     * @param {File|Blob} _image
     * @returns {Promise<object>}
     */
    async recognizeImage(_image) {
      await new Promise((r) => setTimeout(r, 1100));
      return {
        ok: true,
        result: this.getMockResult(),
        provider: "mock-vision-v1",
      };
    },

    /** 转成库存资产条目，写入 InventoryPage 本地库 */
    toInventoryItem(result, { cost } = {}) {
      if (!result) return null;
      const purchaseDate = new Date().toISOString().slice(0, 10);
      const qty = result.qty || 1;
      const costNum = cost == null || cost === "" ? 0 : Number(cost) || 0;
      const days = 0;
      return {
        id: `ai-${Date.now()}-${(result.model || "item").replace(/\s+/g, "-").toLowerCase()}`,
        brand: result.brand,
        model: result.model,
        capacity: result.capacity,
        condition: result.condition,
        color: result.color || "",
        battery: result.battery || "",
        serial: result.serial || "",
        category: result.category || "其他",
        cost: costNum,
        qty,
        purchaseDate,
        days,
        capital: costNum * qty,
        level: "healthy",
        suggest: "新入库 · 待定价",
        name: result.name || [result.brand, result.model, result.capacity].filter(Boolean).join(" "),
        market: result.market || null,
        source: "ai-photo",
      };
    },
  };
})(window);
