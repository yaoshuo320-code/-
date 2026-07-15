/**
 * AI店长首页 Mock — Revo V1.1
 * 预留接口：/api/ai-daily /api/product-price /api/inventory /api/trend
 */
(function (global) {
  const NOTICES = [
    "今天 iPhone15 Pro 收货价下降150元，是近期不错的入手机会。",
    "你的库存中 iPhone14 Pro 偏高，建议关注价格变化。",
    "MacBook Air M2 周转加快，适合补货后快进快出。",
    "安卓旗舰需求走弱，收货时注意控制库存天数。",
  ];

  const BRAND_LINES = [
    "我帮你盯市场，你负责做决定。",
    "让复杂的数据交给AI，让赚钱机会留给你。",
  ];

  const AI_DAILY = {
    summary: {
      chance: 3,
      attention: 2,
      risk: 2,
      heat: "+5.8%",
      // aliases for older UI keys
      opportunity: 3,
      market: "+5.8%",
    },

    notices: NOTICES,
    brandLines: BRAND_LINES,

    opportunities: [
      {
        id: "iphone15pro",
        name: "iPhone15 Pro 256G",
        score: 92,
        tag: "适合收货",
        reason: ["↓ 收货成本下降150元", "↑ 成交量上涨23%"],
        suggest: "5200以内可以买入",
      },
      {
        id: "macbookairm2",
        name: "MacBook Air M2",
        score: 85,
        tag: "重点关注",
        reason: ["周转加快", "利润空间仍在"],
        suggest: "4200以内可以关注",
      },
      {
        id: "iphone16",
        name: "iPhone 16 系列",
        score: 88,
        tag: "适合收货",
        reason: ["新品窗口期", "↑ 需求上涨18%"],
        suggest: "5800以内可以买入",
      },
    ],

    inventory: [
      {
        id: "iphone14pro",
        name: "iPhone14 Pro",
        count: 12,
        risk: "库存偏高",
        forecast: "15天后价格下降200元",
        suggest: "卖出5台",
      },
    ],

    trends: [
      { label: "AI电脑需求", level: "upup", text: "↑↑" },
      { label: "机器人配件", level: "up", text: "↑" },
      { label: "安卓旗舰", level: "down", text: "↓" },
    ],
  };

  function daySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function pickDaily(list) {
    if (!list || !list.length) return "";
    return list[daySeed() % list.length];
  }

  function buildDailyPayload() {
    const summary = AI_DAILY.summary;
    return {
      ...AI_DAILY,
      notice: pickDaily(AI_DAILY.notices),
      brandLine: pickDaily(AI_DAILY.brandLines),
      welcomeSummary: `发现${summary.chance}个收货机会，${summary.risk}个库存风险。`,
    };
  }

  global.HomeData = {
    getAiDaily() {
      return buildDailyPayload();
    },

    getTodayOpportunities() {
      return AI_DAILY.opportunities;
    },

    getSummary() {
      return AI_DAILY.summary;
    },

    getInventory() {
      return AI_DAILY.inventory;
    },

    getTrends() {
      return AI_DAILY.trends;
    },

    getDailyNotice() {
      return pickDaily(AI_DAILY.notices);
    },

    /** @future GET /api/ai-daily */
    async fetchAiDaily() {
      return buildDailyPayload();
    },

    /** @future GET /api/product-price?model= */
    async fetchProductPrice(_model) {
      return null;
    },

    /** @future GET /api/inventory */
    async fetchInventory() {
      return AI_DAILY.inventory;
    },

    /** @future GET /api/trend */
    async fetchTrend() {
      return AI_DAILY.trends;
    },
  };

  // alias for product naming
  global.aiDailyData = AI_DAILY;
})(window);
