/**
 * V11 今日市场变化 — 模拟日更数据
 */
(function (global) {
  function getTodayMarketChanges() {
    const d = new Date();
    const daySeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

    const hotCategories = [
      { label: "iPhone Pro 系列", trend: "up", text: "走量上升，Pro / Pro Max 询价活跃" },
      { label: "标准版 iPhone", trend: "stable", text: "价格平稳，适合快收快出" },
      { label: "Kindle", trend: "down", text: "成交周期拉长，控价收货" },
    ];

    const riskChanges = [
      { label: "老安卓", level: "high", text: "风险维持高位，不建议压货" },
      { label: "碎屏 / 大修机", level: "high", text: "纠纷率高，今日继续规避" },
      { label: "华为高端", level: "mid", text: "渠道波动，需盯价出货" },
    ];

    const newOpportunities = [
      { name: "iPhone 14 Pro", tag: "价格回落", text: "收货区下移，性价比回升" },
      { name: "iPhone 13", tag: "走量稳定", text: "经典走量款，适合新手商家" },
    ];

    // 按日期微调展示顺序，营造「日更」感
    const rotate = daySeed % 2;
    if (rotate) {
      newOpportunities.reverse();
    }

    return {
      date: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
      hotCategories,
      riskChanges,
      newOpportunities,
    };
  }

  global.MarketDaily = { getTodayMarketChanges };
})(typeof window !== "undefined" ? window : globalThis);
