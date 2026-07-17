/**
 * marketData — V1.8 市场大脑 Mock
 * 定位：帮助二手商家理解市场变化的 AI 分析中心（非价格查询）
 * @future marketAPI:   GET /api/market/temperature
 * @future priceAPI:    GET /api/market/price-trends
 * @future industryAPI: GET /api/market/industry-alerts
 */
(function (global) {
  const MARKET_BRAIN = {
    temperature: 82,
    delta: "+5",
    deltaText: "较昨日升温",

    categories: [
      {
        id: "phone",
        name: "手机",
        heat: 88,
        trend: "up",
        trendText: "↑ 热度上升",
        judge: "旗舰机成交活跃，适合精选收货",
      },
      {
        id: "computer",
        name: "电脑整机",
        heat: 71,
        trend: "down",
        trendText: "↓ 热度回落",
        judge: "笔记本周转变慢，控制库存天数",
      },
      {
        id: "camera",
        name: "数码相机",
        heat: 66,
        trend: "up",
        trendText: "↑ 出行升温",
        judge: "微单/运动相机可关注出行节点",
      },
      {
        id: "av",
        name: "娱乐影音",
        heat: 79,
        trend: "up",
        trendText: "↑ 小幅升温",
        judge: "耳机需求稳定，可正常经营",
      },
      {
        id: "parts",
        name: "装配件",
        heat: 84,
        trend: "up",
        trendText: "↑ 热度上升",
        judge: "配件周转快，适合补充爆款",
      },
    ],

    opportunities: [
      {
        id: "opp-iphone15pro",
        name: "iPhone15 Pro",
        reasons: ["成交热度上涨", "库存下降"],
        suggest: "关注收货机会",
      },
      {
        id: "opp-airpods",
        name: "AirPods Pro2",
        reasons: ["成交活跃", "周转仅4天"],
        suggest: "可小量补货",
      },
      {
        id: "opp-watch",
        name: "Apple Watch S9",
        reasons: ["需求回暖", "挂牌减少"],
        suggest: "关注成色溢价空间",
      },
    ],

    /** 价格趋势：区间 + 7日变化 + AI判断，不展示单一价格 */
    priceTrends: [
      {
        id: "pt-iphone15pro",
        name: "iPhone15 Pro 256G",
        range: "5800-6100",
        change7d: "-150",
        changeText: "7日收货成本下降",
        judge: "成本下行，适合收货",
        tone: "good",
      },
      {
        id: "pt-macbook",
        name: "MacBook Air M2",
        range: "4800-5200",
        change7d: "-5%",
        changeText: "7日成交价走弱",
        judge: "价格承压，谨慎加库存",
        tone: "warn",
      },
      {
        id: "pt-airpods",
        name: "AirPods Pro2",
        range: "1050-1180",
        change7d: "+30",
        changeText: "7日成交小幅上行",
        judge: "价格稳健，可正常周转",
        tone: "good",
      },
    ],

    industryAlerts: [
      {
        id: "alert-1",
        icon: "📡",
        title: "安卓旗舰需求走弱",
        text: "收货时注意控制库存天数，优先快周转型号。",
      },
      {
        id: "alert-2",
        icon: "🔋",
        title: "配件赛道持续升温",
        text: "耳机、手表成交活跃，可适当增加采购比例。",
      },
      {
        id: "alert-3",
        icon: "💻",
        title: "笔记本库存压力上升",
        text: "市场挂牌增多，建议优先出货积压机型。",
      },
    ],
  };

  global.MarketData = {
    getBrain() {
      return MARKET_BRAIN;
    },

    /** @future marketAPI */
    async fetchTemperature() {
      return {
        temperature: MARKET_BRAIN.temperature,
        delta: MARKET_BRAIN.delta,
      };
    },

    /** @future priceAPI */
    async fetchPriceTrends() {
      return MARKET_BRAIN.priceTrends;
    },

    /** @future industryAPI */
    async fetchIndustryAlerts() {
      return MARKET_BRAIN.industryAlerts;
    },

    /** @future marketAPI */
    async fetchBrain() {
      return MARKET_BRAIN;
    },
  };
})(window);
