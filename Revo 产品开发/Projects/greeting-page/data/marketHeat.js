/**
 * Market heat mock layer with category filtering.
 * API hook: MarketHeat.fetchHeatMap(type, category)
 */
(function (global) {
  const base = global.PriceData?.PRODUCT_PRICE_DATA || [];

  const buyHeat = [
    { id: "iphone15pro", category: "phone", name: "iPhone 15 Pro", score: 92, status: "good", buyPrice: "5200-6100", trend: "+12%", capitalEfficiency: "A", size: 1.35 },
    { id: "iphone14pro", category: "phone", name: "iPhone 14 Pro", score: 84, status: "good", buyPrice: "3600-4050", trend: "+8%", capitalEfficiency: "A", size: 1.18 },
    { id: "macbookairm2", category: "computer", name: "MacBook Air M2", score: 78, status: "watch", buyPrice: "4500-5100", trend: "+6%", capitalEfficiency: "B", size: 1.05 },
    { id: "iphone13", category: "phone", name: "iPhone 13", score: 75, status: "good", buyPrice: "1900-2250", trend: "+5%", capitalEfficiency: "B", size: 0.96 },
    { id: "ipadair", category: "tablet", name: "iPad Air", score: 66, status: "watch", buyPrice: "2700-3200", trend: "+3%", capitalEfficiency: "B", size: 0.88 },
    { id: "macbookprom1", category: "computer", name: "MacBook Pro M1", score: 58, status: "watch", buyPrice: "5700-6500", trend: "0%", capitalEfficiency: "C", size: 0.8 },
    { id: "kindle", category: "reader", name: "Kindle", score: 38, status: "risk", buyPrice: "280-420", trend: "-2%", capitalEfficiency: "C", size: 0.65 },
  ];

  const sellHeat = [
    { id: "iphone15pro", category: "phone", name: "iPhone 15 Pro", score: 95, days: "3-5天", profitStars: 5, capitalOccupation: "低", size: 1.4 },
    { id: "iphone14pro", category: "phone", name: "iPhone 14 Pro", score: 85, days: "4-7天", profitStars: 4, capitalOccupation: "低", size: 1.18 },
    { id: "iphone13", category: "phone", name: "iPhone 13", score: 75, days: "5-9天", profitStars: 4, capitalOccupation: "中", size: 1.0 },
    { id: "macbookairm2", category: "computer", name: "MacBook Air M2", score: 72, days: "7-14天", profitStars: 4, capitalOccupation: "中", size: 0.96 },
    { id: "ipadair", category: "tablet", name: "iPad Air", score: 62, days: "8-15天", profitStars: 3, capitalOccupation: "中", size: 0.85 },
    { id: "macbookprom1", category: "computer", name: "MacBook Pro M1", score: 54, days: "10-18天", profitStars: 3, capitalOccupation: "高", size: 0.76 },
    { id: "kindle", category: "reader", name: "Kindle", score: 36, days: "14-25天", profitStars: 2, capitalOccupation: "低", size: 0.62 },
  ];

  const futureHeat = [
    { id: "iphone16", category: "phone", name: "iPhone 16系列", score: 90, tags: ["新品周期", "需求上涨"], reasons: ["新品周期", "需求上涨", "库存减少"], size: 1.32 },
    { id: "iphone15pro", category: "phone", name: "iPhone 15 Pro", score: 86, tags: ["价格回升", "流动性高"], reasons: ["价格回升", "需求增长"], size: 1.18 },
    { id: "macbookairm2", category: "computer", name: "MacBook Air M2", score: 78, tags: ["开学季", "办公需求"], reasons: ["需求增长", "稳定利润"], size: 1.04 },
    { id: "ipadair", category: "tablet", name: "iPad Air", score: 70, tags: ["平板换新", "稳定利润"], reasons: ["需求增长"], size: 0.92 },
    { id: "macbookprom1", category: "computer", name: "MacBook Pro M1", score: 64, tags: ["专业用户", "慢周转"], reasons: ["细分需求"], size: 0.84 },
    { id: "kindle", category: "reader", name: "Kindle", score: 42, tags: ["小众需求", "低客单"], reasons: ["小众市场"], size: 0.66 },
  ];

  function filterByCategory(list, category) {
    if (!category || category === "all") return list;
    return list.filter((item) => item.category === category);
  }

  function detailFor(id) {
    const source = base.find((item) => item.id === id) || base.find((item) => id.includes(item.id));
    if (source) return source;
    return {
      brand: "Apple",
      model: id === "iphone16" ? "iPhone 16系列" : "未收录商品",
      capacity: "主流容量",
      condition: "95新",
      marketPrice: "等待采集",
      buyPrice: "等待采集",
      profit: "等待模型判断",
      salesSpeed: "等待成交样本",
      futureOpportunity: "观察",
    };
  }

  global.MarketHeat = {
    getHeatMap(type, category) {
      const map = type === "sell" ? sellHeat : type === "future" ? futureHeat : buyHeat;
      return filterByCategory(map, category);
    },
    getDetail: detailFor,
    getCategoryOverview() {
      return global.CategoryData?.getOverview() || [];
    },
    getCategoryRanking(category) {
      return global.CategoryData?.getRanking(category) || [];
    },
    /** @future API */
    async fetchHeatMap(type, category) {
      return this.getHeatMap(type, category);
    },
  };
})(window);
