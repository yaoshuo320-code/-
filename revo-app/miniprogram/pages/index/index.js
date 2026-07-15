const { generateDailyRecommendations } = require("../../utils/recommend");

Page({
  data: {
    date: "",
    recCount: 0,
    topPick: null,
    recommended: [],
    notRecommended: [],
    topThree: [],
    podium: [],
    rules: [],
    rulesOpen: false,
  },

  onLoad() {
    this.refresh();
  },

  refresh() {
    const data = generateDailyRecommendations();
    const podium = [
      data.topThree[1] ? { ...data.topThree[1], rank: 2 } : null,
      data.topThree[0] ? { ...data.topThree[0], rank: 1 } : null,
      data.topThree[2] ? { ...data.topThree[2], rank: 3 } : null,
    ].filter(Boolean);

    this.setData({
      date: data.date,
      recCount: data.recommended.length,
      topPick: data.topPick ? formatRec(data.topPick) : null,
      recommended: data.recommended.slice(1).map(formatRec),
      notRecommended: data.notRecommended,
      topThree: data.topThree.map((m, i) => ({
        ...formatRec(m),
        rankNum: i + 1,
        rankClass: ["gold", "silver", "bronze"][i],
      })),
      podium: podium.map(formatRec),
      rules: data.rules,
    });
  },

  toggleRules() {
    this.setData({ rulesOpen: !this.data.rulesOpen });
  },
});

function formatRec(m) {
  return {
    name: m.name,
    shortName: m.shortName || m.name,
    storage: m.storage || "",
    storageBonus: m.storageBonus,
    score: m.score,
    liquidity: m.liquidity,
    suggestBuy: m.suggestBuy,
    suggestSell: m.suggestSell,
    estimatedProfit: m.estimatedProfit,
    profitLabel: m.profitPotential.label,
    profitLevel: m.profitPotential.level,
    riskLabel: m.riskLevel.label,
    riskLevel: m.riskLevel.level,
    reason: m.reason || "",
  };
}
