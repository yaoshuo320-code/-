/**
 * V5+ 统一选品引擎 — 多品类扩展（手机 / 电子书 / 未来可增平板、耳机）
 * V8：市场区间感知选品决策
 */
(function (global) {
  const PRODUCT_TYPE = {
    PHONE: "phone",
    EREADER: "ereader",
  };

  const SEGMENT = {
    IPHONE_MAINSTREAM: "iphone_mainstream",
    ANDROID_MAINSTREAM: "android_mainstream",
    LEGACY: "legacy",
    EREADER_KINDLE: "ereader_kindle",
    EREADER_KOBO: "ereader_kobo",
    EREADER_OTHER: "ereader_other",
    EREADER_LEGACY: "ereader_legacy",
  };

  const SEGMENT_LABELS = {
    [SEGMENT.IPHONE_MAINSTREAM]: "iPhone主流",
    [SEGMENT.ANDROID_MAINSTREAM]: "安卓主流",
    [SEGMENT.LEGACY]: "老旧机型",
    [SEGMENT.EREADER_KINDLE]: "Kindle主流",
    [SEGMENT.EREADER_KOBO]: "Kobo主流",
    [SEGMENT.EREADER_OTHER]: "其他电子书",
    [SEGMENT.EREADER_LEGACY]: "老旧电子书",
  };

  const PHONE_ANDROID_TEMPLATES = [
    { series: "小米", brandKey: "xiaomi", generations: [12, 13, 14, 15] },
    { series: "华为 Mate", brandKey: "huawei", brand: "huawei", generations: [50, 60], genScore: [13, 14] },
    { series: "华为 P", brandKey: "huawei", brand: "huawei", generations: [50, 60], genScore: [12, 13] },
    { series: "Redmi K", brandKey: "xiaomi", generations: [60, 70, 80], genScore: [11, 12, 13] },
    { series: "OPPO Find X", brandKey: "oppo", generations: [5, 6, 7], genScore: [11, 12, 13] },
    { series: "vivo X", brandKey: "vivo", generations: [80, 90, 100], genScore: [11, 12, 13] },
    { series: "三星 S", brandKey: "samsung", generations: [22, 23, 24], genScore: [11, 12, 13] },
  ];

  const EREADER_TEMPLATES = [
    { brandKey: "kindle", series: "Kindle Paperwhite", generations: [5, 6, 11, 12], genScore: [10, 11, 12, 13], tier: "mainstream" },
    { brandKey: "kindle", series: "Kindle Oasis", generations: [3, 4, 10, 11], genScore: [10, 11, 12, 13], tier: "premium" },
    { brandKey: "kindle", series: "Kindle", generations: [10, 11], genScore: [10, 11], tier: "entry" },
    { brandKey: "kindle", series: "Kindle Scribe", generations: [1, 2], genScore: [12, 13], tier: "premium" },
    { brandKey: "kobo", series: "Kobo Clara", generations: [2, 3], genScore: [11, 12], tier: "mainstream" },
    { brandKey: "kobo", series: "Kobo Libra", generations: [2, 3], genScore: [11, 12], tier: "mainstream" },
    { brandKey: "kobo", series: "Kobo Elipsa", generations: [2], genScore: [12], tier: "premium" },
    { brandKey: "kobo", series: "Kobo Sage", generations: [1], genScore: [12], tier: "premium" },
  ];

  const PRODUCT_REGISTRY = {
    [PRODUCT_TYPE.PHONE]: {
      id: PRODUCT_TYPE.PHONE,
      label: "手机",
      icon: "📱",
      queryPlaceholder: "输入任意机型，如 iPhone 16 Pro、小米 15",
      recommendTitle: "今日推荐收货机型",
      badTitle: "不推荐机型",
      refreshSuffix: "苹果优先",
      rules: [
        { icon: "🍎", text: "苹果 > 安卓：iPhone 系列流动性与溢价能力更强" },
        { icon: "🆕", text: "新款 > 老款：越新的机型周转越快、掉价越慢" },
        { icon: "⭐", text: "Pro > 标准版：Pro 系列利润空间和需求更稳定" },
        { icon: "💾", text: "256G 优先：大容量版本更好出手，压货风险更低" },
        { icon: "⚙️", text: "统一选品引擎：规则实时生成候选，自动评分排序" },
      ],
      baseParams: { cycleLabel: "正常" },
      parseInput: parsePhoneInput,
      generateCandidates: generatePhoneCandidates,
      pickRecommendations: pickPhoneRecommendations,
      getCategoryStats: getPhoneCategoryStats,
    },
    [PRODUCT_TYPE.EREADER]: {
      id: PRODUCT_TYPE.EREADER,
      label: "电子书",
      icon: "📖",
      queryPlaceholder: "输入任意型号，如 Kindle Paperwhite 5、Kobo Clara 3",
      recommendTitle: "今日推荐收货型号",
      badTitle: "不推荐型号",
      refreshSuffix: "Kindle 优先",
      rules: [
        { icon: "📖", text: "Kindle > Kobo：Kindle 流通更广、出手更快" },
        { icon: "🆕", text: "新款 > 老款：Paperwhite / Clara 新款更好卖" },
        { icon: "💰", text: "利润空间中低：单台利润有限，靠走量" },
        { icon: "⏳", text: "成交周期较长：需预留周转时间，避免压货" },
        { icon: "⚙️", text: "统一选品引擎：与手机共用流动性 · 利润 · 风险评分体系" },
      ],
      baseParams: {
        liquidityBase: 5.5,
        profitLevel: "中低",
        cycleLabel: "较长",
        riskLevel: "中",
      },
      parseInput: parseEreaderInput,
      generateCandidates: generateEreaderCandidates,
      pickRecommendations: pickEreaderRecommendations,
      getCategoryStats: getEreaderCategoryStats,
    },
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function getProductConfig(productType) {
    return PRODUCT_REGISTRY[productType] || PRODUCT_REGISTRY[PRODUCT_TYPE.PHONE];
  }

  function parsePhoneInput(raw) {
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
      for (const tpl of PHONE_ANDROID_TEMPLATES) {
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
    }

    let segment = SEGMENT.ANDROID_MAINSTREAM;
    if (brand === "apple") segment = generation >= 12 ? SEGMENT.IPHONE_MAINSTREAM : SEGMENT.LEGACY;
    else if (generation <= 11) segment = SEGMENT.LEGACY;

    return {
      productType: PRODUCT_TYPE.PHONE,
      text, brand, brandKey, seriesName, generation, isPro, isProMax,
      storage, storageBonus, segment, tier: isPro ? "premium" : "mainstream",
    };
  }

  function parseEreaderInput(raw) {
    const text = String(raw || "").trim();
    const lower = text.toLowerCase();

    let brandKey = "other";
    let seriesName = text;
    let generation = 11;
    let tier = "mainstream";

    if (/kindle|亚马逊|amazon/i.test(lower)) brandKey = "kindle";
    else if (/kobo|掌阅/i.test(lower)) brandKey = "kobo";

    for (const tpl of EREADER_TEMPLATES) {
      const key = tpl.series.toLowerCase().replace(/\s+/g, "");
      if (lower.includes(key) || (brandKey === tpl.brandKey && lower.includes(tpl.brandKey))) {
        brandKey = tpl.brandKey;
        seriesName = tpl.series;
        tier = tpl.tier;
        const idx = tpl.generations.findIndex((g) => lower.includes(String(g)));
        if (idx >= 0) generation = tpl.genScore[idx];
        break;
      }
    }

    const numGen = text.match(/\b(\d{1,2})\b/);
    if (numGen && generation === 11) generation = parseInt(numGen[1], 10);

    if (/oasis|scribe|libra|elipsa|sage/i.test(lower)) tier = "premium";
    if (/paperwhite|clara/i.test(lower)) tier = "mainstream";

    let segment = SEGMENT.EREADER_OTHER;
    if (brandKey === "kindle") segment = generation >= 11 ? SEGMENT.EREADER_KINDLE : SEGMENT.EREADER_LEGACY;
    else if (brandKey === "kobo") segment = generation >= 11 ? SEGMENT.EREADER_KOBO : SEGMENT.EREADER_LEGACY;

    return {
      productType: PRODUCT_TYPE.EREADER,
      text, brand: brandKey, brandKey, seriesName, generation,
      isPro: tier === "premium", isProMax: false,
      storage: "—", storageBonus: false, segment, tier,
    };
  }

  function parseModelInput(raw, productType) {
    const config = getProductConfig(productType);
    return config.parseInput(raw);
  }

  function classifySegment(profile) {
    if (profile.productType === PRODUCT_TYPE.EREADER) {
      if (profile.brandKey === "kindle") return profile.generation >= 11 ? SEGMENT.EREADER_KINDLE : SEGMENT.EREADER_LEGACY;
      if (profile.brandKey === "kobo") return profile.generation >= 11 ? SEGMENT.EREADER_KOBO : SEGMENT.EREADER_LEGACY;
      return SEGMENT.EREADER_OTHER;
    }
    if (profile.brand === "apple") return profile.generation >= 12 ? SEGMENT.IPHONE_MAINSTREAM : SEGMENT.LEGACY;
    if (profile.generation <= 11) return SEGMENT.LEGACY;
    return SEGMENT.ANDROID_MAINSTREAM;
  }

  function estimatePrices(profile) {
    let base;
    const spreadLow = 0.87;
    const spreadHigh = 1.15;

    if (profile.productType === PRODUCT_TYPE.EREADER) {
      base = 280 + profile.generation * 55;
      if (profile.brandKey === "kindle") base += 80;
      if (profile.tier === "premium") base *= 1.35;
      if (profile.segment === SEGMENT.EREADER_LEGACY) base *= 0.7;
      base = Math.round(base / 10) * 10;
      return {
        priceLow: Math.round(base * 0.93),
        priceMid: base,
        priceHigh: Math.round(base * 1.07),
      };
    }

    if (profile.brand === "apple") base = 500 + profile.generation * 270;
    else if (profile.brand === "huawei") base = 450 + profile.generation * 210;
    else base = 350 + profile.generation * 125;

    if (profile.isPro) base *= 1.3;
    if (profile.isProMax) base *= 1.12;
    if (profile.storageBonus) base *= 1.1;
    if (profile.segment === SEGMENT.LEGACY) base *= 0.72;

    base = Math.round(base / 50) * 50;
    return {
      priceLow: Math.round(base * spreadLow),
      priceMid: base,
      priceHigh: Math.round(base * spreadHigh),
    };
  }

  function estimateLiquidityDemand(profile) {
    let liquidity;
    let demand;

    if (profile.productType === PRODUCT_TYPE.EREADER) {
      const cfg = PRODUCT_REGISTRY[PRODUCT_TYPE.EREADER].baseParams;
      liquidity = cfg.liquidityBase + (profile.generation - 11) * 0.35;
      if (profile.brandKey === "kindle") liquidity += 0.7;
      else if (profile.brandKey === "kobo") liquidity += 0.2;
      else liquidity -= 0.5;
      if (profile.tier === "premium") liquidity -= 0.3;
      if (profile.segment === SEGMENT.EREADER_LEGACY) { liquidity -= 1.5; }
      demand = liquidity - 0.4;
    } else if (profile.brand === "apple") {
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

    if (profile.productType === PRODUCT_TYPE.PHONE) {
      if (profile.storageBonus) { liquidity += 0.6; demand += 0.4; }
      if (profile.segment === SEGMENT.LEGACY) { liquidity -= 2; demand -= 1.5; }
      if (profile.brandKey === "samsung") { liquidity -= 1.2; demand -= 0.8; }
      if (profile.brandKey === "oppo" || profile.brandKey === "vivo") liquidity -= 0.5;
    }

    return {
      liquidity: Math.round(clamp(liquidity, 1, 10)),
      demand: Math.round(clamp(demand, 1, 10)),
    };
  }

  function buildDisplayName(profile) {
    if (profile.productType === PRODUCT_TYPE.EREADER) {
      if (profile.text && profile.text.length > 3 && profile.text !== profile.seriesName) {
        return profile.text;
      }
      return `${profile.seriesName} ${profile.generation}`;
    }
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
    if (profile.storage !== "128G" && !/g\b/i.test(genLabel)) return `${genLabel} ${profile.storage}`;
    return genLabel;
  }

  function profileToModel(profile) {
    const segment = profile.segment || classifySegment(profile);
    const full = { ...profile, segment };
    const prices = estimatePrices(full);
    const { liquidity, demand } = estimateLiquidityDemand(full);
    const name = buildDisplayName(full);
    const config = getProductConfig(full.productType);

    return {
      name,
      shortName: name.replace(/\s+\d+G$/, ""),
      productType: full.productType,
      storage: full.storage,
      storageBonus: full.storageBonus,
      brand: full.brand,
      brandKey: full.brandKey,
      generation: full.generation,
      isPro: full.isPro,
      tier: full.tier,
      segment,
      category: segment,
      categoryLabel: SEGMENT_LABELS[segment],
      cycleLabel: config.baseParams.cycleLabel,
      liquidity,
      demand,
      ...prices,
    };
  }

  function generatePhoneCandidates() {
    const models = [];
    for (let gen = 11; gen <= 16; gen++) {
      const variants = [
        { isPro: false, isProMax: false, storage: "128G", storageBonus: false },
        { isPro: true, isProMax: false, storage: "128G", storageBonus: false },
        { isPro: true, isProMax: false, storage: "256G", storageBonus: true },
      ];
      if (gen >= 14) variants.push({ isPro: true, isProMax: true, storage: "256G", storageBonus: true });
      for (const v of variants) {
        models.push(profileToModel({
          productType: PRODUCT_TYPE.PHONE,
          brand: "apple", brandKey: "apple", seriesName: "iPhone", generation: gen,
          segment: gen >= 12 ? SEGMENT.IPHONE_MAINSTREAM : SEGMENT.LEGACY, tier: v.isPro ? "premium" : "mainstream", ...v,
        }));
      }
    }
    for (const tpl of PHONE_ANDROID_TEMPLATES) {
      tpl.generations.forEach((g, i) => {
        const genScore = tpl.genScore ? tpl.genScore[i] : g;
        for (const s of [{ storage: "128G", storageBonus: false }, { storage: "256G", storageBonus: true }]) {
          models.push(profileToModel({
            productType: PRODUCT_TYPE.PHONE,
            brand: tpl.brand || "android", brandKey: tpl.brandKey, seriesName: tpl.series,
            generation: genScore,
            segment: genScore <= 11 ? SEGMENT.LEGACY : SEGMENT.ANDROID_MAINSTREAM,
            isPro: false, isProMax: false, tier: "mainstream", ...s,
          }));
        }
      });
    }
    return dedupeByName(models);
  }

  function generateEreaderCandidates() {
    const models = [];
    for (const tpl of EREADER_TEMPLATES) {
      tpl.generations.forEach((g, i) => {
        const genScore = tpl.genScore[i];
        let segment = SEGMENT.EREADER_OTHER;
        if (tpl.brandKey === "kindle") segment = genScore >= 11 ? SEGMENT.EREADER_KINDLE : SEGMENT.EREADER_LEGACY;
        else if (tpl.brandKey === "kobo") segment = genScore >= 11 ? SEGMENT.EREADER_KOBO : SEGMENT.EREADER_LEGACY;

        models.push(profileToModel({
          productType: PRODUCT_TYPE.EREADER,
          brand: tpl.brandKey, brandKey: tpl.brandKey, seriesName: tpl.series,
          generation: genScore, segment, tier: tpl.tier,
          isPro: tpl.tier === "premium", isProMax: false,
          storage: "—", storageBonus: false,
        }));
      });
    }
    return dedupeByName(models);
  }

  function generatePhoneCandidatesWrapper() {
    return generatePhoneCandidates();
  }

  function dedupeByName(models) {
    const seen = new Set();
    return models.filter((m) => {
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });
  }

  function getMerchantHint(model) {
    const risk = getRiskLevel(model);
    const score = scoreModel(model);
    const liquidity = model.liquidity;

    if (risk.level === "high" || liquidity <= 4) {
      return {
        label: "高风险避免",
        level: "danger",
        icon: "🚫",
        desc: "流动性弱或风险偏高，今日不建议收货",
      };
    }
    if (liquidity >= 8 && risk.level === "low" && score >= 115) {
      return {
        label: "快进快出",
        level: "fast",
        icon: "⚡",
        desc: "热门好流通，建议低价快收、尽快出货",
      };
    }
    return {
      label: "谨慎压货",
      level: "caution",
      icon: "⚠️",
      desc: "利润尚可但需控价，避免囤货过久",
    };
  }

  function getMarketConfig() {
    const g = typeof global !== "undefined" ? global : {};
    return g.MarketDataConfig || { overrides: {}, userPrices: {} };
  }

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function getTodaySeed() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function findMarketOverride(model) {
    const cfg = getMarketConfig();
    const overrides = cfg.overrides || {};
    if (overrides[model.name]) return overrides[model.name];
    const key = Object.keys(overrides).find(
      (k) => model.name.includes(k) || k.includes(model.shortName) || model.shortName.includes(k)
    );
    return key ? overrides[key] : null;
  }

  function zoneFromPair(pair) {
    return { min: pair[0], max: pair[1] };
  }

  /** 由估算价或手动配置构建三档市场区间 */
  function buildMarketZones(model) {
    const override = findMarketOverride(model);
    if (override && override.low && override.mid && override.high) {
      return {
        low: zoneFromPair(override.low),
        mid: zoneFromPair(override.mid),
        high: zoneFromPair(override.high),
        source: "manual",
      };
    }

    const low = model.priceLow;
    const mid = model.priceMid;
    const high = model.priceHigh;
    const span = high - low;

    return {
      low: { min: low, max: Math.round(low + span * 0.28) },
      mid: { min: Math.round(low + span * 0.28), max: Math.round(low + span * 0.62) },
      high: { min: Math.round(low + span * 0.62), max: high },
      source: "simulated",
    };
  }

  /** 模拟当日市场价（无爬虫；可手动覆盖 currentPrice） */
  function simulateCurrentMarketPrice(model, zones) {
    const override = findMarketOverride(model);
    if (override && override.currentPrice != null) return override.currentPrice;

    const cfg = getMarketConfig();
    const userPrice = cfg.userPrices && (cfg.userPrices[model.name] ?? cfg.userPrices[model.shortName]);
    if (userPrice != null) return userPrice;

    const seed = hashString(`${getTodaySeed()}|${model.name}`);
    const t = (seed % 100) / 100;
    const bias = (model.liquidity - 5) * 0.04;
    const ratio = clamp(0.15 + t * 0.7 + bias, 0.08, 0.92);
    return Math.round(zones.low.min + ratio * (zones.high.max - zones.low.min));
  }

  /** 判断价格落在哪个市场区间 */
  function resolveMarketPosition(price, zones) {
    const p = Number(price);
    if (p < zones.low.min) {
      return {
        zone: "below_low",
        label: "低于低价区",
        shortLabel: "低估",
        color: "good",
        isUndervalued: true,
        isOverpriced: false,
      };
    }
    if (p <= zones.low.max) {
      return {
        zone: "low",
        label: "低价区",
        shortLabel: "低价",
        color: "good",
        isUndervalued: false,
        isOverpriced: false,
      };
    }
    if (p <= zones.mid.max) {
      return {
        zone: "mid",
        label: "中价区",
        shortLabel: "中价",
        color: "warn",
        isUndervalued: false,
        isOverpriced: false,
      };
    }
    if (p <= zones.high.max) {
      return {
        zone: "high",
        label: "高价区",
        shortLabel: "高价",
        color: "bad",
        isUndervalued: false,
        isOverpriced: false,
      };
    }
    return {
      zone: "above_high",
      label: "高于高价区",
      shortLabel: "高估",
      color: "bad",
      isUndervalued: false,
      isOverpriced: true,
    };
  }

  /** 价格合理性判断：用户输入价 or 模拟市场价 */
  function judgePriceReasonableness(price, zones) {
    const pos = resolveMarketPosition(price, zones);

    if (pos.isUndervalued || pos.zone === "below_low") {
      return {
        verdict: "recommend_buy",
        label: "推荐收货",
        level: "good",
        reason: "价格低于市场低价区，存在套利空间",
        position: pos,
      };
    }
    if (pos.zone === "low") {
      return {
        verdict: "good_buy",
        label: "适合收货",
        level: "good",
        reason: "处于低价区，收货性价比尚可",
        position: pos,
      };
    }
    if (pos.zone === "mid") {
      return {
        verdict: "fair",
        label: "谨慎收货",
        level: "warn",
        reason: "中价区成交，需严格控价",
        position: pos,
      };
    }
    if (pos.zone === "high") {
      return {
        verdict: "caution",
        label: "不建议收货",
        level: "warn",
        reason: "高价区收货，利润空间有限",
        position: pos,
      };
    }
    return {
      verdict: "avoid",
      label: "不建议收货",
      level: "bad",
      reason: "价格高于市场高价区，收货风险大",
      position: pos,
    };
  }

  /** 结合市场位置与机型基本面的收货适合度 */
  function getReceiveSuitability(model) {
    const pos = model.marketPosition;
    const score = model.score;
    const risk = model.riskLevel;

    if (risk.level === "high") {
      return { suitable: false, label: "不建议收货", level: "bad", reason: "风险偏高，即使低价也需谨慎" };
    }

    if (pos.isUndervalued || pos.zone === "below_low" || pos.zone === "low") {
      if (score >= 80) {
        return {
          suitable: true,
          label: "适合收货",
          level: "good",
          reason: pos.isUndervalued ? "市场低估，机型基本面良好" : "低价区 + 流动性尚可",
        };
      }
      return { suitable: "caution", label: "谨慎收货", level: "warn", reason: "价格合适但机型评分一般" };
    }

    if (pos.zone === "mid") {
      if (score >= 115 && risk.level === "low") {
        return { suitable: true, label: "可做", level: "good", reason: "中价区但热门好流通" };
      }
      return { suitable: "caution", label: "谨慎收货", level: "warn", reason: "中价区需控价，避免压货" };
    }

    if (pos.zone === "high" || pos.isOverpriced || pos.zone === "above_high") {
      return { suitable: false, label: "不建议收货", level: "bad", reason: "当前市场价偏高，利润空间不足" };
    }

    return { suitable: "caution", label: "谨慎", level: "warn", reason: "建议观望或等待低价区" };
  }

  function attachMarketContext(model) {
    const marketZones = buildMarketZones(model);
    const currentMarketPrice = simulateCurrentMarketPrice(model, marketZones);
    const marketPosition = resolveMarketPosition(currentMarketPrice, marketZones);
    const priceJudgment = judgePriceReasonableness(currentMarketPrice, marketZones);
    const receiveSuitability = getReceiveSuitability({
      ...model,
      marketZones,
      currentMarketPrice,
      marketPosition,
      priceJudgment,
    });

    return {
      marketZones,
      marketZoneSource: marketZones.source,
      currentMarketPrice,
      marketPosition,
      priceJudgment,
      receiveSuitability,
      isUndervalued: marketPosition.isUndervalued || marketPosition.zone === "low",
    };
  }

  function getPriceRanges(model) {
    const zones = model.marketZones || buildMarketZones(model);
    const buyLow = zones.low.min;
    const buyHigh = zones.low.max;
    const sellLow = zones.mid.min;
    const sellHigh = zones.high.max;
    const profitLow = sellLow - buyHigh;
    const profitHigh = sellHigh - buyLow;
    return {
      buyRange: { low: buyLow, high: buyHigh },
      sellRange: { low: sellLow, high: sellHigh },
      profitRange: { low: Math.max(profitLow, 0), high: Math.max(profitHigh, 0) },
    };
  }

  function getSuggestedPrices(model) {
    const zones = model.marketZones || buildMarketZones(model);
    return {
      suggestBuy: Math.round((zones.low.min + zones.low.max) / 2),
      suggestSell: Math.round((zones.mid.max + zones.high.min) / 2),
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

    if (model.productType === PRODUCT_TYPE.PHONE) {
      if (model.brand === "apple") score += 28;
      else if (model.brand === "huawei") score += 8;
      else score -= 8;
      if (model.isPro) score += 18;
      if (model.storageBonus) score += 12;
      if (model.segment === SEGMENT.IPHONE_MAINSTREAM) score += 15;
      else if (model.segment === SEGMENT.LEGACY) score -= 25;
    } else if (model.productType === PRODUCT_TYPE.EREADER) {
      if (model.brandKey === "kindle") score += 12;
      else if (model.brandKey === "kobo") score += 4;
      else score -= 6;
      if (model.segment === SEGMENT.EREADER_KINDLE) score += 8;
      else if (model.segment === SEGMENT.EREADER_LEGACY) score -= 20;
      if (model.tier === "premium") score += 4;
    }

    score += model.generation * 2.5;

    const profit = getProfitPotential(model);
    if (profit.level === "high") score += 15;
    else if (profit.level === "mid") score += 8;
    else score -= 5;

    const risk = getRiskLevel(model);
    if (risk.level === "low") score += 10;
    else if (risk.level === "high") score -= 20;

    return Math.round(score);
  }

  function buildNotRecommendReason(model) {
    const reasons = [];
    if (model.liquidity <= 4) reasons.push("流动性低");
    if (model.demand <= 4) reasons.push("市场需求弱");
    if (getProfitPotential(model).level === "low") reasons.push("利润太低");
    if (model.segment === SEGMENT.LEGACY || model.segment === SEGMENT.EREADER_LEGACY) reasons.push("型号过旧");
    if (model.productType === PRODUCT_TYPE.PHONE && model.brand === "android" && model.liquidity <= 5) reasons.push("压货风险");
    if (model.productType === PRODUCT_TYPE.EREADER && model.cycleLabel === "较长") reasons.push("成交周期较长");
    if (model.brandKey === "samsung") reasons.push("三星渠道窄");
    if (model.productType === PRODUCT_TYPE.EREADER && model.brandKey === "kobo" && model.liquidity <= 5) reasons.push("出手偏慢");
    return reasons.length ? reasons.join(" · ") : "综合评分偏低";
  }

  function getSelectionVerdict(model) {
    const score = model.score;
    const risk = model.riskLevel;
    const isLegacy = model.segment === SEGMENT.LEGACY || model.segment === SEGMENT.EREADER_LEGACY;
    const market = model.marketPosition;
    const receive = model.receiveSuitability;

    if (receive && receive.suitable === false) {
      return {
        label: "不推荐",
        level: "bad",
        reason: receive.reason || "当前市场价不适合收货",
      };
    }

    if (market && (market.isOverpriced || market.zone === "above_high")) {
      return {
        label: "不推荐",
        level: "bad",
        reason: "市场价高于高价区，不建议收货",
      };
    }

    if (risk.level === "high" || isLegacy || score < 70) {
      return { label: "不推荐", level: "bad", reason: buildNotRecommendReason(model) };
    }

    const isTopSegment =
      model.segment === SEGMENT.IPHONE_MAINSTREAM ||
      model.segment === SEGMENT.EREADER_KINDLE;

    const marketBoost = market && (market.zone === "low" || market.isUndervalued);

    if ((score >= 130 || (marketBoost && score >= 100)) && risk.level === "low" && isTopSegment) {
      const reason = marketBoost
        ? "低价区 + 流动性好，适合今日收货"
        : model.productType === PRODUCT_TYPE.EREADER
          ? "Kindle 主流型号，流动性尚可，注意成交周期"
          : "流动性好、利润空间充足，符合苹果优先策略";
      return { label: "推荐", level: "good", reason };
    }

    if (score >= 95 && risk.level !== "high" && (!market || market.zone !== "high")) {
      const reason = market && market.zone === "mid"
        ? "中价区可尝试，建议控制收价"
        : model.productType === PRODUCT_TYPE.EREADER
          ? "可尝试收货，控制收价并预留较长周转周期"
          : "可尝试收货，建议控制价格并缩短周转周期";
      return { label: "谨慎", level: "warn", reason };
    }

    return { label: "不推荐", level: "bad", reason: buildNotRecommendReason(model) };
  }

  function enrichModel(model) {
    const base = {
      ...model,
      score: scoreModel(model),
      profitPotential: getProfitPotential(model),
      riskLevel: getRiskLevel(model),
    };
    const marketCtx = attachMarketContext(base);
    const merged = { ...base, ...marketCtx };
    const { suggestBuy, suggestSell } = getSuggestedPrices(merged);
    const ranges = getPriceRanges(merged);
    const enriched = {
      ...merged,
      selectionVerdict: getSelectionVerdict(merged),
      suggestBuy,
      suggestSell,
      estimatedProfit: suggestSell - suggestBuy,
      ...ranges,
    };
    enriched.merchantHint = getMerchantHint(enriched);
    return enriched;
  }

  function pickFromPools(scored, pools, maxTotal) {
    const picked = [];
    const seenShort = new Set();

    for (const pool of pools) {
      for (const m of scored.filter(pool.filter)) {
        if (picked.length >= maxTotal) break;
        if (pool.minScore && m.score < pool.minScore) continue;
        if (seenShort.has(m.shortName)) continue;
        seenShort.add(m.shortName);
        picked.push(m);
        if (pool.max && picked.filter(pool.filter).length >= pool.max) break;
      }
    }
    return picked;
  }

  function pickPhoneRecommendations(scored) {
    const pools = [
      { filter: (m) => m.segment === SEGMENT.IPHONE_MAINSTREAM && m.riskLevel.level !== "high", max: 8 },
      { filter: (m) => m.segment === SEGMENT.ANDROID_MAINSTREAM && m.riskLevel.level !== "high", max: 10, minScore: 90 },
    ];
    let picked = pickFromPools(scored, pools, 10);
    while (picked.length < 5) {
      const next = scored.find((m) => !picked.find((r) => r.name === m.name));
      if (!next) break;
      picked.push(next);
    }
    return finalizeRecommendations(scored, picked.slice(0, 10));
  }

  function pickEreaderRecommendations(scored) {
    const pools = [
      { filter: (m) => m.segment === SEGMENT.EREADER_KINDLE && m.riskLevel.level !== "high", max: 6 },
      { filter: (m) => m.segment === SEGMENT.EREADER_KOBO && m.riskLevel.level !== "high", max: 4 },
    ];
    let picked = pickFromPools(scored, pools, 8);
    while (picked.length < 5) {
      const next = scored.find(
        (m) => !picked.find((r) => r.name === m.name) && m.riskLevel.level !== "high"
      );
      if (!next) break;
      picked.push(next);
    }
    return finalizeRecommendations(scored, picked.slice(0, 8));
  }

  function finalizeRecommendations(scored, finalRecommended) {
    const notRecommended = scored
      .filter((m) => !finalRecommended.find((r) => r.name === m.name))
      .filter((m) => {
        if (m.productType === PRODUCT_TYPE.EREADER) {
          return m.score < 80 || m.riskLevel.level === "high" || m.segment === SEGMENT.EREADER_LEGACY;
        }
        return m.score < 85 || m.riskLevel.level === "high" || m.segment === SEGMENT.LEGACY;
      })
      .slice(0, 8)
      .map((m) => ({ ...m, reason: buildNotRecommendReason(m) }));

    return { recommended: finalRecommended, notRecommended };
  }

  function getPhoneCategoryStats(scored, recommended) {
    return {
      primary: { label: "iPhone主流", count: recommended.filter((m) => m.segment === SEGMENT.IPHONE_MAINSTREAM).length, cls: "apple" },
      secondary: { label: "安卓主流", count: recommended.filter((m) => m.segment === SEGMENT.ANDROID_MAINSTREAM).length, cls: "android" },
      filtered: { label: "老旧机型", count: scored.filter((m) => m.segment === SEGMENT.LEGACY).length, cls: "legacy", suffix: "已过滤" },
    };
  }

  function getEreaderCategoryStats(scored, recommended) {
    return {
      primary: { label: "Kindle主流", count: recommended.filter((m) => m.segment === SEGMENT.EREADER_KINDLE).length, cls: "apple" },
      secondary: { label: "Kobo主流", count: recommended.filter((m) => m.segment === SEGMENT.EREADER_KOBO).length, cls: "android" },
      filtered: { label: "老旧型号", count: scored.filter((m) => m.segment === SEGMENT.EREADER_LEGACY).length, cls: "legacy", suffix: "已过滤" },
    };
  }

  function generateDailyRecommendations(productType) {
    const type = productType || PRODUCT_TYPE.PHONE;
    const config = getProductConfig(type);
    const scored = config.generateCandidates().map(enrichModel).sort((a, b) => b.score - a.score);
    const { recommended, notRecommended } = config.pickRecommendations(scored);
    const stats = config.getCategoryStats(scored, recommended);
    const today = new Date();

    return {
      productType: type,
      productLabel: config.label,
      productIcon: config.icon,
      date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
      recommended,
      notRecommended,
      topThree: recommended.slice(0, 3),
      topPick: recommended[0] || null,
      rules: config.rules,
      categoryStats: stats,
      totalCandidates: scored.length,
      baseParams: config.baseParams,
      recommendTitle: config.recommendTitle,
      badTitle: config.badTitle,
      refreshSuffix: config.refreshSuffix,
    };
  }

  function resolveUnknownModel(input, productType) {
    const type = productType || PRODUCT_TYPE.PHONE;
    const model = enrichModel(profileToModel(parseModelInput(input, type)));
    return {
      model,
      categoryLabel: model.categoryLabel,
      score: model.score,
      liquidity: model.liquidity,
      profitPotential: model.profitPotential,
      riskLevel: model.riskLevel,
      cycleLabel: model.cycleLabel,
      merchantHint: model.merchantHint,
      suggestBuy: model.suggestBuy,
      suggestSell: model.suggestSell,
      estimatedProfit: model.estimatedProfit,
      verdict: model.selectionVerdict,
      marketZones: model.marketZones,
      currentMarketPrice: model.currentMarketPrice,
      marketPosition: model.marketPosition,
      priceJudgment: model.priceJudgment,
      receiveSuitability: model.receiveSuitability,
    };
  }

  function getProductTypes() {
    return Object.values(PRODUCT_REGISTRY).map((p) => ({
      id: p.id,
      label: p.label,
      icon: p.icon,
      queryPlaceholder: p.queryPlaceholder,
    }));
  }

  function getSimpleAdvice(model) {
    let level = "good";
    let label = "推荐";

    if (model.receiveSuitability) {
      const r = model.receiveSuitability;
      if (r.level === "good") {
        level = "good";
        label = "推荐";
      } else if (r.level === "warn") {
        level = "warn";
        label = "谨慎";
      } else {
        level = "bad";
        label = "不推荐";
      }
    } else {
      const v = model.selectionVerdict;
      if (v.level === "good") { level = "good"; label = "推荐"; }
      else if (v.level === "warn") { level = "warn"; label = "谨慎"; }
      else { level = "bad"; label = "不推荐"; }
    }

    return { label, level };
  }

  function classifyDailyBuckets(data) {
    const recommendBuy = [];
    const cautious = [];

    for (const m of data.recommended) {
      const enriched = { ...m, simpleAdvice: getSimpleAdvice(m) };
      const recv = m.receiveSuitability;
      const marketGood = m.marketPosition && (m.marketPosition.zone === "low" || m.marketPosition.isUndervalued);

      if (
        (recv && recv.suitable === true) ||
        (m.selectionVerdict.level === "good" && marketGood) ||
        m.merchantHint.level === "fast"
      ) {
        recommendBuy.push(enriched);
      } else if (recv && recv.suitable === false) {
        // high price zone models fall through to avoid via notRecommended usually
        cautious.push(enriched);
      } else {
        cautious.push(enriched);
      }
    }

    const avoidFromNotRec = data.notRecommended.map((m) => ({
      ...m,
      simpleAdvice: { label: "不建议", level: "bad" },
    }));

    const avoidFromHighPrice = data.recommended
      .filter((m) => m.receiveSuitability && m.receiveSuitability.suitable === false)
      .filter((m) => !avoidFromNotRec.find((a) => a.name === m.name))
      .map((m) => ({
        ...m,
        reason: m.receiveSuitability.reason,
        simpleAdvice: { label: "不建议", level: "bad" },
      }));

    const avoid = [...avoidFromHighPrice, ...avoidFromNotRec];

    return { recommendBuy, cautious: cautious.filter((c) => !avoid.find((a) => a.name === c.name)), avoid };
  }

  function formatRecommendShortNames(models, max) {
    const seen = new Set();
    const names = [];
    for (const m of models) {
      let label = m.shortName.replace(/\s+\d+G$/i, "");
      const iphone = label.match(/iPhone\s+(\d+(?:\s+Pro(?:\s+Max)?)?)/i);
      if (iphone) label = iphone[1].includes("Pro") ? `iPhone ${iphone[1]}` : `iPhone ${iphone[1].replace(/\s+Pro.*/, "")}`;
      if (seen.has(label)) continue;
      seen.add(label);
      names.push(label);
      if (names.length >= max) break;
    }
    return names;
  }

  function summarizeAvoidLabels(avoidList) {
    const labels = new Set();
    for (const m of avoidList) {
      if (m.segment === SEGMENT.LEGACY && m.brand !== "apple") labels.add("老安卓");
      else if (m.segment === SEGMENT.LEGACY || m.segment === SEGMENT.EREADER_LEGACY) labels.add("老旧机型");
      else if (m.riskLevel && m.riskLevel.level === "high") labels.add("高风险机型");
      else if (m.liquidity <= 4) labels.add("低流动性机型");
      else labels.add(m.shortName.replace(/\s+\d+G$/i, ""));
    }
    return Array.from(labels).slice(0, 4);
  }

  function computeOverallRisk(buckets, data) {
    const pool = [...buckets.recommendBuy, ...buckets.cautious];
    if (!pool.length) return { label: "中等", level: "warn" };

    const highCount = pool.filter((m) => m.riskLevel.level === "high").length;
    const lowCount = pool.filter((m) => m.riskLevel.level === "low").length;
    const cautiousRatio = buckets.cautious.length / Math.max(1, data.recommended.length);

    if (highCount >= 2 || cautiousRatio > 0.6) return { label: "偏高", level: "bad" };
    if (lowCount >= pool.length * 0.6 && highCount === 0) return { label: "较低", level: "good" };
    return { label: "中等", level: "warn" };
  }

  /** V9 每日一句话决策 */
  function buildDailyBrief(data, buckets) {
    const buyModels = buckets.recommendBuy.length ? buckets.recommendBuy : data.recommended.slice(0, 3);
    const recNames = formatRecommendShortNames(buyModels, 4);
    const recommendText = recNames.length ? recNames.join(" / ") : "暂无明确推荐";
    const avoidLabels = summarizeAvoidLabels(buckets.avoid);
    const avoidText = avoidLabels.length ? avoidLabels.join(" / ") : "无特别限制";
    const risk = computeOverallRisk(buckets, data);

    const topOpportunities = data.recommended.slice(0, 5).map((m, i) => ({
      rank: i + 1,
      name: m.shortName.replace(/\s+\d+G$/i, ""),
      tag: m.marketPosition?.shortLabel || (m.isUndervalued ? "低估" : "推荐"),
      advice: m.receiveSuitability?.label || m.simpleAdvice?.label || "可做",
      reason: m.receiveSuitability?.reason || m.selectionVerdict?.reason || "",
      model: m,
    }));

    return {
      recommendText,
      riskLevel: risk,
      avoidText,
      headline: recNames.length
        ? `今日建议收 ${recommendText}，风险${risk.label}，避开 ${avoidText}`
        : `今日建议观望，风险${risk.label}，避开 ${avoidText}`,
      lines: [
        { key: "recommend", label: "推荐收", value: recommendText, icon: "✅" },
        { key: "risk", label: "风险提示", value: risk.label, icon: "⚠️", level: risk.level },
        { key: "avoid", label: "避免机型", value: avoidText, icon: "🚫" },
      ],
      topOpportunities,
    };
  }

  function generateDailyDecision(productType, plan) {
    const data = generateDailyRecommendations(productType);
    const isPaid = plan === "pro" || plan === "paid" || plan === "paid_pro";
    const buckets = classifyDailyBuckets(data);
    const dailyBrief = buildDailyBrief(data, buckets);
    const freeLimit = 3;

    return {
      ...data,
      plan,
      userRole: isPaid ? "pro" : "guest",
      isPaid,
      isPro: isPaid,
      buckets,
      dailyBrief,
      topPicks: data.recommended.slice(0, isPaid ? 5 : freeLimit),
      freePicks: buckets.recommendBuy.slice(0, freeLimit),
      visibleRecommended: isPaid ? data.recommended : data.recommended.slice(0, freeLimit),
      lockedCount: isPaid ? 0 : Math.max(0, buckets.recommendBuy.length - freeLimit),
      todaySummary: dailyBrief.headline,
    };
  }

  function buildTodaySummary(data) {
    return data.todaySummary || "今日暂无明确推荐，建议观望";
  }

  function evaluatePrice(input, price, productType) {
    const resolved = resolveUnknownModel(input, productType);
    const model = resolved.model;
    const p = Number(price);
    if (!p || p <= 0) return { error: "请输入有效价格" };

    const judgment = judgePriceReasonableness(p, model.marketZones);
    return {
      model,
      inputPrice: p,
      judgment,
      marketZones: model.marketZones,
      currentMarketPrice: model.currentMarketPrice,
      marketPosition: judgment.position,
      receiveSuitability: getReceiveSuitability({
        ...model,
        marketPosition: judgment.position,
        priceJudgment: judgment,
      }),
    };
  }

  global.SelectionEngine = {
    PRODUCT_TYPE,
    getProductTypes,
    generateDailyRecommendations,
    generateDailyDecision,
    resolveUnknownModel,
    evaluatePrice,
    getMerchantHint,
    getSimpleAdvice,
    classifyDailyBuckets,
    buildMarketZones,
    resolveMarketPosition,
    judgePriceReasonableness,
    getReceiveSuitability,
    buildDailyBrief,
    computeOverallRisk,
    INDUSTRY_RULES: PRODUCT_REGISTRY[PRODUCT_TYPE.PHONE].rules,
  };
})(typeof window !== "undefined" ? window : globalThis);
