/**
 * tradeDecisionData — V1.6 AI 即时交易判断 Mock
 * 拍照识别后的第一次价值反馈（30秒内感知 Revo 价值）
 * @future priceAPI:  GET /api/price/:sku
 * @future marketAPI: GET /api/market/:sku
 * @future visionAPI: POST /api/vision/inventory
 */
(function (global) {
  const DECISIONS = {
    "vision-iphone15pro": {
      verdict: "buy",
      verdictIcon: "🔥",
      verdictTitle: "推荐收货",
      verdictDesc: "当前型号市场需求稳定，预计周转周期较短。",
      sellRange: "5800-6100",
      buySuggest: "5200以内",
      profitRange: "300-600",
      liquidity: 5,
      liquidityLabel: "流通速度",
    },
    "vision-macbook-air-m2": {
      verdict: "caution",
      verdictIcon: "⚠️",
      verdictTitle: "谨慎收货",
      verdictDesc: "当前库存压力较高，建议降低采购价格。",
      sellRange: "4800-5200",
      buySuggest: "4300以内",
      profitRange: "400-700",
      liquidity: 3,
      liquidityLabel: "流通速度",
    },
    "vision-airpods-pro2": {
      verdict: "buy",
      verdictIcon: "🔥",
      verdictTitle: "推荐收货",
      verdictDesc: "配件周转快，成交活跃，适合补充库存。",
      sellRange: "1050-1180",
      buySuggest: "920以内",
      profitRange: "130-220",
      liquidity: 5,
      liquidityLabel: "流通速度",
    },
  };

  const DEFAULT_DECISION = {
    verdict: "buy",
    verdictIcon: "🔥",
    verdictTitle: "推荐收货",
    verdictDesc: "市场需求稳定，可作为常规收货型号。",
    sellRange: "—",
    buySuggest: "待分析",
    profitRange: "—",
    liquidity: 4,
    liquidityLabel: "流通速度",
  };

  function stars(n) {
    const filled = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  global.TradeDecisionData = {
    stars,

    /** 根据视觉识别结果生成交易判断卡数据 */
    fromVision(vision) {
      if (!vision) return null;
      const base = DECISIONS[vision.id] || {
        ...DEFAULT_DECISION,
        sellRange: (vision.market && vision.market.sellRange) || DEFAULT_DECISION.sellRange,
        buySuggest: (vision.market && vision.market.buySuggest) || DEFAULT_DECISION.buySuggest,
        profitRange: (vision.market && vision.market.profitRange) || DEFAULT_DECISION.profitRange,
      };

      return {
        visionId: vision.id,
        product: {
          brand: vision.brand,
          model: vision.model,
          capacity: vision.capacity,
          condition: vision.condition,
          color: vision.color || "",
          name: vision.name,
          category: vision.category,
          qty: vision.qty || 1,
        },
        market: {
          sellRange: base.sellRange,
          buySuggest: base.buySuggest,
          profitRange: base.profitRange,
          liquidity: base.liquidity,
          liquidityStars: stars(base.liquidity),
          liquidityLabel: base.liquidityLabel,
        },
        advice: {
          verdict: base.verdict,
          icon: base.verdictIcon,
          title: base.verdictTitle,
          desc: base.verdictDesc,
        },
        vision,
      };
    },

    /**
     * 模拟 AI 分析延迟（「AI正在分析…」）
     * @future priceAPI + marketAPI
     */
    async analyze(vision) {
      await new Promise((r) => setTimeout(r, 900));
      return {
        ok: true,
        decision: this.fromVision(vision),
        provider: "mock-trade-decision-v1",
      };
    },

    /** @future priceAPI */
    async fetchPrice(_sku) {
      return null;
    },

    /** @future marketAPI */
    async fetchMarket(_sku) {
      return null;
    },
  };
})(window);
