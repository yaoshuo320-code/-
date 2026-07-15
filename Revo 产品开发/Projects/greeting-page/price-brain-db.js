/**
 * 价格大脑 V1 — 二手3C商品价格数据库
 */
(function (global) {
  const CONDITION_FACTOR = {
    "充新": 1.05, "99新": 1.02, "95新": 1.0, "9新": 0.92, "大花": 0.8, "功能异常": 0.65,
  };

  const CAPACITY_FACTOR = {
    "64GB": 0.88, "128GB": 0.94, "256GB": 1.0, "512GB": 1.08, "1TB": 1.15,
    "8GB+256GB": 1.0, "16GB+512GB": 1.1, "8GB+512GB": 1.08, "16GB+1TB": 1.15,
    "标准版": 1.0,
  };

  const PHONE_BRANDS = ["apple", "苹果", "华为", "huawei"];

  const NOW = Date.now();
  const USER_SKU_STORAGE_KEY = "price_brain_user_skus_v1";

  function p(opts) {
    const listingMin = opts.marketPrice?.min ?? opts.sellMin;
    const listingMax = opts.marketPrice?.max ?? opts.sellMax;
    const listingAvg = Math.round((listingMin + listingMax) / 2);
    const dealMin = opts.transactionPrice?.min ?? Math.round(listingMin * 0.92);
    const dealMax = opts.transactionPrice?.max ?? Math.round(listingMax * 0.95);
    const merchantOutMin = opts.dealerPrice?.min ?? Math.round(listingMin * 0.93);
    const merchantOutMax = opts.dealerPrice?.max ?? Math.round(listingMax * 0.88);
    const buyMin = opts.buyPrice?.min ?? opts.buyMin;
    const buyMax = opts.buyPrice?.max ?? opts.buyMax;
    return {
      id: opts.id,
      brand: opts.brand,
      model: opts.model,
      category: opts.category || "phone",
      version: opts.version || "国行",
      aliases: opts.aliases || [],
      capacity: opts.storage || opts.capacity || "256GB",
      condition: opts.condition || "95新",
      batteryHealth: opts.battery || opts.batteryHealth || 90,
      listingMin,
      listingAvg,
      listingMax,
      actualDealMin: dealMin,
      actualDealAvg: Math.round((dealMin + dealMax) / 2),
      actualDealMax: dealMax,
      merchantOutMin,
      merchantOutAvg: Math.round((merchantOutMin + merchantOutMax) / 2),
      merchantOutMax,
      marketSellMin: listingMin,
      marketSellAvg: listingAvg,
      marketSellMax: listingMax,
      buyMin,
      buyMax,
      liquidity: opts.liquidity,
      risk: opts.risk,
      riskLevel: opts.riskLevel || "low",
      turnoverDays: opts.turnoverDays,
      confidence: opts.confidence || null,
      source: opts.source || "seed",
      reason: opts.reason || "基于价格大脑分层数据估算，适合按商家出货价判断利润",
      updatedAt: opts.updatedAt || (opts.updateTime ? Date.parse(opts.updateTime) : NOW),
      updateTimeText: opts.updateTime || new Date(opts.updatedAt || NOW).toISOString().slice(0, 10),
    };
  }

  function sku(id, brand, model, storage, marketMin, marketMax, dealMin, dealMax, dealerMin, dealerMax, buyMin, buyMax, liquidity, turnoverDays, confidence, extra = {}) {
    return p({
      id,
      brand,
      model,
      storage,
      condition: extra.condition || "95新",
      battery: extra.battery || (brand === "Apple" && !extra.category ? "90-95%" : "—"),
      marketPrice: { min: marketMin, max: marketMax },
      transactionPrice: { min: dealMin, max: dealMax },
      dealerPrice: { min: dealerMin, max: dealerMax },
      buyPrice: { min: buyMin, max: buyMax },
      liquidity,
      risk: extra.risk || (liquidity >= 8 ? "低" : "中"),
      riskLevel: extra.riskLevel || (liquidity >= 8 ? "low" : "mid"),
      turnoverDays,
      confidence,
      updateTime: extra.updateTime || "2026-07-08",
      category: extra.category || "phone",
      reason: extra.reason || `${model} ${storage} 高频交易 SKU，按真实成交中位数和商家风险成本估算利润`,
      aliases: extra.aliases || [],
    });
  }

  const PRICE_DB = [
    sku("iphone16promax256", "Apple", "iPhone 16 Pro Max", "256GB", 6500, 7200, 6200, 6900, 5950, 6600, 5600, 6000, 9, "3-7天", "中", { aliases: ["16pm 256", "iphone 16 pro max 256"] }),
    sku("iphone16promax512", "Apple", "iPhone 16 Pro Max", "512GB", 7600, 8500, 7300, 8100, 7000, 7750, 6600, 7050, 9, "3-7天", "中", { aliases: ["16pm 512", "iphone 16 pro max 512"] }),
    sku("iphone16pro128", "Apple", "iPhone 16 Pro", "128GB", 5400, 6000, 5150, 5750, 4950, 5500, 4650, 5000, 9, "3-7天", "中", { aliases: ["16 pro 128"] }),
    sku("iphone16pro256", "Apple", "iPhone 16 Pro", "256GB", 6000, 6700, 5750, 6400, 5500, 6150, 5200, 5600, 9, "3-7天", "中", { aliases: ["16 pro 256"] }),
    sku("iphone16pro512", "Apple", "iPhone 16 Pro", "512GB", 7000, 7900, 6700, 7550, 6450, 7200, 6050, 6500, 8, "3-10天", "中", { aliases: ["16 pro 512"] }),
    sku("iphone16plus128", "Apple", "iPhone 16 Plus", "128GB", 3900, 4500, 3700, 4300, 3500, 4050, 3250, 3550, 8, "3-7天", "中", { aliases: ["16 plus 128"] }),
    sku("iphone16plus256", "Apple", "iPhone 16 Plus", "256GB", 4500, 5100, 4300, 4850, 4050, 4600, 3800, 4150, 8, "3-7天", "中", { aliases: ["16 plus 256"] }),
    sku("iphone16128", "Apple", "iPhone 16", "128GB", 3500, 4100, 3350, 3900, 3150, 3650, 2950, 3250, 9, "3-7天", "中", { aliases: ["iphone16 128", "16 128"] }),
    sku("iphone16256", "Apple", "iPhone 16", "256GB", 4100, 4700, 3900, 4500, 3700, 4200, 3450, 3800, 9, "3-7天", "中", { aliases: ["iphone16 256", "16 256"] }),

    sku("iphone15promax256", "Apple", "iPhone 15 Pro Max", "256GB", 4900, 5400, 4700, 5200, 4500, 5000, 4200, 4500, 9, "3-10天", "中", { aliases: ["15pm 256", "iphone 15 pro max 256"] }),
    sku("iphone15promax512", "Apple", "iPhone 15 Pro Max", "512GB", 5200, 5600, 5000, 5400, 4800, 5200, 4500, 4800, 9, "3-10天", "中", { reason: "512GB 容量需求稳定，但商家应按快速出货价核算，不按挂牌价计算利润", aliases: ["iphone15promax512", "15 pro max 512", "15pm 512", "iphone 15 pro max 512"] }),
    sku("iphone15pro128", "Apple", "iPhone 15 Pro", "128GB", 3900, 4400, 3700, 4200, 3500, 4000, 3250, 3550, 9, "3-7天", "中", { aliases: ["15 pro 128"] }),
    sku("iphone15pro256", "Apple", "iPhone 15 Pro", "256GB", 4300, 4800, 4100, 4600, 3900, 4400, 3650, 3950, 9, "3-7天", "中", { aliases: ["15 pro 256"] }),
    sku("iphone15pro512", "Apple", "iPhone 15 Pro", "512GB", 4800, 5300, 4600, 5050, 4350, 4800, 4050, 4400, 8, "3-10天", "中", { aliases: ["15 pro 512"] }),
    sku("iphone15plus128", "Apple", "iPhone 15 Plus", "128GB", 3100, 3600, 2950, 3450, 2750, 3200, 2550, 2850, 8, "3-7天", "中", { aliases: ["15 plus 128"] }),
    sku("iphone15plus256", "Apple", "iPhone 15 Plus", "256GB", 3500, 4000, 3350, 3800, 3150, 3550, 2900, 3250, 8, "3-7天", "中", { aliases: ["15 plus 256"] }),
    sku("iphone15128", "Apple", "iPhone 15", "128GB", 2850, 3300, 2700, 3150, 2500, 2950, 2350, 2600, 9, "3-7天", "高", { aliases: ["iphone15 128", "15 128"] }),
    sku("iphone15256", "Apple", "iPhone 15", "256GB", 3300, 3800, 3150, 3600, 2950, 3400, 2750, 3050, 9, "3-7天", "高", { aliases: ["iphone15 256", "15 256"] }),

    sku("iphone14promax256", "Apple", "iPhone 14 Pro Max", "256GB", 3900, 4400, 3700, 4200, 3500, 3950, 3250, 3600, 8, "3-10天", "中", { aliases: ["14pm 256", "14 pro max 256"] }),
    sku("iphone14pro128", "Apple", "iPhone 14 Pro", "128GB", 3300, 3800, 3150, 3650, 2950, 3400, 2750, 3050, 8, "3-7天", "高", { aliases: ["14 pro 128"] }),
    sku("iphone14pro256", "Apple", "iPhone 14 Pro", "256GB", 3700, 4200, 3500, 4000, 3300, 3750, 3050, 3400, 8, "3-7天", "高", { aliases: ["14 pro 256"] }),
    sku("iphone14plus128", "Apple", "iPhone 14 Plus", "128GB", 2450, 2850, 2300, 2700, 2150, 2500, 1950, 2200, 7, "5-10天", "中", { aliases: ["14 plus 128"] }),
    sku("iphone14128", "Apple", "iPhone 14", "128GB", 2200, 2600, 2050, 2450, 1900, 2250, 1750, 2000, 8, "3-7天", "高", { aliases: ["iphone14 128", "14 128"] }),
    sku("iphone14256", "Apple", "iPhone 14", "256GB", 2600, 3050, 2450, 2900, 2250, 2650, 2100, 2350, 8, "3-7天", "高", { aliases: ["iphone14 256", "14 256"] }),

    sku("iphone13promax256", "Apple", "iPhone 13 Pro Max", "256GB", 3100, 3600, 2950, 3400, 2750, 3150, 2550, 2850, 8, "3-10天", "中", { aliases: ["13pm 256", "13 pro max 256"] }),
    sku("iphone13pro128", "Apple", "iPhone 13 Pro", "128GB", 2550, 3000, 2400, 2850, 2250, 2650, 2050, 2350, 8, "3-10天", "中", { aliases: ["13 pro 128"] }),
    sku("iphone13128", "Apple", "iPhone 13", "128GB", 1800, 2200, 1700, 2050, 1550, 1900, 1400, 1650, 8, "3-7天", "高", { aliases: ["iphone13 128", "13 128"] }),
    sku("iphone13256", "Apple", "iPhone 13", "256GB", 2150, 2550, 2000, 2400, 1850, 2200, 1650, 1950, 8, "3-7天", "高", { aliases: ["iphone13 256", "13 256"] }),
    sku("iphone13mini128", "Apple", "iPhone 13 mini", "128GB", 1600, 1950, 1500, 1800, 1350, 1650, 1200, 1450, 6, "7-14天", "中", { aliases: ["13 mini 128"], risk: "中", riskLevel: "mid" }),

    sku("ipadair5-64", "Apple", "iPad Air 5", "64GB", 2400, 2850, 2250, 2700, 2050, 2450, 1850, 2150, 7, "5-10天", "中", { category: "tablet", aliases: ["ipad air 5 64"] }),
    sku("ipadair5-256", "Apple", "iPad Air 5", "256GB", 3050, 3600, 2850, 3400, 2600, 3100, 2350, 2700, 7, "5-10天", "中", { category: "tablet", aliases: ["ipad air 5 256"] }),
    sku("ipadairm2-128", "Apple", "iPad Air M2", "128GB", 3300, 3900, 3150, 3700, 2900, 3400, 2650, 3000, 8, "5-10天", "中", { category: "tablet", aliases: ["ipad air m2 128"] }),
    sku("ipadairm2-256", "Apple", "iPad Air M2", "256GB", 3900, 4550, 3700, 4300, 3450, 3950, 3150, 3550, 8, "5-10天", "中", { category: "tablet", aliases: ["ipad air m2 256"] }),
    sku("ipadpro11m2-128", "Apple", "iPad Pro 11 M2", "128GB", 3950, 4650, 3750, 4400, 3450, 4050, 3150, 3600, 7, "5-10天", "中", { category: "tablet", aliases: ["ipad pro 11 m2 128"] }),
    sku("ipadpro11m2-256", "Apple", "iPad Pro 11 M2", "256GB", 4450, 5200, 4200, 4950, 3900, 4550, 3550, 4050, 7, "5-10天", "中", { category: "tablet", aliases: ["ipad pro 11 m2 256"] }),
    sku("ipadpro129m2-128", "Apple", "iPad Pro 12.9 M2", "128GB", 5200, 6100, 4900, 5800, 4550, 5350, 4100, 4700, 6, "7-14天", "中", { category: "tablet", aliases: ["ipad pro 12.9 m2 128"], risk: "中", riskLevel: "mid" }),
    sku("ipadpro129m2-256", "Apple", "iPad Pro 12.9 M2", "256GB", 5800, 6800, 5500, 6450, 5100, 5950, 4600, 5250, 6, "7-14天", "中", { category: "tablet", aliases: ["ipad pro 12.9 m2 256"], risk: "中", riskLevel: "mid" }),
    sku("ipadpro11m4-256", "Apple", "iPad Pro 11 M4", "256GB", 6600, 7600, 6300, 7200, 5900, 6750, 5350, 6100, 7, "5-10天", "中", { category: "tablet", aliases: ["ipad pro 11 m4 256"] }),
    sku("ipadpro13m4-256", "Apple", "iPad Pro 13 M4", "256GB", 8200, 9500, 7800, 9000, 7300, 8400, 6600, 7600, 6, "7-14天", "中", { category: "tablet", aliases: ["ipad pro 13 m4 256"], risk: "中", riskLevel: "mid" }),

    sku("macbookairm1-8-256", "Apple", "MacBook Air M1", "8GB+256GB", 3500, 4200, 3300, 3950, 3050, 3600, 2800, 3200, 7, "5-10天", "中", { category: "laptop", aliases: ["mba m1 8 256", "macbook air m1"] }),
    sku("macbookairm2-8-256", "Apple", "MacBook Air M2", "8GB+256GB", 4700, 5400, 4450, 5100, 4100, 4700, 3800, 4250, 8, "5-10天", "中", { category: "laptop", aliases: ["mba m2 8 256", "macbook air m2"] }),
    sku("macbookairm2-16-512", "Apple", "MacBook Air M2", "16GB+512GB", 6100, 7000, 5800, 6650, 5350, 6150, 4950, 5550, 7, "7-14天", "中", { category: "laptop", aliases: ["mba m2 16 512"] }),

    sku("airpodspro2", "Apple", "AirPods Pro 2", "—", 900, 1100, 850, 1000, 780, 950, 700, 820, 9, "3-7天", "高", { category: "accessory", aliases: ["airpods pro 2", "airpods pro2", "app2"] }),
    sku("macbookairm3-8-256", "Apple", "MacBook Air M3", "8GB+256GB", 5600, 6500, 5300, 6150, 4900, 5700, 4550, 5150, 8, "5-10天", "中", { category: "laptop", aliases: ["mba m3 8 256", "macbook air m3"] }),
    sku("macbookairm3-16-512", "Apple", "MacBook Air M3", "16GB+512GB", 7200, 8300, 6850, 7850, 6350, 7300, 5850, 6600, 7, "7-14天", "中", { category: "laptop", aliases: ["mba m3 16 512"] }),
    sku("macbookprom1pro-16-512", "Apple", "MacBook Pro M1 Pro", "16GB+512GB", 6500, 7600, 6150, 7200, 5700, 6650, 5200, 5950, 6, "7-14天", "中", { category: "laptop", aliases: ["mbp m1 pro 16 512"], risk: "中", riskLevel: "mid" }),
    sku("macbookprom2pro-16-512", "Apple", "MacBook Pro M2 Pro", "16GB+512GB", 7800, 9200, 7400, 8700, 6900, 8050, 6300, 7200, 6, "7-14天", "中", { category: "laptop", aliases: ["mbp m2 pro 16 512"], risk: "中", riskLevel: "mid" }),
    sku("macbookprom3-8-512", "Apple", "MacBook Pro M3", "8GB+512GB", 8200, 9600, 7800, 9100, 7250, 8450, 6600, 7500, 6, "7-14天", "中", { category: "laptop", aliases: ["mbp m3 8 512"], risk: "中", riskLevel: "mid" }),
    sku("macbookprom3pro-18-512", "Apple", "MacBook Pro M3 Pro", "18GB+512GB", 10500, 12500, 9950, 11800, 9300, 10900, 8500, 9800, 5, "10-20天", "中", { category: "laptop", aliases: ["mbp m3 pro 18 512"], risk: "中", riskLevel: "mid" }),
    sku("macbookprom4-16-512", "Apple", "MacBook Pro M4", "16GB+512GB", 10800, 12800, 10200, 12000, 9500, 11200, 8700, 10000, 6, "7-14天", "中", { category: "laptop", aliases: ["mbp m4 16 512"], risk: "中", riskLevel: "mid" }),
    sku("macbookprom4pro-24-512", "Apple", "MacBook Pro M4 Pro", "24GB+512GB", 13800, 16200, 13100, 15300, 12200, 14200, 11200, 13000, 5, "10-20天", "中", { category: "laptop", aliases: ["mbp m4 pro 24 512"], risk: "中", riskLevel: "mid" }),
  ];

  const AVOID_LIST = [
    { name: "老安卓（3年以上）", risk: "高", reason: "流动性低，压货风险大" },
    { name: "碎屏 / 大修机", risk: "高", reason: "出手难，售后纠纷多" },
    { name: "韩版 / 美版有锁", risk: "高", reason: "渠道窄，容易被压价" },
    { name: "电池健康低于 80%", risk: "中", reason: "影响出货价，易引发退货" },
  ];

  function readUserSkus() {
    try {
      const raw = localStorage.getItem(USER_SKU_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function writeUserSkus(list) {
    localStorage.setItem(USER_SKU_STORAGE_KEY, JSON.stringify(list));
  }

  function skuIdFromInput(input) {
    return [
      "manual",
      input.brand,
      input.model,
      input.capacity,
      input.condition,
    ]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function normalizeManualSku(input) {
    const marketMin = Number(input.marketMin);
    const marketMax = Number(input.marketMax);
    const transactionPrice = Number(input.transactionPrice);
    const dealerPrice = Number(input.dealerPrice);
    const buyPrice = Number(input.buyPrice);

    if (!input.brand || !input.model || !input.capacity || !input.condition) {
      throw new Error("请填写品牌、型号、容量和成色");
    }
    if (!marketMin || !marketMax || marketMin > marketMax) {
      throw new Error("请填写有效的市场挂牌价区间");
    }
    if (!transactionPrice || !dealerPrice || !buyPrice) {
      throw new Error("请填写成交参考价、商家出货价和建议收货价");
    }

    return p({
      id: input.id || skuIdFromInput(input),
      brand: input.brand,
      model: input.model,
      storage: input.capacity,
      condition: input.condition,
      battery: input.battery || "人工录入",
      marketPrice: { min: marketMin, max: marketMax },
      transactionPrice: { min: transactionPrice, max: transactionPrice },
      dealerPrice: { min: dealerPrice, max: dealerPrice },
      buyPrice: { min: buyPrice, max: buyPrice },
      liquidity: Number(input.liquidity) || 7,
      risk: input.risk || "中",
      riskLevel: input.riskLevel || "mid",
      turnoverDays: input.turnoverDays || "人工判断",
      confidence: input.confidence || "中",
      updateTime: input.updateTime || new Date().toISOString().slice(0, 10),
      reason: "人工采集录入价格，优先用于本地交易判断",
      aliases: [input.model, `${input.model} ${input.capacity}`],
      source: "manual",
    });
  }

  function upsertProduct(product) {
    const index = PRICE_DB.findIndex((item) => item.id === product.id);
    if (index >= 0) PRICE_DB[index] = product;
    else PRICE_DB.unshift(product);
  }

  function saveManualSku(input) {
    const product = normalizeManualSku(input);
    const saved = readUserSkus().filter((item) => item.id !== product.id);
    saved.unshift(product);
    writeUserSkus(saved);
    upsertProduct(product);
    return product;
  }

  readUserSkus().forEach(upsertProduct);

  function norm(s) {
    return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function isPhoneBrand(brand) {
    const b = norm(brand);
    return PHONE_BRANDS.some((p) => b.includes(p));
  }

  function batteryFactor(health) {
    const h = Number(health);
    if (!h || h <= 0) return 1;
    if (h >= 90) return 1;
    if (h >= 80) return 0.97;
    if (h >= 70) return 0.92;
    return 0.85;
  }

  function findProduct(brand, modelName, capacity) {
    const q = norm(`${brand} ${modelName}`);
    const m = norm(modelName);
    const c = norm(capacity);
    let best = null;
    let bestScore = 0;
    for (const item of PRICE_DB) {
      const names = [item.model, ...item.aliases].map(norm);
      for (const n of names) {
        if (q.includes(n) || n.includes(m) || m.includes(n)) {
          const capacityScore = c && norm(item.capacity) === c ? 100 : 0;
          const manualScore = item.source === "manual" ? 200 : 0;
          const score = n.length + (q === n ? 50 : 0) + capacityScore + manualScore;
          if (score > bestScore) {
            bestScore = score;
            best = item;
          }
        }
      }
    }
    return best;
  }

  function searchProducts(query) {
    const q = norm(query);
    if (!q) return [];
    return PRICE_DB.filter((item) => {
      const hay = [item.brand, item.model, ...item.aliases].join(" ").toLowerCase();
      return hay.includes(q) || q.split(" ").some((w) => w.length > 2 && hay.includes(w));
    });
  }

  function resolvePrices(product, input) {
    const capacity = input.capacity || "256GB";
    const condition = input.condition || "95新";
    const capF = product.capacity === capacity ? 1 : (CAPACITY_FACTOR[capacity] || 1);
    const condF = CONDITION_FACTOR[condition] || 1;
    const batF = isPhoneBrand(input.brand) ? batteryFactor(input.battery) : 1;
    const factor = capF * condF * batF;

    const listingMin = Math.round(product.listingMin * factor);
    const listingMax = Math.round(product.listingMax * factor);
    const listingAvg = Math.round(product.listingAvg * factor);
    const actualDealMin = Math.round(product.actualDealMin * factor);
    const actualDealMax = Math.round(product.actualDealMax * factor);
    const actualDealAvg = Math.round(product.actualDealAvg * factor);
    const merchantOutMin = Math.round(product.merchantOutMin * factor);
    const merchantOutMax = Math.round(product.merchantOutMax * factor);
    const merchantOutAvg = Math.round(product.merchantOutAvg * factor);
    const buyMin = Math.round(product.buyMin * capF * condF);
    const buyMax = Math.round(product.buyMax * capF * condF);

    return {
      listingMin, listingAvg, listingMax,
      actualDealMin, actualDealAvg, actualDealMax,
      merchantOutMin, merchantOutAvg, merchantOutMax,
      marketSellMin: listingMin,
      marketSellAvg: listingAvg,
      marketSellMax: listingMax,
      buyMin, buyMax,
      listingRangeText: `${listingMin}-${listingMax}`,
      actualDealRangeText: `${actualDealMin}-${actualDealMax}`,
      merchantOutRangeText: `${merchantOutMin}-${merchantOutMax}`,
      sellRangeText: `${merchantOutMin}-${merchantOutMax}`,
      buyRangeText: `${buyMin}-${buyMax}`,
      factor, capF, condF, batF,
    };
  }

  function riskCostRange(product, buyPrice) {
    const platformRate = product.category === "phone" ? 0.025 : product.category === "laptop" ? 0.02 : 0.03;
    const aftersaleRate = product.riskLevel === "low" ? 0.015 : product.riskLevel === "mid" ? 0.035 : 0.06;
    const turnoverRate = product.liquidity >= 9 ? 0.008 : product.liquidity >= 7 ? 0.018 : 0.035;
    const totalRate = platformRate + aftersaleRate + turnoverRate;
    const low = Math.round(buyPrice * totalRate * 0.8);
    const high = Math.round(buyPrice * totalRate * 1.2);
    return {
      platformFee: Math.round(buyPrice * platformRate),
      aftersaleRisk: Math.round(buyPrice * aftersaleRate),
      turnoverCost: Math.round(buyPrice * turnoverRate),
      riskLow: low,
      riskHigh: high,
      riskText: `${low}-${high}`,
    };
  }

  function profitFromBuy(buyPrice, transactionMedian, product) {
    const risk = riskCostRange(product, buyPrice);
    const low = Math.round(transactionMedian - buyPrice - risk.riskHigh);
    const high = Math.round(transactionMedian - buyPrice - risk.riskLow);
    const marginLow = buyPrice > 0 ? ((low / buyPrice) * 100).toFixed(1) : "0";
    const marginHigh = buyPrice > 0 ? ((high / buyPrice) * 100).toFixed(1) : "0";
    const mid = Math.round((low + high) / 2);
    const marginMid = buyPrice > 0 ? ((mid / buyPrice) * 100).toFixed(1) : "0";
    return {
      profitLow: low, profitHigh: high, profitText: `${low}-${high}`,
      marginLow, marginHigh, marginMid, marginText: `${marginLow}-${marginHigh}%`,
      marginMid,
      riskCost: risk,
    };
  }

  function quoteAdvantage(buyPrice, buyMin, buyMax) {
    if (buyPrice < buyMin) {
      return {
        type: "below",
        text: `低于市场收货价 ${buyMin - buyPrice}-${buyMax - buyPrice} 元`,
      };
    }
    if (buyPrice <= buyMax) {
      return {
        type: "inside",
        text: "处于市场合理收货区间内",
      };
    }
    return {
      type: "above",
      text: `高于市场合理收货上限 ${buyPrice - buyMax} 元`,
    };
  }

  function calcConfidence(product, input, prices) {
    let completeness = 0;
    if (input.brand && input.model) completeness += 40;
    if (input.capacity) completeness += 15;
    if (input.condition) completeness += 15;
    if (!isPhoneBrand(input.brand) || input.battery) completeness += 15;
    else completeness += 5;

    const ageHours = (Date.now() - product.updatedAt) / 3600000;
    let freshness = ageHours < 24 ? 30 : ageHours < 72 ? 20 : 10;

    const liquidity = product.liquidity >= 9 ? 30 : product.liquidity >= 7 ? 22 : 12;
    const total = completeness + freshness + liquidity;

    const factors = [
      { label: "商品信息完整度", value: completeness >= 70 ? "高" : completeness >= 50 ? "中" : "低", effect: completeness >= 70 ? "品牌/型号/成色等填写较完整" : "建议补充电池健康度等信息" },
      { label: "数据更新时间", value: ageHours < 24 ? "今日" : `${Math.floor(ageHours / 24)}天前`, effect: ageHours < 24 ? "价格数据较新，参考价值较高" : "数据略有滞后，请结合线下核价" },
      { label: "市场流动性", value: `${product.liquidity}/10`, effect: product.liquidity >= 8 ? "成交活跃，区间较稳定" : "周转偏慢，实际成交价波动较大" },
    ];

    if (product.confidence) {
      return {
        level: product.confidence,
        hint: `该 SKU 使用独立价格样本，系统置信度标记为${product.confidence}`,
        factors,
      };
    }
    if (total >= 75) return { level: "高", hint: "数据较完整且流动性好，区间可参考性强", factors };
    if (total >= 50) return { level: "中", hint: "存在一定波动，建议结合实机核价", factors };
    return { level: "低", hint: "信息或数据有限，区间仅供参考", factors };
  }

  function analyzeTrade(input) {
    const brand = input.brand?.trim();
    const modelName = input.model?.trim();
    const buyPrice = Number(input.buyPrice);

    if (!brand || !modelName) return { ok: false, message: "请填写品牌和型号" };
    if (!buyPrice || buyPrice <= 0) return { ok: false, message: "请输入有效的预计收货价格" };

    const product = findProduct(brand, modelName, input.capacity);
    if (!product) {
      return { ok: false, message: `价格大脑未收录「${brand} ${modelName}」，请检查型号` };
    }

    const prices = resolvePrices(product, input);
    const profit = profitFromBuy(buyPrice, prices.actualDealAvg, product);
    const confidence = calcConfidence(product, input, prices);
    const advantage = quoteAdvantage(buyPrice, prices.buyMin, prices.buyMax);
    const profitMid = Math.round((profit.profitLow + profit.profitHigh) / 2);

    let verdict, verdictLevel;
    const explanations = [];

    if (input.condition === "功能异常" || input.condition === "大花") {
      verdict = "不建议";
      verdictLevel = "bad";
      explanations.push("成色较差，残值折损大，出货难度高");
    } else if (profitMid >= 500 && profit.profitLow > 0) {
      verdict = "强烈建议收货";
      verdictLevel = "strong";
      explanations.push("收货价格低于市场合理区间，利润空间充足");
      explanations.push(`预计净利润 ${profit.profitText} 元，已扣除平台费用、售后风险和周转成本`);
      explanations.push(`流动性 ${product.liquidity}/10，预计周转 ${product.turnoverDays}`);
    } else if (profitMid >= 250 && profit.profitHigh > 0) {
      verdict = "推荐收货";
      verdictLevel = "good";
      explanations.push("扣除风险成本后仍有正常利润空间");
      explanations.push(`流动性 ${product.liquidity}/10，预计周转 ${product.turnoverDays}`);
      explanations.push(product.reason);
    } else if (profit.profitHigh > 0) {
      verdict = "谨慎";
      verdictLevel = "warn";
      explanations.push("预计净利润较低，价格波动或售后风险可能吃掉利润");
      explanations.push("利润已按商家快速出货价，并扣除平台费用、售后风险和周转成本");
    } else {
      verdict = "不建议";
      verdictLevel = "bad";
      explanations.push("扣除风险成本后预计亏损");
      explanations.push(`合理收货区间 ¥${prices.buyRangeText}`);
    }

    const productName = `${brand} ${product.model}${input.capacity ? " " + input.capacity : ""}`;

    return {
      ok: true,
      productName,
      brand,
      model: product.model,
      capacity: input.capacity,
      condition: input.condition,
      battery: input.battery || null,
      listingRangeText: prices.listingRangeText,
      actualDealRangeText: prices.actualDealRangeText,
      merchantOutRangeText: prices.merchantOutRangeText,
      actualDealAvg: prices.actualDealAvg,
      marketSellMin: prices.listingMin,
      marketSellMax: prices.listingMax,
      marketSellAvg: prices.listingAvg,
      sellRangeText: prices.merchantOutRangeText,
      buyRangeText: prices.buyRangeText,
      buyMin: prices.buyMin,
      buyMax: prices.buyMax,
      buyCost: buyPrice,
      quoteAdvantage: advantage.text,
      quoteAdvantageType: advantage.type,
      riskCostText: profit.riskCost.riskText,
      platformFee: profit.riskCost.platformFee,
      aftersaleRisk: profit.riskCost.aftersaleRisk,
      turnoverCost: profit.riskCost.turnoverCost,
      profitRangeText: profit.profitText,
      profitLow: profit.profitLow,
      profitHigh: profit.profitHigh,
      marginText: profit.marginText,
      marginMid: profit.marginMid,
      marginRange: profit.marginText,
      priceConfidence: confidence.level,
      priceConfidenceHint: confidence.hint,
      confidenceFactors: confidence.factors,
      verdict,
      verdictLevel,
      explanations,
      liquidity: product.liquidity,
      risk: product.risk,
      turnoverDays: product.turnoverDays,
      updatedAt: product.updatedAt,
      updateTimeText: product.updateTimeText,
      productId: product.id,
    };
  }

  function turnoverScore(product) {
    if (product.liquidity >= 9) return 9;
    if (product.liquidity >= 8) return 8;
    if (product.liquidity >= 7) return 6;
    return 4;
  }

  function riskScore(product) {
    if (product.riskLevel === "low") return 10;
    if (product.riskLevel === "mid") return 6;
    return 2;
  }

  function buildOpportunity(product, mode) {
    const prices = resolvePrices(product, { brand: product.brand, capacity: "256GB", condition: "95新" });
    const buyMid = Math.round((prices.buyMin + prices.buyMax) / 2);
    const profit = profitFromBuy(buyMid, prices.actualDealAvg, product);
    const marginMid = Number(profit.marginMid);
    const profitS = Math.min(100, marginMid * 4);
    const liquidityS = product.liquidity * 10;
    const turnoverS = turnoverScore(product) * 10;
    const riskS = riskScore(product) * 10;

    const score = mode === "week"
      ? profitS * 0.5 + riskS * 0.25 + liquidityS * 0.15 + turnoverS * 0.1
      : profitS * 0.4 + liquidityS * 0.3 + turnoverS * 0.2 + riskS * 0.1;

    const turnoverAdvice = product.liquidity >= 9
      ? `${product.turnoverDays} · 建议快收快出`
      : product.liquidity >= 7
        ? `${product.turnoverDays} · 正常周转`
        : `${product.turnoverDays} · 不宜压货`;

    return {
      id: product.id,
      name: product.model,
      brand: product.brand,
      profitRange: profit.profitText,
      marginRate: profit.marginMid,
      marginRange: profit.marginText,
      turnoverAdvice,
      reason: product.reason,
      liquidity: product.liquidity,
      risk: product.risk,
      turnoverDays: product.turnoverDays,
      score,
    };
  }

  function getTopOpportunities(mode, limit) {
    const pool = mode === "week"
      ? PRICE_DB.filter((p) => p.riskLevel !== "high")
      : PRICE_DB.filter((p) => p.liquidity >= 7);
    return pool
      .map((p) => buildOpportunity(p, mode || "today"))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 3);
  }

  global.PriceBrain = {
    PRICE_DB,
    AVOID_LIST,
    isPhoneBrand,
    findProduct,
    searchProducts,
    resolvePrices,
    analyzeTrade,
    getTopOpportunities,
    saveManualSku,
    readUserSkus,
  };
})(typeof window !== "undefined" ? window : globalThis);
