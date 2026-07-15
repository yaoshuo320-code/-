/**
 * Industry trend data — sector hierarchy + trend map.
 * API hook: IndustryData.fetchTrendMap(sector)
 */
(function (global) {
  const SECTORS = [
    { key: "all", label: "全品类" },
    { key: "phone", label: "手机" },
    { key: "digital", label: "电脑数码" },
    { key: "entertainment", label: "娱乐影音" },
    { key: "parts", label: "组装配件" },
  ];

  const SECTOR_HEAT = [
    { key: "phone", name: "手机", heat: 95 },
    { key: "digital", name: "电脑数码", heat: 82 },
    { key: "entertainment", name: "娱乐影音", heat: 58 },
    { key: "parts", name: "组装配件", heat: 45 },
  ];

  const TREND_MAP = {
    phone: {
      rising: [
        { name: "iPhone 15 Pro", change: "+8%" },
        { name: "折叠屏手机", change: "+18%" },
      ],
      stable: [
        { name: "iPhone 14 Pro", change: "持平" },
        { name: "安卓旗舰", change: "稳定" },
      ],
      falling: [
        { name: "iPhone 12", change: "-5%" },
        { name: "老款安卓", change: "-8%" },
      ],
      opportunity: [
        { name: "折叠屏手机", note: "新品周期带来价差" },
        { name: "iPhone 16系列", note: "换机潮窗口" },
      ],
    },
    digital: {
      rising: [
        { name: "MacBook Air M2", change: "+10%" },
        { name: "轻薄本", change: "+9%" },
      ],
      stable: [
        { name: "MacBook Pro M1", change: "持平" },
        { name: "游戏本", change: "稳定" },
      ],
      falling: [
        { name: "老款 Intel 本", change: "-6%" },
      ],
      opportunity: [
        { name: "M系列 MacBook", note: "办公需求持续" },
        { name: "游戏本", note: "开学季备货" },
      ],
    },
    entertainment: {
      rising: [
        { name: "AirPods Pro", change: "+14%" },
        { name: "Switch", change: "+11%" },
      ],
      stable: [
        { name: "PS5", change: "持平" },
      ],
      falling: [
        { name: "老款耳机", change: "-4%" },
      ],
      opportunity: [
        { name: "降噪耳机", note: "TWS 走量快" },
      ],
    },
    parts: {
      rising: [
        { name: "显卡", change: "+15%" },
        { name: "SSD", change: "+9%" },
      ],
      stable: [
        { name: "内存", change: "稳定" },
      ],
      falling: [
        { name: "老款显卡", change: "-10%" },
      ],
      opportunity: [
        { name: "DDR5 内存", note: "升级需求增长" },
      ],
    },
  };

  const TERTIARY_TRENDS = {
    phone: [
      { name: "iPhone系列", heat: 95, growth: "+12%", opportunity: "高端需求稳定，Pro 系列周转快，适合快收快出" },
      { name: "安卓旗舰", heat: 72, growth: "+8%", opportunity: "三星/华为旗舰有细分机会，注意成色与渠道" },
      { name: "折叠屏", heat: 65, growth: "+18%", opportunity: "新品周期带来价差空间，适合有验机能力的商家" },
    ],
    digital: [
      { name: "MacBook", heat: 88, growth: "+10%", opportunity: "M 系列办公本需求持续，利润稳定" },
      { name: "游戏本", heat: 76, growth: "+6%", opportunity: "高配置机型周转偏慢，需控制收货价" },
      { name: "轻薄本", heat: 70, growth: "+9%", opportunity: "学生与白领换机需求，适合走量" },
    ],
    entertainment: [
      { name: "耳机", heat: 68, growth: "+14%", opportunity: "TWS 与降噪款流动性高，客单低但周转快" },
      { name: "游戏机", heat: 62, growth: "+11%", opportunity: "Switch/PS 季节性波动，关注节点备货" },
      { name: "相机", heat: 48, growth: "+5%", opportunity: "小众高客单，适合有鉴定能力的商家" },
    ],
    parts: [
      { name: "显卡", heat: 58, growth: "+15%", opportunity: "矿潮退潮后价格回归，关注型号与保修" },
      { name: "内存", heat: 42, growth: "+7%", opportunity: "DDR5 升级需求增长，走量利润薄" },
      { name: "SSD", heat: 40, growth: "+9%", opportunity: "NVMe 固态需求稳定，适合搭配整机销售" },
    ],
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
    getTrendMap(sector) {
      return TREND_MAP[sector] || null;
    },
    /** @future API */
    async fetchTrendMap(sector) {
      return this.getTrendMap(sector);
    },
  };
})(window);
