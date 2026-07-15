/**
 * 库存大脑 Mock 数据
 * @future: GET /api/inventory, POST /api/inventory/import
 */
(function (global) {
  const INVENTORY_BRAIN = {
    overview: {
      total: 128,
      risk: 8,
      profitOpp: 15,
      pending: 6,
    },

    diagnoses: [
      {
        id: "macbook-air-m2",
        type: "risk",
        icon: "🔥",
        title: "风险提醒",
        name: "MacBook Air M2",
        meta: ["库存28天", "市场价格下降5%"],
        suggest: "7天内处理",
      },
      {
        id: "iphone15pro",
        type: "profit",
        icon: "💰",
        title: "利润机会",
        name: "iPhone15 Pro",
        meta: ["当前利润空间+8%"],
        suggest: "继续持有",
      },
      {
        id: "airpods-pro2",
        type: "restock",
        icon: "📦",
        title: "补货建议",
        name: "AirPods Pro2",
        meta: ["近期成交上涨23%"],
        suggest: "增加采购",
      },
    ],

    /** 导入字段约定，便于接 Excel / CSV */
    importSchema: [
      { key: "brand", label: "品牌" },
      { key: "model", label: "型号" },
      { key: "capacity", label: "容量" },
      { key: "condition", label: "成色" },
      { key: "cost", label: "采购价" },
      { key: "qty", label: "数量" },
      { key: "purchaseDate", label: "采购日期" },
    ],

    /** 库存大脑独立页（inventory-dashboard）数据 */
    dashboard: {
      welcomeSub: "Revo 已分析你的库存，发现新的经营机会",
      health: {
        score: 82,
        scoreLabel: "库存健康度",
        scoreDesc: "整体健康，2项需要关注",
        stats: [
          { key: "count", icon: "📦", label: "库存数量", value: "128件", tone: "total" },
          { key: "value", icon: "💵", label: "库存金额", value: "¥52.6万", tone: "profit" },
          { key: "risk", icon: "⚠️", label: "风险库存", value: "8件", tone: "risk" },
          { key: "opp", icon: "💰", label: "赚钱机会", value: "15件", tone: "pending" },
        ],
      },
      actions: [
        {
          id: "act-macbook",
          icon: "🔥",
          tag: "优先",
          title: "处理 MacBook Air M2 库存",
          desc: "已积压28天，市场价格下降5%",
          cta: "查看方案",
        },
        {
          id: "act-iphone15",
          icon: "💰",
          tag: "机会",
          title: "iPhone15 Pro 可加价出售",
          desc: "当前利润空间 +8%，成交热度上升",
          cta: "查看行情",
        },
        {
          id: "act-airpods",
          icon: "📦",
          tag: "补货",
          title: "补货 AirPods Pro2",
          desc: "近期成交上涨23%，库存仅剩3件",
          cta: "去收货",
        },
      ],
      trends: [
        { key: "stock", label: "库存变化", value: "-6件", text: "本周库存减少，周转加快", dir: "down", good: true },
        { key: "profit", label: "利润变化", value: "+¥3,200", text: "本周预计利润上升", dir: "up", good: true },
        { key: "turnover", label: "周转变化", value: "11天", text: "平均周转比上周快2天", dir: "up", good: true },
      ],
    },

    items: [
      {
        brand: "Apple",
        model: "MacBook Air M2",
        capacity: "8GB+256GB",
        condition: "95新",
        cost: 4200,
        qty: 6,
        purchaseDate: "2026-06-16",
      },
      {
        brand: "Apple",
        model: "iPhone 15 Pro",
        capacity: "256GB",
        condition: "95新",
        cost: 5100,
        qty: 12,
        purchaseDate: "2026-07-02",
      },
    ],
  };

  global.InventoryData = {
    getBrain() {
      return INVENTORY_BRAIN;
    },

    getOverview() {
      return INVENTORY_BRAIN.overview;
    },

    getDiagnoses() {
      return INVENTORY_BRAIN.diagnoses;
    },

    getImportSchema() {
      return INVENTORY_BRAIN.importSchema;
    },

    /** 库存大脑独立页数据（含诊断，复用 diagnoses） */
    getDashboard() {
      return {
        ...INVENTORY_BRAIN.dashboard,
        diagnoses: INVENTORY_BRAIN.diagnoses,
      };
    },

    /** @future GET /api/inventory */
    async fetchBrain() {
      return INVENTORY_BRAIN;
    },

    /** @future POST /api/inventory/import */
    async importInventory(_rows) {
      return { ok: true, count: 0 };
    },
  };

  global.inventoryData = INVENTORY_BRAIN;
})(window);
