const { PHONE_MODELS, getSuggestedPrices } = require("./models");

const INDUSTRY_RULES = [
  { icon: "🍎", text: "苹果 > 安卓：iPhone 系列流动性与溢价能力更强" },
  { icon: "🆕", text: "新款 > 老款：越新的机型周转越快、掉价越慢" },
  { icon: "⭐", text: "Pro > 标准版：Pro 系列利润空间和需求更稳定" },
  { icon: "💾", text: "256G 优先：大容量版本更好出手，压货风险更低" },
];

function getProfitPotential(model) {
  const spread = model.priceHigh - model.priceLow;
  const rate = (spread / model.priceMid) * 100;
  if (rate >= 12) return { label: "高", level: "high" };
  if (rate >= 8) return { label: "中", level: "mid" };
  return { label: "低", level: "low" };
}

function getRiskLevel(model) {
  if (model.liquidity <= 4 || model.demand <= 4) return { label: "高", level: "high" };
  if (model.liquidity <= 6 || model.demand <= 6) return { label: "中", level: "mid" };
  return { label: "低", level: "low" };
}

function scoreModel(model) {
  let score = model.liquidity * 12 + model.demand * 10;

  if (model.brand === "apple") score += 28;
  else if (model.brand === "huawei") score += 8;
  else score -= 8;

  score += model.generation * 2.5;

  if (model.isPro) score += 18;

  if (model.storageBonus) score += 12;

  const profit = getProfitPotential(model);
  if (profit.level === "high") score += 15;
  else if (profit.level === "mid") score += 8;
  else score -= 5;

  const risk = getRiskLevel(model);
  if (risk.level === "low") score += 10;
  else if (risk.level === "high") score -= 20;

  return Math.round(score);
}

function getNotRecommendReason(model) {
  const reasons = [];
  if (model.liquidity <= 4) reasons.push("流动性低");
  if (model.demand <= 4) reasons.push("市场需求弱");
  const profit = getProfitPotential(model);
  if (profit.level === "low") reasons.push("利润太低");
  if (model.brand === "android" && model.liquidity <= 5) reasons.push("压货风险");
  if (model.generation <= 11) reasons.push("机型过旧");
  if (reasons.length === 0) reasons.push("综合评分偏低");
  return reasons.join(" · ");
}

function generateDailyRecommendations() {
  const scored = PHONE_MODELS.map((model) => {
    const { suggestBuy, suggestSell } = getSuggestedPrices(model);
    return {
      ...model,
      score: scoreModel(model),
      profitPotential: getProfitPotential(model),
      riskLevel: getRiskLevel(model),
      suggestBuy,
      suggestSell,
      estimatedProfit: suggestSell - suggestBuy,
    };
  }).sort((a, b) => b.score - a.score);

  const recommended = scored
    .filter((m) => m.riskLevel.level !== "high")
    .slice(0, 10);

  const minRecommended = scored
    .filter((m) => m.riskLevel.level !== "high")
    .slice(0, 5);

  const finalRecommended =
    recommended.length >= 5 ? recommended : minRecommended;

  const notRecommended = scored
    .filter((m) => !finalRecommended.find((r) => r.name === m.name))
    .filter((m) => m.score < 80 || m.riskLevel.level === "high" || m.liquidity <= 5)
    .slice(0, 8)
    .map((m) => ({ ...m, reason: getNotRecommendReason(m) }));

  const topThree = finalRecommended.slice(0, 3).map((m, i) => ({
    rank: i + 1,
    rankLabel: `TOP ${i + 1}`,
    ...m,
  }));

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return {
    date: dateStr,
    recommended: finalRecommended,
    notRecommended,
    topThree,
    topPick: finalRecommended[0] || null,
    rules: INDUSTRY_RULES,
  };
}

module.exports = {
  generateDailyRecommendations,
  INDUSTRY_RULES,
  getProfitPotential,
  getRiskLevel,
  scoreModel,
};
