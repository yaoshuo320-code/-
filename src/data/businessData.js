/**
 * 生意 Tab · 经营驾驶舱 Mock 数据
 * @future inventoryAPI:   GET /api/inventory        库存明细与金额
 * @future transactionAPI: GET /api/transactions     成交记录与周转
 * @future profitAPI:      GET /api/profit           利润与资金效率
 */
(function (global) {
  const BUSINESS_DASHBOARD = {
    welcomeSub: "Revo 已分析你的经营情况：",
    healthScore: 82,

    /** 模块1 · 经营健康度（page 字段：点击可跳转的既有页面） */
    healthCards: [
      { key: "inventory", icon: "📦", label: "库存健康", value: 82, page: "inventory" },
      { key: "capital", icon: "💵", label: "资金效率", value: 76 },
      { key: "profit", icon: "💰", label: "利润表现", value: 88 },
      { key: "turnover", icon: "🔄", label: "周转速度", value: 79 },
    ],

    /** 模块2 · 经营概览 */
    overview: [
      { key: "stock", label: "当前库存", value: "128件" },
      { key: "amount", label: "库存金额", value: "¥560,000" },
      { key: "profit", label: "本月利润", value: "¥38,000" },
      { key: "turnover", label: "平均周转", value: "15天" },
    ],

    /** 模块3 · AI经营诊断 */
    diagnoses: [
      {
        id: "diag-macbook",
        type: "risk",
        icon: "⚠️",
        title: "风险提醒",
        name: "MacBook Air M2",
        meta: ["库存周期23天"],
        suggest: "优先出售",
      },
      {
        id: "diag-iphone15",
        type: "profit",
        icon: "🔥",
        title: "利润机会",
        name: "iPhone15 Pro",
        meta: ["成交上涨12%"],
        suggest: "增加收货",
      },
      {
        id: "diag-advice",
        type: "advice",
        icon: "💡",
        title: "经营建议",
        name: "资金效率偏低",
        meta: ["库存金额占用56万", "周转比上月慢2天"],
        suggest: "控制高价机采购，优先周转快的型号",
      },
    ],

    /** 模块4 · 商品分析 */
    products: {
      earning: [
        { name: "iPhone15 Pro 256G", profit: "+¥620/台", turnover: "6天", suggest: "增加收货" },
        { name: "AirPods Pro2", profit: "+¥180/台", turnover: "4天", suggest: "持续补货" },
        { name: "iPad Pro 11 M2", profit: "+¥450/台", turnover: "9天", suggest: "保持库存" },
        { name: "iPhone 14 128G", profit: "+¥380/台", turnover: "8天", suggest: "正常经营" },
        { name: "Apple Watch S9", profit: "+¥210/台", turnover: "7天", suggest: "小量补货" },
      ],
      risk: [
        { name: "MacBook Air M2", profit: "-¥200/台", turnover: "23天", suggest: "优先出售" },
        { name: "iPhone 13 Pro Max", profit: "+¥90/台", turnover: "19天", suggest: "降价出货" },
        { name: "华为 Mate 50", profit: "-¥120/台", turnover: "26天", suggest: "尽快清仓" },
        { name: "iPad 9 64G", profit: "+¥60/台", turnover: "17天", suggest: "捆绑促销" },
        { name: "小米 13", profit: "-¥80/台", turnover: "21天", suggest: "停止收货" },
      ],
    },
  };

  global.BusinessData = {
    getDashboard() {
      return BUSINESS_DASHBOARD;
    },

    /** @future inventoryAPI */
    async fetchInventory() {
      return { items: [], total: BUSINESS_DASHBOARD.overview[0].value };
    },

    /** @future transactionAPI */
    async fetchTransactions() {
      return { records: [] };
    },

    /** @future profitAPI */
    async fetchProfit() {
      return { month: BUSINESS_DASHBOARD.overview[2].value };
    },
  };
})(window);
