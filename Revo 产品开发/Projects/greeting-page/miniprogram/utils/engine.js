/**
 * V5 动态选品引擎 — 无写死机型列表，全部由规则生成
 */

const CATEGORY = {
  IPHONE_MAINSTREAM: "iphone_mainstream",
  ANDROID_MAINSTREAM: "android_mainstream",
  LEGACY: "legacy",
};

const CATEGORY_LABELS = {
  [CATEGORY.IPHONE_MAINSTREAM]: "iPhone主流",
  [CATEGORY.ANDROID_MAINSTREAM]: "安卓主流",
  [CATEGORY.LEGACY]: "老旧机型",
};

const INDUSTRY_RULES = [
  { icon: "🍎", text: "苹果 > 安卓：iPhone 系列流动性与溢价能力更强" },
  { icon: "🆕", text: "新款 > 老款：越新的机型周转越快、掉价越慢" },
  { icon: "⭐", text: "Pro > 标准版：Pro 系列利润空间和需求更稳定" },
  { icon: "💾", text: "256G 优先：大容量版本更好出手，压货风险更低" },
  { icon: "⚙️", text: "V5 动态引擎：机型由规则实时生成，未知机型自动归类评估" },
];

const ANDROID_TEMPLATES = [
  { series: "小米", brandKey: "xiaomi", generations: [12, 13, 14, 15] },
  { series: "华为 Mate", brandKey: "huawei", brand: "huawei", generations: [50, 60], genScore: [13, 14] },
  { series: "华为 P", brandKey: "huawei", brand: "huawei", generations: [50, 60], genScore: [12, 13] },
  { series: "Redmi K", brandKey: "xiaomi", generations: [60, 70, 80], genScore: [11, 12, 13] },
  { series: "OPPO Find X", brandKey: "oppo", generations: [5, 6, 7], genScore: [11, 12, 13] },
  { series: "vivo X", brandKey: "vivo", generations: [80, 90, 100], genScore: [11, 12, 13] },
  { series: "三星 S", brandKey: "samsung", generations: [22, 23, 24], genScore: [11, 12, 13] },
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function parseModelInput(raw) {
  const text = String(raw || "").trim();
  const lower = text.toLowerCase();

  const storageMatch = text.match(/(\d+)\s*g\b/i);
  const storageNum = storageMatch ? parseInt(storageMatch[1], 10) : 128;
  const storage = `${storageNum}G`;
  const storageBonus = storageNum >= 256;

  const isProMax = /pro\s*max|promax/i.test(text);
  const isPro = isProMax || /\bpro\b|ultra|plus/i.test(lower);

  let generation = 12;
  const iphoneGen = lower.match(/iphone\s*(\d{1,2})/);
  const numGen = text.match(/\b(1[0-6]|[6-9])\b/);
  if (iphoneGen) generation = parseInt(iphoneGen[1], 10);
  else if (numGen) generation = parseInt(numGen[1], 10);

  let brand = "android";
  let brandKey = "other";
  let seriesName = text;

  if (/iphone|苹果|\bapple\b/i.test(text)) {
    brand = "apple";
    brandKey = "apple";
    seriesName = `iPhone ${generation}${isProMax ? " Pro Max" : isPro ? " Pro" : ""}`;
  } else {
    for (const tpl of ANDROID_TEMPLATES) {
      const key = tpl.series.toLowerCase().replace(/\s+/g, "");
      if (lower.includes(key) || lower.includes(tpl.brandKey)) {
        brand = tpl.brand || "android";
        brandKey = tpl.brandKey;
        seriesName = tpl.series;
        const idx = tpl.generations.findIndex((g) => lower.includes(String(g)));
        if (idx >= 0 && tpl.genScore) generation = tpl.genScore[idx];
        break;
      }
    }
    if (brandKey === "xiaomi" && /红米|redmi/i.test(lower)) seriesName = "Redmi";
    if (brandKey === "huawei" && /mate/i.test(lower)) seriesName = "华为 Mate";
    if (brandKey === "oppo") seriesName = "OPPO Find";
    if (brandKey === "vivo") seriesName = "vivo";
    if (brandKey === "samsung") seriesName = "三星";
  }

  let category = CATEGORY.ANDROID_MAINSTREAM;
  if (brand === "apple") {
    category = generation >= 12 ? CATEGORY.IPHONE_MAINSTREAM : CATEGORY.LEGACY;
  } else if (generation <= 11 || brandKey === "samsung") {
    category = generation <= 11 ? CATEGORY.LEGACY : CATEGORY.ANDROID_MAINSTREAM;
  }

  return {
    text,
    brand,
    brandKey,
    seriesName,
    generation,
    isPro,
    isProMax,
    storage,
    storageBonus,
    category,
  };
}

function classifyCategory(profile) {
  if (profile.brand === "apple") {
    return profile.generation >= 12 ? CATEGORY.IPHONE_MAINSTREAM : CATEGORY.LEGACY;
  }
  if (profile.generation <= 11 || profile.brandKey === "samsung") {
    return profile.generation <= 11 ? CATEGORY.LEGACY : CATEGORY.ANDROID_MAINSTREAM;
  }
  return CATEGORY.ANDROID_MAINSTREAM;
}

function estimatePrices(profile) {
  let base;
  if (profile.brand === "apple") {
    base = 500 + profile.generation * 270;
  } else if (profile.brand === "huawei") {
    base = 450 + profile.generation * 210;
  } else {
    base = 350 + profile.generation * 125;
  }

  if (profile.isPro) base *= 1.3;
  if (profile.isProMax) base *= 1.12;
  if (profile.storageBonus) base *= 1.1;
  if (profile.category === CATEGORY.LEGACY) base *= 0.72;

  base = Math.round(base / 50) * 50;

  return {
    priceLow: Math.round(base * 0.87),
    priceMid: base,
    priceHigh: Math.round(base * 1.15),
  };
}

function estimateLiquidityDemand(profile) {
  let liquidity;
  let demand;

  if (profile.brand === "apple") {
    liquidity = 4 + (profile.generation - 10) * 1.1;
    if (!profile.isPro && profile.generation >= 13 && profile.generation <= 15) liquidity += 0.8;
    if (profile.isPro) liquidity += 0.4;
    demand = liquidity;
  } else if (profile.brand === "huawei") {
    liquidity = 4.5 + (profile.generation - 11) * 0.75;
    demand = liquidity + 0.6;
  } else {
    liquidity = 3.2 + (profile.generation - 10) * 0.7;
    demand = liquidity;
  }

  if (profile.storageBonus) {
    liquidity += 0.6;
    demand += 0.4;
  }
  if (profile.category === CATEGORY.LEGACY) {
    liquidity -= 2;
    demand -= 1.5;
  }
  if (profile.brandKey === "samsung") {
    liquidity -= 1.2;
    demand -= 0.8;
  }
  if (profile.brandKey === "oppo" || profile.brandKey === "vivo") {
    liquidity -= 0.5;
  }

  return {
    liquidity: Math.round(clamp(liquidity, 1, 10)),
    demand: Math.round(clamp(demand, 1, 10)),
  };
}

function buildDisplayName(profile) {
  if (profile.brand === "apple") {
    let name = `iPhone ${profile.generation}`;
    if (profile.isProMax) name += " Pro Max";
    else if (profile.isPro) name += " Pro";
    if (profile.storage !== "128G") name += ` ${profile.storage}`;
    return name;
  }

  const genLabel = profile.text && profile.text !== profile.seriesName
    ? profile.text
    : `${profile.seriesName} ${profile.generation}`;

  if (profile.storage !== "128G" && !/g\b/i.test(genLabel)) {
    return `${genLabel} ${profile.storage}`;
  }
  return genLabel;
}

function profileToModel(profile) {
  const category = profile.category || classifyCategory(profile);
  const full = { ...profile, category };
  const prices = estimatePrices(full);
  const { liquidity, demand } = estimateLiquidityDemand(full);
  const name = buildDisplayName(full);

  return {
    name,
    shortName: name.replace(/\s+\d+G$/, ""),
    storage: full.storage,
    storageBonus: full.storageBonus,
    brand: full.brand,
    brandKey: full.brandKey,
    generation: full.generation,
    isPro: full.isPro,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    liquidity,
    demand,
    ...prices,
  };
}

function generateIPhoneVariants() {
  const models = [];
  for (let gen = 11; gen <= 16; gen++) {
    const variants = [
      { isPro: false, isProMax: false, storage: "128G", storageBonus: false },
      { isPro: true, isProMax: false, storage: "128G", storageBonus: false },
      { isPro: true, isProMax: false, storage: "256G", storageBonus: true },
    ];
    if (gen >= 14) {
      variants.push({ isPro: true, isProMax: true, storage: "256G", storageBonus: true });
    }
    for (const v of variants) {
      const category = gen >= 12 ? CATEGORY.IPHONE_MAINSTREAM : CATEGORY.LEGACY;
      models.push(
        profileToModel({
          brand: "apple",
          brandKey: "apple",
          seriesName: "iPhone",
          generation: gen,
          category,
          ...v,
        })
      );
    }
  }
  return models;
}

function generateAndroidVariants() {
  const models = [];
  for (const tpl of ANDROID_TEMPLATES) {
    tpl.generations.forEach((g, i) => {
      const genScore = tpl.genScore ? tpl.genScore[i] : g > 20 ? 11 + i : g;
      const storages = [
        { storage: "128G", storageBonus: false },
        { storage: "256G", storageBonus: true },
      ];
      for (const s of storages) {
        const category =
          genScore <= 11 || tpl.brandKey === "samsung"
            ? genScore <= 11
              ? CATEGORY.LEGACY
              : CATEGORY.ANDROID_MAINSTREAM
            : CATEGORY.ANDROID_MAINSTREAM;

        models.push(
          profileToModel({
            brand: tpl.brand || "android",
            brandKey: tpl.brandKey,
            seriesName: tpl.series,
            generation: genScore,
            category,
            isPro: false,
            isProMax: false,
            ...s,
          })
        );
      }
    });
  }
  return models;
}

function generateAllCandidates() {
  const all = [...generateIPhoneVariants(), ...generateAndroidVariants()];
  const seen = new Set();
  return all.filter((m) => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}

function getSuggestedPrices(model) {
  return {
    suggestBuy: Math.round(model.priceLow * 0.97),
    suggestSell: Math.round(model.priceMid * 1.06),
  };
}

function getProfitPotential(model) {
  const rate = ((model.priceHigh - model.priceLow) / model.priceMid) * 100;
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

  if (model.category === CATEGORY.IPHONE_MAINSTREAM) score += 15;
  else if (model.category === CATEGORY.LEGACY) score -= 25;

  const profit = getProfitPotential(model);
  if (profit.level === "high") score += 15;
  else if (profit.level === "mid") score += 8;
  else score -= 5;

  const risk = getRiskLevel(model);
  if (risk.level === "low") score += 10;
  else if (risk.level === "high") score -= 20;

  return Math.round(score);
}

function getSelectionVerdict(model) {
  const score = scoreModel(model);
  const risk = getRiskLevel(model);
  const profit = getProfitPotential(model);

  if (risk.level === "high" || model.category === CATEGORY.LEGACY || score < 70) {
    return { label: "不推荐", level: "bad", reason: buildNotRecommendReason(model) };
  }
  if (score >= 130 && risk.level === "low" && model.category === CATEGORY.IPHONE_MAINSTREAM) {
    return {
      label: "推荐",
      level: "good",
      reason: "流动性好、利润空间充足，符合苹果优先策略",
    };
  }
  if (score >= 95 && risk.level !== "high") {
    return { label: "谨慎", level: "warn", reason: "可尝试收货，建议控制价格并缩短周转周期" };
  }
  return { label: "不推荐", level: "bad", reason: buildNotRecommendReason(model) };
}

function buildNotRecommendReason(model) {
  const reasons = [];
  if (model.liquidity <= 4) reasons.push("流动性低");
  if (model.demand <= 4) reasons.push("市场需求弱");
  if (getProfitPotential(model).level === "low") reasons.push("利润太低");
  if (model.category === CATEGORY.LEGACY) reasons.push("机型过旧");
  if (model.brand === "android" && model.liquidity <= 5) reasons.push("压货风险");
  if (model.brandKey === "samsung") reasons.push("三星渠道窄");
  return reasons.length ? reasons.join(" · ") : "综合评分偏低";
}

function resolveUnknownModel(input) {
  const profile = parseModelInput(input);
  const model = profileToModel(profile);
  const { suggestBuy, suggestSell } = getSuggestedPrices(model);
  const verdict = getSelectionVerdict(model);

  return {
    model,
    category: model.category,
    categoryLabel: model.categoryLabel,
    score: scoreModel(model),
    liquidity: model.liquidity,
    profitPotential: getProfitPotential(model),
    riskLevel: getRiskLevel(model),
    suggestBuy,
    suggestSell,
    estimatedProfit: suggestSell - suggestBuy,
    verdict,
  };
}

function enrichModel(model) {
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
}

function generateDailyRecommendations() {
  const scored = generateAllCandidates()
    .map(enrichModel)
    .sort((a, b) => b.score - a.score);

  const iphonePool = scored.filter((m) => m.category === CATEGORY.IPHONE_MAINSTREAM && m.riskLevel.level !== "high");
  const androidPool = scored.filter(
    (m) => m.category === CATEGORY.ANDROID_MAINSTREAM && m.riskLevel.level !== "high"
  );

  const picked = [];
  const seenShort = new Set();

  for (const m of iphonePool) {
    if (picked.length >= 8) break;
    const key = m.shortName;
    if (seenShort.has(key)) continue;
    seenShort.add(key);
    picked.push(m);
  }

  for (const m of androidPool) {
    if (picked.length >= 10) break;
    if (picked.length >= 5 && m.score < 90) continue;
    const key = m.shortName;
    if (seenShort.has(key)) continue;
    seenShort.add(key);
    picked.push(m);
  }

  const finalRecommended = picked.slice(0, 10);
  while (finalRecommended.length < 5 && scored.length > finalRecommended.length) {
    const next = scored.find((m) => !finalRecommended.find((r) => r.name === m.name));
    if (!next) break;
    finalRecommended.push(next);
  }

  const notRecommended = scored
    .filter((m) => !finalRecommended.find((r) => r.name === m.name))
    .filter((m) => m.score < 85 || m.riskLevel.level === "high" || m.category === CATEGORY.LEGACY)
    .slice(0, 8)
    .map((m) => ({ ...m, reason: buildNotRecommendReason(m) }));

  const topThree = finalRecommended.slice(0, 3).map((m, i) => ({
    rank: i + 1,
    rankLabel: `TOP ${i + 1}`,
    ...m,
  }));

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const categoryStats = {
    iphone: finalRecommended.filter((m) => m.category === CATEGORY.IPHONE_MAINSTREAM).length,
    android: finalRecommended.filter((m) => m.category === CATEGORY.ANDROID_MAINSTREAM).length,
    legacy: scored.filter((m) => m.category === CATEGORY.LEGACY).length,
  };

  return {
    date: dateStr,
    recommended: finalRecommended,
    notRecommended,
    topThree,
    topPick: finalRecommended[0] || null,
    rules: INDUSTRY_RULES,
    categoryStats,
    totalCandidates: scored.length,
  };
}

const api = {
  CATEGORY,
  CATEGORY_LABELS,
  INDUSTRY_RULES,
  parseModelInput,
  generateAllCandidates,
  generateDailyRecommendations,
  resolveUnknownModel,
  getSuggestedPrices,
  getProfitPotential,
  getRiskLevel,
  scoreModel,
  getSelectionVerdict,
  enrichModel,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

if (typeof window !== "undefined") {
  window.SelectionEngine = api;
}
