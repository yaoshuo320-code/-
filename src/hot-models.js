/**
 * 热门型号识别库 + 商家交易决策分析
 */
(function (global) {
  const HOT_MODELS = [
    {
      id: "iphone-15-pro-max",
      name: "iPhone 15 Pro Max",
      brand: "Apple",
      aliases: ["iphone 15 pro max", "iphone15promax", "15 pro max", "15pm"],
      liquidity: 9,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "500-800",
      buyZone: [5200, 5800],
      sellZone: [5800, 6500],
      reason: "顶配流通快，Pro Max 需求稳定，适合控价收货",
    },
    {
      id: "iphone-15-pro",
      name: "iPhone 15 Pro",
      brand: "Apple",
      aliases: ["iphone 15 pro", "iphone15pro", "15 pro", "苹果15 pro"],
      liquidity: 9,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "400-650",
      buyZone: [4200, 4800],
      sellZone: [4800, 5400],
      reason: "主流 Pro 款，流动性强，今日优先收货",
    },
    {
      id: "iphone-15",
      name: "iPhone 15",
      brand: "Apple",
      aliases: ["iphone 15", "iphone15", "苹果15"],
      liquidity: 9,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "300-500",
      buyZone: [3200, 3700],
      sellZone: [3700, 4200],
      reason: "标准版走量快，适合日常收货",
    },
    {
      id: "iphone-14-pro",
      name: "iPhone 14 Pro",
      brand: "Apple",
      aliases: ["iphone 14 pro", "iphone14pro", "14 pro"],
      liquidity: 8,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "300-500",
      buyZone: [3500, 4000],
      sellZone: [4000, 4500],
      reason: "价格回落后性价比好，出货稳定",
    },
    {
      id: "iphone-14",
      name: "iPhone 14",
      brand: "Apple",
      aliases: ["iphone 14", "iphone14", "苹果14"],
      liquidity: 8,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "250-400",
      buyZone: [2600, 3100],
      sellZone: [3100, 3600],
      reason: "入门苹果走量款，适合快收快出",
    },
    {
      id: "iphone-13",
      name: "iPhone 13",
      brand: "Apple",
      aliases: ["iphone 13", "iphone13", "苹果13"],
      liquidity: 8,
      risk: { label: "低", level: "low" },
      recommend: { label: "推荐", level: "good" },
      profit: "200-350",
      buyZone: [2000, 2400],
      sellZone: [2400, 2800],
      reason: "经典走量机型，利润薄但好出手",
    },
    {
      id: "kindle-paperwhite",
      name: "Kindle Paperwhite",
      brand: "Kindle",
      aliases: ["paperwhite", "kindle paperwhite", "kpw", "kindle pw"],
      liquidity: 7,
      risk: { label: "中", level: "mid" },
      recommend: { label: "谨慎", level: "warn" },
      profit: "80-150",
      buyZone: [650, 780],
      sellZone: [780, 900],
      reason: "走量尚可，注意成交周期，控价收货",
    },
    {
      id: "kindle-oasis",
      name: "Kindle Oasis",
      brand: "Kindle",
      aliases: ["oasis", "kindle oasis", "ko"],
      liquidity: 6,
      risk: { label: "中", level: "mid" },
      recommend: { label: "谨慎", level: "warn" },
      profit: "100-200",
      buyZone: [900, 1100],
      sellZone: [1100, 1300],
      reason: "高端 Kindle，受众窄，不宜压货",
    },
    {
      id: "huawei-mate",
      name: "华为 Mate 系列",
      brand: "华为",
      aliases: ["mate", "华为 mate", "mate60", "mate 60", "mate50", "mate 50"],
      liquidity: 7,
      risk: { label: "中", level: "mid" },
      recommend: { label: "谨慎", level: "warn" },
      profit: "200-400",
      buyZone: [2800, 3500],
      sellZone: [3200, 4000],
      reason: "华为高端有需求，但渠道波动，需盯价",
    },
    {
      id: "huawei-p",
      name: "华为 P 系列",
      brand: "华为",
      aliases: ["华为 p", "huawei p", "p60", "p 60", "p50", "p 50"],
      liquidity: 7,
      risk: { label: "中", level: "mid" },
      recommend: { label: "谨慎", level: "warn" },
      profit: "180-350",
      buyZone: [2200, 2800],
      sellZone: [2600, 3200],
      reason: "影像旗舰有客群，注意版本与渠道差异",
    },
  ];

  const AVOID_MODELS = [
    { name: "老安卓（3年以上）", risk: "高", reason: "流动性低，压货风险大，周转慢" },
    { name: "碎屏 / 大修机", risk: "高", reason: "出手难，售后纠纷多，残值难估" },
    { name: "无面容 / 无指纹", risk: "高", reason: "残值低，难定价，买家挑剔" },
    { name: "韩版 / 美版有锁", risk: "高", reason: "渠道窄，容易被压价" },
    { name: "老旧 Kindle（10代以前）", risk: "中", reason: "需求少，周转慢，利润薄" },
    { name: "电池健康低于 80%", risk: "中", reason: "影响出货价，容易引发退货" },
  ];

  const CONDITION_MAP = {
    "充新": { factor: 1.05, riskAdj: -1, label: "充新" },
    "99新": { factor: 1.02, riskAdj: 0, label: "99新" },
    "95新": { factor: 1.0, riskAdj: 0, label: "95新" },
    "9新": { factor: 0.92, riskAdj: 1, label: "9新" },
    "大花": { factor: 0.8, riskAdj: 2, label: "大花/明显磨损" },
    "功能异常": { factor: 0.65, riskAdj: 3, label: "功能异常" },
  };

  function normalize(q) {
    return String(q || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function findHotModel(query) {
    const q = normalize(query);
    if (!q) return null;
    let best = null;
    let bestScore = 0;
    for (const m of HOT_MODELS) {
      const names = [m.name, ...m.aliases].map(normalize);
      for (const n of names) {
        if (q === n || q.includes(n) || n.includes(q)) {
          const score = n.length + (q === n ? 100 : 0);
          if (score > bestScore) {
            bestScore = score;
            best = m;
          }
        }
      }
    }
    return best;
  }

  function buildRecommendReasons(m) {
    const [buyLow, buyHigh] = m.buyZone;
    const [sellLow, sellHigh] = m.sellZone;
    const liquidityReason = m.liquidity >= 9
      ? "询价活跃、成交快，适合当日收货当日挂出"
      : m.liquidity >= 7
        ? "市场需求稳定，正常周转约 3-5 天"
        : "受众偏窄，需预留更长成交周期";

    const marketReason = `建议收货 ¥${buyLow}-${buyHigh}，出货 ¥${sellLow}-${sellHigh}，当前处于${m.liquidity >= 8 ? "偏热" : "正常"}流通区间`;

    const riskReminder = m.risk.level === "low"
      ? "整体风险较低，注意核验收货成色与电池健康"
      : m.risk.level === "mid"
        ? "渠道与版本差异可能影响出货价，收货前确认货源"
        : "残值波动大，仅建议在低价区快进快出";

    return {
      whyRecommend: m.reason,
      liquidityReason,
      marketReason,
      riskReminder,
    };
  }

  function toListItem(m) {
    const reasons = buildRecommendReasons(m);
    return {
      id: m.id,
      name: m.name,
      profit: m.profit,
      risk: m.risk.label,
      riskLevel: m.risk.level,
      liquidity: m.liquidity,
      verdictLabel: m.recommend.label,
      verdictLevel: m.recommend.level,
      reason: m.reason,
      reasons,
      _hot: m,
      _recognized: true,
    };
  }

  function toListItemFromSearch(name, opts = {}) {
    return {
      id: modelKeyFromName(name),
      name,
      profit: opts.profit || "—",
      risk: opts.risk || "中",
      riskLevel: "mid",
      liquidity: opts.liquidity || 5,
      verdictLabel: opts.verdictLabel || "谨慎",
      verdictLevel: opts.verdictLevel || "warn",
      reason: opts.reason || "未在热门库中，建议核价后操作",
      reasons: {
        whyRecommend: opts.reason || "未收录机型，需结合本地市场判断",
        liquidityReason: "缺乏历史成交数据，建议参考同行报价",
        marketReason: "暂无系统市场区间，请手动核价",
        riskReminder: "未知机型风险偏高，谨慎收货",
      },
      _recognized: false,
    };
  }

  function modelKeyFromName(name) {
    return String(name || "").toLowerCase().replace(/\s+/g, "-");
  }

  function getTop3Opportunities() {
    return HOT_MODELS
      .filter((m) => m.recommend.level === "good")
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 3)
      .map(toListItem);
  }

  function parseProfitRange(profitStr) {
    const parts = String(profitStr).split("-").map(Number);
    return { low: parts[0] || 0, high: parts[1] || parts[0] || 0 };
  }

  function adjustProfit(profitStr, factor) {
    const { low, high } = parseProfitRange(profitStr);
    return `${Math.round(low * factor)}-${Math.round(high * factor)}`;
  }

  function riskLabelFromLevel(level) {
    if (level <= 0) return { label: "低", level: "low" };
    if (level <= 1) return { label: "中", level: "mid" };
    return { label: "高", level: "high" };
  }

  function analyzeBuyDetailed(model, price, condition) {
    const p = Number(price);
    if (!p || p <= 0) {
      return { ok: false, message: "请输入有效收货价" };
    }
    const cond = CONDITION_MAP[condition] || CONDITION_MAP["95新"];
    const [low, high] = model.buyZone;
    const profit = adjustProfit(model.profit, cond.factor);
    const baseRisk = model.risk.level === "low" ? 0 : model.risk.level === "mid" ? 1 : 2;
    const risk = riskLabelFromLevel(baseRisk + cond.riskAdj);
    const riskDisplay = risk.label;

    let verdict, level, message;
    if (cond.factor <= 0.8) {
      verdict = "不建议收货";
      level = "bad";
      message = `成色「${cond.label}」残值影响大，即使价格合适也难出手`;
    } else if (p <= low) {
      verdict = "推荐收货";
      level = "good";
      message = `报价 ¥${p} 低于建议收货区（¥${low}-${high}），${cond.label} 成色利润空间可观`;
    } else if (p <= high) {
      verdict = cond.factor >= 1 ? "可以收货" : "谨慎收货";
      level = cond.factor >= 1 ? "good" : "warn";
      message = `报价 ¥${p} 在建议区内，${cond.label} 成色需控周转周期`;
    } else {
      verdict = "不建议收货";
      level = "bad";
      message = `报价 ¥${p} 高于建议区（¥${low}-${high}），利润空间不足`;
    }

    return {
      ok: true,
      verdict,
      level,
      message,
      profit,
      risk: riskDisplay,
      riskLevel: level === "good" ? "good" : level === "bad" ? "bad" : "warn",
      reason: `${model.reason}（成色：${cond.label}）`,
      model: model.name,
    };
  }

  function analyzeSellDetailed(model, currentPrice) {
    const p = Number(currentPrice);
    const [low, high] = model.sellZone;
    const mid = Math.round((low + high) / 2);

    if (!p || p <= 0) {
      return {
        ok: true,
        verdict: model.recommend.label === "推荐" ? "建议尽快出货" : "谨慎出货",
        level: model.recommend.level,
        shouldCutPrice: false,
        cutAdvice: "—",
        message: `建议出货价 ¥${low}-${high}。${model.reason}`,
        sellZone: model.sellZone,
        model: model.name,
      };
    }

    let shouldCutPrice = false;
    let cutAdvice = "当前定价合理";
    let verdict, level, message;

    if (p > high) {
      shouldCutPrice = true;
      cutAdvice = `建议降至 ¥${mid}-${high}，当前偏高约 ¥${p - high}`;
      verdict = "建议降价出货";
      level = "warn";
      message = `挂价 ¥${p} 高于市场高位（¥${high}），周转可能偏慢，适当让利可加快出手`;
    } else if (p >= low) {
      shouldCutPrice = false;
      cutAdvice = "价格处于合理区间，可维持或小幅议价";
      verdict = "定价合理，建议出货";
      level = "good";
      message = `挂价 ¥${p} 在市场区间内（¥${low}-${high}），${model.liquidity >= 8 ? "流动性好，可积极出货" : "注意成交周期"}`;
    } else {
      shouldCutPrice = false;
      cutAdvice = "已低于市场低位，不建议继续降价";
      verdict = "价格有竞争力";
      level = "good";
      message = `挂价 ¥${p} 低于建议低位 ¥${low}，有价格优势，可优先推广`;
    }

    return {
      ok: true,
      verdict,
      level,
      shouldCutPrice,
      cutAdvice,
      message,
      sellZone: model.sellZone,
      model: model.name,
    };
  }

  function analyzeBuy(model, price) {
    return analyzeBuyDetailed(model, price, "95新");
  }

  function analyzeSell(model) {
    return analyzeSellDetailed(model, null);
  }

  global.HotModelCatalog = {
    HOT_MODELS,
    AVOID_MODELS,
    CONDITION_MAP,
    findHotModel,
    toListItem,
    toListItemFromSearch,
    buildRecommendReasons,
    modelKeyFromName,
    getTop3Opportunities,
    analyzeBuy,
    analyzeSell,
    analyzeBuyDetailed,
    analyzeSellDetailed,
  };
})(typeof window !== "undefined" ? window : globalThis);
