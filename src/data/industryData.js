/**
 * IndustryData — V1.8 二手3C行业生命周期地图 Mock
 * 二级品类 + 三级品类趋势 + AI行业建议
 * @future industryAPI: GET /api/market/industry-lifecycle
 * @future seasonAPI:   GET /api/market/season/:category
 */
(function (global) {
  const SECTORS = [
    { key: "all", label: "全品类" },
    { key: "phone", label: "手机" },
    { key: "computer", label: "电脑整机" },
    { key: "camera", label: "数码相机" },
    { key: "av", label: "娱乐影音" },
    { key: "parts", label: "装配件" },
  ];

  const SECTOR_HEAT = [
    { key: "phone", name: "手机", heat: 92 },
    { key: "computer", name: "电脑整机", heat: 78 },
    { key: "camera", name: "数码相机", heat: 66 },
    { key: "av", name: "娱乐影音", heat: 71 },
    { key: "parts", name: "装配件", heat: 84 },
  ];

  /** 三级品类趋势（平板挂在电脑整机下展示） */
  const TERTIARY_TRENDS = {
    phone: [
      { name: "苹果手机", heat: 95, growth: "+12%", season: "旺季 9-11月", opportunity: "Pro 系列周转快，8月起锁定热门旧机货源" },
      { name: "安卓手机", heat: 72, growth: "+8%", season: "平季偏旺", opportunity: "旗舰与折叠屏有细分机会，注意成色与渠道" },
    ],
    computer: [
      { name: "商务笔记本", heat: 80, growth: "+9%", season: "旺季 8-9 · 12月", opportunity: "办公换机稳定，适合走量控价" },
      { name: "游戏笔记本", heat: 74, growth: "+6%", season: "旺季 8-9月", opportunity: "高配周转偏慢，严控收货价与库存天数" },
      { name: "MacBook", heat: 88, growth: "+10%", season: "全年偏旺", opportunity: "M 系列办公需求持续，利润相对稳定" },
      { name: "苹果平板", heat: 86, growth: "+11%", season: "旺季 6-8 · 12月", opportunity: "教育与娱乐双驱动，暑期前可小量备货" },
      { name: "安卓平板", heat: 58, growth: "+5%", season: "平季", opportunity: "客单偏低，适合搭配配件走量" },
    ],
    camera: [
      { name: "微单相机", heat: 70, growth: "+7%", season: "旺季 5-8月", opportunity: "出行季高客单，需具备验机能力" },
      { name: "运动相机", heat: 76, growth: "+12%", season: "旺季 5-8 · 10月", opportunity: "暑期/国庆出行刚需，周转快于微单" },
    ],
    av: [
      { name: "电纸书", heat: 64, growth: "+8%", season: "旺季 6-8 · 12月", opportunity: "礼赠与阅读季需求，库存宜轻" },
      { name: "耳机", heat: 82, growth: "+14%", season: "全年偏旺", opportunity: "TWS/降噪流动性高，客单低但周转快" },
    ],
    parts: [
      { name: "组装台式机", heat: 68, growth: "+6%", season: "旺季 9-11月", opportunity: "整机搭配配件销售，注意显卡型号匹配" },
      { name: "显卡", heat: 86, growth: "+15%", season: "旺季 9-11月", opportunity: "价格波动大，快进快出、关注保修" },
      { name: "SSD", heat: 78, growth: "+9%", season: "全年偏旺", opportunity: "NVMe 需求稳定，适合搭配整机出货" },
      { name: "内存", heat: 72, growth: "+7%", season: "平季偏旺", opportunity: "DDR5 升级需求在增，走量利润偏薄" },
    ],
  };

  /** AI 行业建议（按二级品类） */
  const AI_ADVICE = {
    phone: {
      title: "手机行业建议",
      points: [
        "8月开始关注热门旧机库存，抢新品换机窗口。",
        "苹果机优先 Pro / 大容量；安卓聚焦旗舰与折叠屏验机能力。",
        "淡季（1-2、6-7月）严控高价机积压，加快周转。",
      ],
      action: "本周可盘点 iPhone 14/15 系列可售库存与收货价空间。",
    },
    computer: {
      title: "电脑整机行业建议",
      points: [
        "7月起备货商务本与学生机型，对接 8-9 月开学旺季。",
        "游戏本控制深度；MacBook 维持现金流；平板暑期前轻度备货。",
        "12月关注年末办公采购回升，提前锁定成色好的 M 系列。",
      ],
      action: "检查商务本/MacBook/iPad 库存天数，超 21 天优先让利出货。",
    },
    camera: {
      title: "数码相机行业建议",
      points: [
        "4月起补充微单与运动相机快手货，对接出行旺季。",
        "运动相机周转快于微单，适合作为现金流品。",
        "淡季减少高客单压货，加强验机与售后话术。",
      ],
      action: "盘点运动相机与入门微单库存，缺货型号列入关注收货名单。",
    },
    av: {
      title: "娱乐影音行业建议",
      points: [
        "5月起补充耳机、电纸书等快周转型号。",
        "耳机适合滚动补货；电纸书偏礼赠节点，库存宜轻。",
        "12月礼赠旺季前两周完成补货即可。",
      ],
      action: "检查降噪耳机与热门电纸书缺货情况，小量补齐。",
    },
    parts: {
      title: "装配件行业建议",
      points: [
        "旺季前（8月）锁定显卡、SSD 等爆款，避免断货。",
        "装配件整体适合作为现金流品类常备。",
        "显卡快进快出；内存/SSD 可搭配整机提高客单。",
      ],
      action: "核对显卡与 NVMe SSD 热门型号库存，缺货优先补。",
    },
  };

  const DEFAULT_ADVICE = {
    title: "行业总览建议",
    points: [
      "先选二级品类，查看全年曲线与三级趋势，再决定备货节奏。",
      "旺季前 4-6 周布局货源，淡季以清库存、控资金为主。",
      "装配件与耳机适合做现金流；高客单品类严控库存天数。",
    ],
    action: "点击上方品类，进入对应生命周期地图。",
  };

  global.IndustryData = {
    SECTORS,

    getSectorHeat(sector) {
      if (!sector || sector === "all") return SECTOR_HEAT;
      const item = SECTOR_HEAT.find((s) => s.key === sector);
      return item ? [item] : SECTOR_HEAT;
    },

    getTertiaryTrends(sector) {
      return TERTIARY_TRENDS[sector] || [];
    },

    getAiAdvice(sector) {
      if (!sector || sector === "all") return DEFAULT_ADVICE;
      return AI_ADVICE[sector] || DEFAULT_ADVICE;
    },

    /** 曲线品类 id，与 SeasonTrendData 二级对齐 */
    getCurveCategoryId(sector) {
      if (!sector || sector === "all") return "phone";
      return sector;
    },

    /** @future industryAPI */
    async fetchIndustryLifecycle(sector) {
      return {
        heat: this.getSectorHeat(sector),
        tertiary: this.getTertiaryTrends(sector),
        advice: this.getAiAdvice(sector),
      };
    },

    /** @future seasonAPI */
    async fetchSeason(sector) {
      const id = this.getCurveCategoryId(sector);
      return global.SeasonTrendData ? SeasonTrendData.fetchSeason(id) : null;
    },
  };
})(window);
