/**
 * V10 默认 mock 数据 — 保证页面打开即可渲染，不依赖引擎
 */
(function (global) {
  const TODAY_DATA = [
    { name: "iPhone 14 Pro", profit: "300-500", risk: "低", liquidity: 9 },
    { name: "iPhone 13", profit: "200-400", risk: "低", liquidity: 8 },
    { name: "iPhone 15", profit: "400-600", risk: "中", liquidity: 9 },
  ];

  function parseProfit(profit) {
    const parts = String(profit).split("-").map((n) => parseInt(n.trim(), 10));
    return { low: parts[0] || 0, high: parts[1] || parts[0] || 0 };
  }

  function riskFromLabel(label) {
    if (label === "低") return { label: "低", level: "low" };
    if (label === "中") return { label: "中", level: "mid" };
    return { label: "高", level: "high" };
  }

  function itemToModel(item, index) {
    const profitRange = parseProfit(item.profit);
    const riskLevel = riskFromLabel(item.risk);
    const basePrice = 3000 + index * 400;
    return {
      name: item.name,
      shortName: item.name,
      liquidity: item.liquidity,
      riskLevel,
      simpleAdvice: { label: "推荐", level: "good" },
      profitRange,
      buyRange: { low: profitRange.low, high: profitRange.low + 80 },
      sellRange: { low: profitRange.high, high: profitRange.high + 120 },
      marketZones: {
        low: { min: basePrice - 300, max: basePrice - 100 },
        mid: { min: basePrice - 100, max: basePrice + 100 },
        high: { min: basePrice + 100, max: basePrice + 300 },
      },
      currentMarketPrice: basePrice - 150,
      marketPosition: { label: "低价区", shortLabel: "低价", color: "good", zone: "low" },
      isUndervalued: index === 0,
      receiveSuitability: {
        label: "适合收货",
        level: "good",
        reason: "流动性好，利润区间可观",
      },
      selectionVerdict: { level: "good", reason: "今日推荐收货" },
    };
  }

  function buildDecisionData(productType) {
    const models = TODAY_DATA.map(itemToModel);
    const today = new Date();
    const date = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const recommendText = models.map((m) => m.shortName).join(" / ");

    return {
      productType: productType || "phone",
      productLabel: productType === "ereader" ? "电子书" : "手机",
      date,
      recommended: models,
      buckets: {
        recommendBuy: models,
        cautious: [],
        avoid: [
          {
            name: "老安卓",
            shortName: "老安卓",
            reason: "流动性低 · 压货风险高",
            simpleAdvice: { label: "不推荐", level: "bad" },
          },
        ],
      },
      dailyBrief: {
        headline: `今日建议收 ${recommendText}，风险较低，避开 老安卓`,
        recommendText,
        avoidText: "老安卓",
        riskLevel: { label: "较低", level: "good" },
        lines: [
          { key: "recommend", label: "推荐收", value: recommendText, icon: "✅" },
          { key: "risk", label: "风险提示", value: "较低", level: "good", icon: "⚠️" },
          { key: "avoid", label: "避免机型", value: "老安卓", icon: "🚫" },
        ],
        topOpportunities: models.map((m, i) => ({
          rank: i + 1,
          name: m.shortName,
          tag: "推荐",
          advice: "推荐",
          reason: m.receiveSuitability.reason,
          model: m,
        })),
      },
      isPaid: false,
      isPro: false,
      isMock: true,
    };
  }

  global.MockData = {
    TODAY_DATA,
    buildDecisionData,
  };
})(typeof window !== "undefined" ? window : globalThis);
