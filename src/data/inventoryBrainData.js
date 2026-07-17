/**
 * inventoryBrainData — V1.9 库存大脑闭环 Mock
 * 拍照入库 → AI分析 → 入库确认 → 库存决策
 * @future inventoryAPI: GET/POST /api/inventory
 * @future visionAPI:    POST /api/vision/inventory
 * @future marketAPI:    GET /api/market/:sku
 */
(function (global) {
  const STORE_KEY = "revo_inventory_brain_v19";
  const PENDING_KEY = "revo_inventory_pending_v19";

  function daysBetween(dateStr) {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const now = new Date();
    if (Number.isNaN(start.getTime())) return 0;
    return Math.max(0, Math.floor((now - start) / 86400000));
  }

  function parseRangeMid(range) {
    if (!range || typeof range !== "string") return 0;
    const nums = range.match(/\d+/g);
    if (!nums || !nums.length) return 0;
    if (nums.length === 1) return Number(nums[0]);
    return Math.round((Number(nums[0]) + Number(nums[1])) / 2);
  }

  function money(n) {
    const v = Number(n) || 0;
    if (v >= 10000) return `¥${(v / 10000).toFixed(1)}万`;
    return `¥${v.toLocaleString()}`;
  }

  /** 初始 mock 库存 */
  const SEED_ITEMS = [
    {
      id: "inv-iphone15pro",
      name: "iPhone15 Pro 256G",
      brand: "Apple",
      model: "iPhone15 Pro",
      capacity: "256G",
      condition: "95新",
      color: "原色钛金属",
      category: "手机",
      qty: 3,
      cost: 5200,
      sellRange: "5800-6100",
      sellMid: 5950,
      profit: 750,
      profitText: "+¥750 / 件",
      purchaseDate: "2026-07-02",
      days: 14,
      bucket: "earn",
      advice: {
        action: "继续持有",
        reason: "新品周期临近，需求提升",
        detail: "9-11 月换机旺季临近，Pro 系列利润空间仍在扩大，建议继续持有并关注成色溢价。",
      },
      source: "mock",
    },
    {
      id: "inv-macbook-air-m2",
      name: "MacBook Air M2 256G",
      brand: "Apple",
      model: "MacBook Air M2",
      capacity: "8GB+256GB",
      condition: "95新",
      color: "午夜色",
      category: "电脑整机",
      qty: 2,
      cost: 4300,
      sellRange: "4600-4900",
      sellMid: 4750,
      profit: 450,
      profitText: "+¥450 / 件",
      purchaseDate: "2026-06-16",
      days: 30,
      bucket: "risk",
      advice: {
        action: "尽快出货",
        reason: "库存超28天，市场价格下行",
        detail: "轻薄本周转变慢，建议 7 天内让利出清，避免资金继续占用。",
      },
      source: "mock",
    },
    {
      id: "inv-airpods-pro2",
      name: "AirPods Pro2",
      brand: "Apple",
      model: "AirPods Pro2",
      capacity: "标准版",
      condition: "充新",
      color: "白色",
      category: "娱乐影音",
      qty: 5,
      cost: 900,
      sellRange: "1050-1180",
      sellMid: 1115,
      profit: 215,
      profitText: "+¥215 / 件",
      purchaseDate: "2026-07-08",
      days: 8,
      bucket: "wait",
      advice: {
        action: "等待机会",
        reason: "礼赠节点临近，短期可再观望",
        detail: "周转快但当前价差一般，可等到周末/礼赠节点再冲一波售价。",
      },
      source: "mock",
    },
    {
      id: "inv-iphone14",
      name: "iPhone14 128G",
      brand: "Apple",
      model: "iPhone14",
      capacity: "128G",
      condition: "99新",
      color: "午夜色",
      category: "手机",
      qty: 4,
      cost: 2800,
      sellRange: "3100-3350",
      sellMid: 3225,
      profit: 425,
      profitText: "+¥425 / 件",
      purchaseDate: "2026-07-05",
      days: 11,
      bucket: "earn",
      advice: {
        action: "优先出售",
        reason: "成交活跃，利润明确",
        detail: "中端换机需求稳，建议挂价走量，加快资金回笼。",
      },
      source: "mock",
    },
    {
      id: "inv-switch-oled",
      name: "Switch OLED",
      brand: "Nintendo",
      model: "Switch OLED",
      capacity: "64G",
      condition: "95新",
      color: "白色",
      category: "娱乐影音",
      qty: 1,
      cost: 1450,
      sellRange: "1500-1620",
      sellMid: 1560,
      profit: 110,
      profitText: "+¥110 / 件",
      purchaseDate: "2026-06-01",
      days: 45,
      bucket: "risk",
      advice: {
        action: "降价出清",
        reason: "积压过久，利润被时间吃掉",
        detail: "建议直接降至成本线附近出清，释放资金做更高周转品类。",
      },
      source: "mock",
    },
  ];

  const DIAGNOSIS = [
    { id: "d1", tone: "warn", text: "2 件商品库存超过 28 天，资金占用偏高。" },
    { id: "d2", tone: "good", text: "iPhone15 Pro 利润空间扩大，适合继续持有。" },
    { id: "d3", tone: "tip", text: "配件类周转快，可保持轻库存滚动补货。" },
  ];

  let items = null;
  let pendingCapture = null;

  function loadItems() {
    if (items) return items;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          items = parsed.map(normalizeItem);
          return items;
        }
      }
    } catch { /* ignore */ }
    items = SEED_ITEMS.map((x) => normalizeItem({ ...x }));
    persist();
    return items;
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(items || []));
    } catch { /* ignore */ }
  }

  function normalizeItem(row) {
    const days = row.days != null ? row.days : daysBetween(row.purchaseDate);
    const sellMid = row.sellMid || parseRangeMid(row.sellRange);
    const cost = Number(row.cost) || 0;
    const profit = row.profit != null ? row.profit : Math.max(0, sellMid - cost);
    const bucket = row.bucket || (days >= 28 ? "risk" : profit >= 400 ? "earn" : "wait");
    return {
      ...row,
      days,
      sellMid,
      profit,
      profitText: row.profitText || `+¥${profit} / 件`,
      capital: cost * (row.qty || 1),
      expectedValue: sellMid * (row.qty || 1),
      expectedProfit: profit * (row.qty || 1),
      bucket,
      advice: row.advice || {
        action: "持续关注",
        reason: "市场波动中",
        detail: "建议结合行情与库存天数再决策。",
      },
    };
  }

  function summaryOf(list) {
    const count = list.reduce((s, x) => s + (x.qty || 1), 0);
    const value = list.reduce((s, x) => s + (x.expectedValue || 0), 0);
    const profit = list.reduce((s, x) => s + (x.expectedProfit || 0), 0);
    return {
      count,
      countText: `${count}件`,
      value,
      valueText: money(value),
      profit,
      profitText: money(profit),
    };
  }

  function bucketsOf(list) {
    return {
      earn: list.filter((x) => x.bucket === "earn"),
      risk: list.filter((x) => x.bucket === "risk"),
      wait: list.filter((x) => x.bucket === "wait"),
    };
  }

  function fromVisionConfirm(vision, decision, { cost } = {}) {
    const costNum = cost == null || cost === "" ? 0 : Number(cost) || 0;
    const sellRange = (decision && decision.market && decision.market.sellRange)
      || (vision.market && vision.market.sellRange)
      || "—";
    const sellMid = parseRangeMid(sellRange);
    const profit = sellMid && costNum ? Math.max(0, sellMid - costNum) : parseRangeMid(
      (decision && decision.market && decision.market.profitRange) || ""
    );
    const verdict = decision && decision.advice && decision.advice.verdict;
    let bucket = "wait";
    if (verdict === "buy") bucket = "earn";
    if (verdict === "caution") bucket = "risk";

    return normalizeItem({
      id: `inv-${Date.now()}`,
      name: vision.name || [vision.brand, vision.model, vision.capacity].filter(Boolean).join(" "),
      brand: vision.brand,
      model: vision.model,
      capacity: vision.capacity,
      condition: vision.condition,
      color: vision.color || "",
      battery: vision.battery || "",
      category: vision.category || "其他",
      qty: vision.qty || 1,
      cost: costNum,
      sellRange,
      sellMid,
      profit,
      purchaseDate: new Date().toISOString().slice(0, 10),
      days: 0,
      bucket,
      advice: {
        action: verdict === "caution" ? "谨慎持有" : "继续持有",
        reason: (decision && decision.advice && decision.advice.desc) || "新品入库，持续观察行情",
        detail: decision && decision.advice
          ? `${decision.advice.title}：${decision.advice.desc}`
          : "刚入库，建议先观察 3-7 天成交热度再决定加价或出货。",
      },
      tradeDecision: decision ? {
        verdict: decision.advice && decision.advice.verdict,
        title: decision.advice && decision.advice.title,
        sellRange,
        buySuggest: decision.market && decision.market.buySuggest,
        profitRange: decision.market && decision.market.profitRange,
      } : null,
      source: "ai-photo",
      visionId: vision.id,
    });
  }

  global.InventoryBrainData = {
    STORE_KEY,

    getItems() {
      return loadItems().slice();
    },

    getItem(id) {
      return loadItems().find((x) => String(x.id) === String(id)) || null;
    },

    getSummary() {
      return summaryOf(loadItems());
    },

    getBuckets() {
      return bucketsOf(loadItems());
    },

    getDiagnosis() {
      const list = loadItems();
      const riskN = list.filter((x) => x.bucket === "risk").length;
      const earnN = list.filter((x) => x.bucket === "earn").length;
      const lines = [
        {
          id: "live-risk",
          tone: "warn",
          text: riskN
            ? `${riskN} 件风险库存需要优先处理。`
            : "暂无明显风险库存，资金结构健康。",
        },
        {
          id: "live-earn",
          tone: "good",
          text: earnN
            ? `${earnN} 件赚钱机会，可按建议择机出货或继续持有。`
            : "暂无高利润机会，建议通过拍照入库补充优质货源。",
        },
        ...DIAGNOSIS.slice(0, 1),
      ];
      return lines;
    },

    getDashboard() {
      return {
        summary: this.getSummary(),
        diagnosis: this.getDiagnosis(),
        buckets: this.getBuckets(),
        items: this.getItems(),
      };
    },

    addItem(item) {
      loadItems();
      const row = normalizeItem(item);
      items = [row, ...items];
      persist();
      // 同步旧库存页本地库，保持兼容
      if (global.InventoryPage && InventoryPage.saveStoredItems) {
        const legacy = InventoryPage.loadStoredItems() || [];
        InventoryPage.saveStoredItems([
          {
            id: row.id,
            brand: row.brand,
            model: row.model,
            capacity: row.capacity,
            condition: row.condition,
            color: row.color || "",
            category: row.category,
            cost: row.cost,
            qty: row.qty,
            purchaseDate: row.purchaseDate,
            days: row.days,
            capital: row.capital,
            level: row.bucket === "risk" ? "risk" : row.bucket === "earn" ? "healthy" : "watch",
            suggest: row.advice && row.advice.action,
            name: row.name,
            market: { sellRange: row.sellRange },
            source: row.source,
          },
          ...legacy,
        ]);
      }
      return row;
    },

    /** 拍照流程临时态（内存；预览图 blob 不可持久化） */
    setPendingCapture(payload) {
      pendingCapture = payload || null;
      try {
        if (payload) {
          const { previewUrl, ...rest } = payload;
          sessionStorage.setItem(PENDING_KEY, JSON.stringify(rest));
        } else {
          sessionStorage.removeItem(PENDING_KEY);
        }
      } catch { /* ignore */ }
      return pendingCapture;
    },

    getPendingCapture() {
      if (pendingCapture) return pendingCapture;
      try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        if (!raw) return null;
        pendingCapture = JSON.parse(raw);
        return pendingCapture;
      } catch {
        return null;
      }
    },

    clearPendingCapture() {
      pendingCapture = null;
      try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
    },

    confirmFromPending({ cost } = {}) {
      const pending = this.getPendingCapture();
      if (!pending || !pending.vision) return { ok: false, message: "没有待确认的识别结果" };
      const item = fromVisionConfirm(pending.vision, pending.decision, { cost });
      this.addItem(item);
      this.clearPendingCapture();
      return { ok: true, item };
    },

    money,

    /** @future inventoryAPI */
    async fetchInventory() {
      return this.getDashboard();
    },

    /** @future visionAPI */
    async fetchVision(_image) {
      return global.VisionInventoryData
        ? VisionInventoryData.recognizeImage(_image)
        : { ok: false };
    },

    /** @future marketAPI */
    async fetchMarket(sku) {
      const item = this.getItem(sku);
      return item ? { sellRange: item.sellRange, profit: item.profit } : null;
    },
  };
})(window);
