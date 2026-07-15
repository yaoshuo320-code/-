const { findModel, getSuggestedPrices } = require("./models");

function toNumber(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : NaN;
}

function getProfitJudgment(profit) {
  if (profit < 100) return { label: "不建议做", level: "bad" };
  if (profit <= 300) return { label: "可以考虑", level: "ok" };
  return { label: "值得做", level: "good" };
}

function getMarginJudgment(marginRate) {
  if (marginRate < 10) return { label: "危险", level: "danger" };
  if (marginRate <= 15) return { label: "一般", level: "normal" };
  return { label: "优质", level: "premium" };
}

function getLiquidityLabel(score) {
  if (score >= 9) return "极快出货";
  if (score >= 7) return "流通较快";
  if (score >= 5) return "流通一般";
  if (score >= 3) return "出货偏慢";
  return "几乎难出";
}

function getSelectionJudgment(model, purchase, sell, profit, marginRate) {
  const liquidity = model.liquidity;
  const demand = model.demand;
  const { suggestBuy, suggestSell } = getSuggestedPrices(model);

  const liquidityScore = liquidity * 10;
  const demandScore = demand * 10;
  const profitScore = profit >= 300 ? 100 : profit >= 100 ? 65 : profit > 0 ? 35 : 0;
  const marginScore = marginRate > 15 ? 100 : marginRate >= 10 ? 70 : marginRate > 0 ? 40 : 0;
  const buyScore =
    purchase <= suggestBuy ? 100 : purchase <= model.priceMid ? 70 : purchase <= model.priceHigh ? 40 : 15;
  const sellScore = sell >= suggestSell ? 90 : sell >= model.priceMid ? 70 : sell >= model.priceLow ? 45 : 20;

  const totalScore =
    liquidityScore * 0.28 +
    demandScore * 0.22 +
    profitScore * 0.2 +
    marginScore * 0.1 +
    buyScore * 0.1 +
    sellScore * 0.1;

  let label = "谨慎";
  let level = "warn";
  let reason = "流动性或利润空间一般，建议控制收货价并缩短周转周期。";

  if (totalScore >= 72 && liquidity >= 7 && profit >= 100 && marginRate >= 10) {
    label = "适合收货";
    level = "good";
    reason = "流动性好、利润空间充足，市场需求稳定，可按建议价收货。";
  } else if (totalScore < 48 || liquidity <= 3 || profit < 50 || marginRate < 5) {
    label = "不建议";
    level = "bad";
    reason = "流动性弱或利润空间不足，压货风险高，建议放弃或大幅还价。";
  } else if (purchase > model.priceMid) {
    reason = "收货价偏高，压缩了利润空间，建议重新议价。";
  }

  return {
    label,
    level,
    reason,
    totalScore: Math.round(totalScore),
    liquidity,
    liquidityLabel: getLiquidityLabel(liquidity),
    demand,
  };
}

function analyzeSelection({ modelName, purchasePrice, sellPrice }) {
  const model = findModel(modelName);

  if (!modelName || !String(modelName).trim()) {
    return { valid: false, message: "请输入手机型号" };
  }

  if (!model) {
    return { valid: false, message: "未识别该型号，请从列表中选择或检查拼写" };
  }

  const purchase = toNumber(purchasePrice);
  const sell = toNumber(sellPrice);

  if (!Number.isFinite(purchase) || !Number.isFinite(sell)) {
    return { valid: false, message: "请输入有效的采购价和售价" };
  }

  if (purchase <= 0 || sell <= 0) {
    return { valid: false, message: "价格必须大于 0" };
  }

  const profit = sell - purchase;
  const marginRate = (profit / purchase) * 100;
  const { suggestBuy, suggestSell } = getSuggestedPrices(model);

  return {
    valid: true,
    model,
    purchase,
    sell,
    profit,
    marginRate,
    market: {
      low: model.priceLow,
      mid: model.priceMid,
      high: model.priceHigh,
    },
    suggestBuy,
    suggestSell,
    profitJudgment: getProfitJudgment(profit),
    marginJudgment: getMarginJudgment(marginRate),
    selection: getSelectionJudgment(model, purchase, sell, profit, marginRate),
  };
}

function formatMoney(value) {
  return Math.round(value).toString();
}

function formatRate(value) {
  return value.toFixed(1);
}

module.exports = {
  analyzeSelection,
  formatMoney,
  formatRate,
  getLiquidityLabel,
};
