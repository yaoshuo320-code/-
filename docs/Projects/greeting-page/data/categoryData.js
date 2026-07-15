/**
 * Industry category analytics mock data.
 */
(function (global) {
  const CATEGORIES = [
    { key: "all", label: "全品类" },
    { key: "phone", label: "手机" },
    { key: "computer", label: "电脑" },
    { key: "tablet", label: "平板" },
    { key: "reader", label: "电子书" },
    { key: "accessory", label: "配件" },
  ];

  const INDUSTRY_OVERVIEW = [
    { category: "手机", heat: 95, frequency: 92, growth: 18 },
    { category: "电脑", heat: 78, frequency: 68, growth: 12 },
    { category: "平板", heat: 62, frequency: 55, growth: 8 },
    { category: "电子书", heat: 38, frequency: 32, growth: 4 },
    { category: "配件", heat: 28, frequency: 45, growth: 6 },
  ];

  const PRODUCT_RANKINGS = {
    all: INDUSTRY_OVERVIEW.map((i) => ({ name: i.category, score: i.heat })),
    phone: [
      { name: "iPhone15 Pro", score: 95 },
      { name: "iPhone14 Pro", score: 85 },
      { name: "iPhone13", score: 75 },
    ],
    computer: [
      { name: "MacBook Air M2", score: 78 },
      { name: "MacBook Pro M1", score: 68 },
      { name: "MacBook Air M1", score: 61 },
    ],
    tablet: [
      { name: "iPad Air", score: 62 },
      { name: "iPad Pro 11", score: 58 },
      { name: "iPad mini", score: 46 },
    ],
    reader: [
      { name: "Kindle Paperwhite", score: 38 },
      { name: "Kindle Oasis", score: 32 },
    ],
    accessory: [
      { name: "AirPods Pro", score: 28 },
      { name: "Apple Pencil", score: 24 },
      { name: "妙控键盘", score: 18 },
    ],
  };

  global.CategoryData = {
    CATEGORIES,
    getOverview() {
      return INDUSTRY_OVERVIEW;
    },
    getRanking(category) {
      return PRODUCT_RANKINGS[category] || PRODUCT_RANKINGS.all;
    },
  };
})(window);
