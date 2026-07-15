/**
 * 交易利润决策引擎 — 基于价格大脑 V1
 */
(function (global) {
  const brain = () => global.PriceBrain;

  function isPhoneBrand(brand) {
    return brain().isPhoneBrand(brand);
  }

  function getOpportunityList(mode, limit) {
    return brain().getTopOpportunities(mode, limit);
  }

  function analyzeTradeProfit(input) {
    return brain().analyzeTrade(input);
  }

  global.TradeEngine = {
    isPhoneBrand,
    getOpportunityList,
    analyzeTradeProfit,
  };
})(typeof window !== "undefined" ? window : globalThis);
