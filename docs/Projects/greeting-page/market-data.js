/**
 * V8 市场价格区间 — 手动配置层
 * 后续可扩展：用户输入、外部 API 导入
 */
(function (global) {
  global.MarketDataConfig = {
    /**
     * 手动覆盖机型市场区间
     * key: 机型名称（与引擎 displayName 一致或包含匹配）
     * low/mid/high: [min, max] 价格区间（元）
     * currentPrice: 可选，指定当前市场价；不填则由引擎按日模拟
     */
    overrides: {
      "iPhone 16 Pro 256G": {
        low: [6200, 6800],
        mid: [6800, 7400],
        high: [7400, 8000],
        currentPrice: 6550,
      },
      "iPhone 15 Pro": {
        low: [4200, 4600],
        mid: [4600, 5000],
        high: [5000, 5400],
        currentPrice: 4480,
      },
      "iPhone 14": {
        low: [2800, 3100],
        mid: [3100, 3400],
        high: [3400, 3700],
        currentPrice: 3050,
      },
      "小米 15": {
        low: [2200, 2500],
        mid: [2500, 2800],
        high: [2800, 3100],
        currentPrice: 2680,
      },
      "Kindle Paperwhite 12": {
        low: [680, 750],
        mid: [750, 820],
        high: [820, 900],
        currentPrice: 720,
      },
    },

    /** 用户输入的价格记录（本地扩展用） */
    userPrices: {},

    setUserPrice(modelKey, price) {
      this.userPrices[modelKey] = price;
    },

    getUserPrice(modelKey) {
      return this.userPrices[modelKey] ?? null;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
