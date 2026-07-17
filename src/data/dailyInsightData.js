/**
 * dailyInsightData — V2.0 每日经营提醒 Mock
 * 让库存大脑从「分析展示」升级为「经营决策」
 * @future insightAPI: GET /api/daily/insights
 * @future actionAPI:  POST /api/inventory/actions
 */
(function (global) {
  const WATCH_KEY = "revo_watchlist_v20";
  const ALERT_KEY = "revo_sell_alerts_v20";

  const INSIGHTS = {
    dateLabel: "今日",
    headline: "老板今天需要关注什么",
    opportunities: [
      {
        id: "opp-iphone15pro-cost",
        icon: "🔥",
        type: "opportunity",
        title: "今日机会",
        name: "iPhone15 Pro",
        text: "iPhone15 Pro 收货成本下降 150 元",
        suggest: "可关注精选收货",
        link: { page: "buy", itemId: "inv-iphone15pro" },
      },
      {
        id: "opp-airpods",
        icon: "🔥",
        type: "opportunity",
        title: "今日机会",
        name: "AirPods Pro2",
        text: "配件成交活跃，周转仅 4 天",
        suggest: "可小量补货",
        link: { page: "buy" },
      },
    ],
    risks: [
      {
        id: "risk-macbook",
        icon: "⚠️",
        type: "risk",
        title: "库存提醒",
        name: "MacBook Air M2",
        text: "MacBook 库存超过 45 天",
        suggest: "建议 7 天内处理",
        link: { page: "inventory-detail", itemId: "inv-macbook-air-m2" },
      },
    ],
    sellAdvice: [
      {
        id: "sell-iphone14",
        icon: "💡",
        type: "sell",
        title: "出售建议",
        name: "iPhone14 128G",
        text: "成交活跃，利润明确，适合优先挂售",
        suggest: "建议今日挂出",
        link: { page: "sell", itemId: "inv-iphone14" },
      },
    ],
  };

  function readList(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list || []));
    } catch { /* ignore */ }
  }

  global.DailyInsightData = {
    getInsights() {
      return {
        ...INSIGHTS,
        opportunities: INSIGHTS.opportunities.map((x) => ({ ...x })),
        risks: INSIGHTS.risks.map((x) => ({ ...x })),
        sellAdvice: INSIGHTS.sellAdvice.map((x) => ({ ...x })),
      };
    },

    /** 首页展示用扁平列表：机会 → 风险 → 出售 */
    getHomeCards() {
      const data = this.getInsights();
      return [
        ...data.opportunities,
        ...data.risks,
        ...data.sellAdvice,
      ];
    },

    getWatchlist() {
      return readList(WATCH_KEY);
    },

    addWatch(item) {
      if (!item || !item.id) return { ok: false };
      const list = readList(WATCH_KEY).filter((x) => x.id !== item.id);
      list.unshift({
        id: item.id,
        name: item.name,
        addedAt: new Date().toISOString(),
      });
      writeList(WATCH_KEY, list.slice(0, 30));
      return { ok: true, list };
    },

    getSellAlerts() {
      return readList(ALERT_KEY);
    },

    setSellAlert(item) {
      if (!item || !item.id) return { ok: false };
      const list = readList(ALERT_KEY).filter((x) => x.id !== item.id);
      list.unshift({
        id: item.id,
        name: item.name,
        sellRange: item.sellRange || "",
        createdAt: new Date().toISOString(),
        status: "active",
      });
      writeList(ALERT_KEY, list.slice(0, 30));
      return { ok: true, list };
    },

    /** @future insightAPI */
    async fetchInsights() {
      return this.getInsights();
    },

    /** @future actionAPI */
    async postAction(action, item) {
      if (action === "watch") return this.addWatch(item);
      if (action === "sell-alert") return this.setSellAlert(item);
      if (action === "sell-now") return { ok: true, next: "sell" };
      return { ok: false };
    },
  };
})(window);
