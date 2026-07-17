/**
 * seasonTrendData — 三级品类全年市场热度曲线 Mock
 * @future seasonAPI:   GET /api/market/season/:productId
 * @future industryAPI: GET /api/market/industry-lifecycle
 */
(function (global) {
  const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  function seasonOf(month, peaks, offs) {
    if ((peaks || []).includes(month)) return "旺季";
    if ((offs || []).includes(month)) return "淡季";
    return "平季";
  }

  function buildPoints(heats, peaks, offs) {
    return (heats || []).map((heat, i) => ({
      month: i + 1,
      label: MONTH_LABELS[i],
      heat,
      season: seasonOf(i + 1, peaks, offs),
    }));
  }

  function product(cfg) {
    const peaks = cfg.peaks || [];
    const offs = cfg.offs || [];
    const heats = cfg.heats || [];
    return {
      id: cfg.id,
      name: cfg.name,
      sectorId: cfg.sectorId,
      heats: heats.slice(),
      peakMonths: cfg.peakMonths || "—",
      offMonths: cfg.offMonths || "—",
      aiJudge: cfg.aiJudge || "",
      advise: cfg.advise || "",
      peaks,
      offs,
      points: buildPoints(heats, peaks, offs),
      hasCurve: heats.length === 12,
    };
  }

  /** 二级品类 */
  const SECTORS = [
    { id: "phone", name: "手机" },
    { id: "computer", name: "电脑整机" },
    { id: "camera", name: "数码相机" },
    { id: "av", name: "娱乐影音" },
    { id: "parts", name: "装配件" },
  ];

  /** 三级品类曲线 */
  const PRODUCTS = [
    product({
      id: "iphone",
      name: "苹果手机",
      sectorId: "phone",
      heats: [45, 42, 46, 50, 55, 60, 68, 78, 90, 95, 88, 62],
      peaks: [9, 10, 11],
      offs: [1, 2],
      peakMonths: "9-11月",
      offMonths: "1-2月",
      aiJudge: "秋季新品周期带动二手换机需求。",
      advise: "8月提前锁定库存。",
    }),
    product({
      id: "android",
      name: "安卓手机",
      sectorId: "phone",
      heats: [],
      peakMonths: "—",
      offMonths: "—",
      aiJudge: "数据待接入。",
      advise: "暂无经营建议。",
    }),
    product({
      id: "biz-laptop",
      name: "商务笔记本",
      sectorId: "computer",
      heats: [],
    }),
    product({
      id: "gaming-laptop",
      name: "游戏笔记本",
      sectorId: "computer",
      heats: [],
    }),
    product({
      id: "mirrorless",
      name: "微单相机",
      sectorId: "camera",
      heats: [],
    }),
    product({
      id: "action-cam",
      name: "运动相机",
      sectorId: "camera",
      heats: [],
    }),
    product({
      id: "ebook",
      name: "电纸书",
      sectorId: "av",
      heats: [],
    }),
    product({
      id: "earphone",
      name: "耳机",
      sectorId: "av",
      heats: [],
    }),
    product({
      id: "diy-pc",
      name: "组装机",
      sectorId: "parts",
      heats: [],
    }),
  ];

  global.SeasonTrendData = {
    MONTH_LABELS,

    getSectors() {
      return SECTORS.slice();
    },

    /** 兼容旧调用：二级品类列表 */
    getCategories() {
      return SECTORS.map((s) => ({ id: s.id, name: s.name }));
    },

    getProductsBySector(sectorId) {
      return PRODUCTS.filter((p) => p.sectorId === sectorId);
    },

    getProduct(id) {
      return PRODUCTS.find((p) => p.id === id) || null;
    },

    getById(id) {
      return this.getProduct(id) || PRODUCTS.find((p) => p.sectorId === id) || PRODUCTS[0];
    },

    getAll() {
      return PRODUCTS.slice();
    },

    /** 曲线数据：优先三级品类 */
    getHeatCurve(productId) {
      const p = this.getProduct(productId);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        heats: p.heats.slice(),
        labels: MONTH_LABELS.slice(),
        points: p.points.slice(),
        peakMonths: p.peakMonths,
        offMonths: p.offMonths,
        aiJudge: p.aiJudge,
        advise: p.advise,
        hasCurve: p.hasCurve,
      };
    },

    /** @future seasonAPI */
    async fetchSeason(productId) {
      return this.getProduct(productId);
    },

    /** @future industryAPI */
    async fetchIndustryLifecycle() {
      return SECTORS.map((s) => ({
        id: s.id,
        name: s.name,
        products: this.getProductsBySector(s.id).map((p) => ({
          id: p.id,
          name: p.name,
          hasCurve: p.hasCurve,
        })),
      }));
    },
  };
})(window);
