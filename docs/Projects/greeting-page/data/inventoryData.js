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
