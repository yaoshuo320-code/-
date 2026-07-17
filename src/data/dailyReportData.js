/**
 * dailyReportData — V1.7 AI 经营日报 Mock
 * 用户每日打开理由：今天发生什么？应该做什么？哪里有风险？
 * @future GET /api/ai-daily-report
 * @future GET /api/business-changes
 * @future GET /api/ai-advice-history
 */
(function (global) {
  const DAILY_REPORT = {
    healthScore: 82,
    todayDelta: "+3",
    todayDeltaText: "较昨日提升 3 分",
    oneLiner: "今天适合收货，但控制MacBook库存。",

    actions: {
      opportunity: {
        type: "opportunity",
        icon: "🔥",
        label: "机会",
        name: "iPhone15 Pro 256G",
        reason: "收货成本下降150元，成交量上涨23%",
        suggest: "5200以内可以买入",
      },
      risk: {
        type: "risk",
        icon: "⚠️",
        label: "风险",
        name: "MacBook Air M2",
        reason: "库存周期23天，市场价格下降5%",
        suggest: "7天内优先出售",
      },
      profit: {
        type: "profit",
        icon: "💰",
        label: "赚钱",
        name: "AirPods Pro2",
        profit: "+¥180/台",
        reason: "周转仅4天，成交活跃",
        suggest: "持续补货，保持库存",
      },
    },

    changes: [
      { key: "stock", label: "库存变化", value: "-6件", text: "本周库存减少，周转加快", dir: "down", good: true },
      { key: "profit", label: "利润变化", value: "+¥3,200", text: "本周预计利润上升", dir: "up", good: true },
      { key: "turnover", label: "周转变化", value: "11天", text: "平均周转比上周快2天", dir: "up", good: true },
    ],

    history: [
      {
        date: "07-15",
        advice: "优先处理 MacBook Air M2 积压库存",
        result: "已卖出 2 台",
        status: "done",
      },
      {
        date: "07-14",
        advice: "iPhone15 Pro 可适当加价出售",
        result: "利润 +¥860",
        status: "done",
      },
      {
        date: "07-13",
        advice: "补货 AirPods Pro2",
        result: "待执行",
        status: "pending",
      },
      {
        date: "07-12",
        advice: "控制安卓旗舰收货规模",
        result: "已减少采购",
        status: "done",
      },
    ],
  };

  global.DailyReportData = {
    getReport() {
      return {
        ...DAILY_REPORT,
        generatedAt: new Date().toISOString().slice(0, 10),
      };
    },

    /** @future GET /api/ai-daily-report */
    async fetchReport() {
      return this.getReport();
    },

    /** @future GET /api/business-changes */
    async fetchChanges() {
      return DAILY_REPORT.changes;
    },

    /** @future GET /api/ai-advice-history */
    async fetchHistory() {
      return DAILY_REPORT.history;
    },
  };
})(window);
