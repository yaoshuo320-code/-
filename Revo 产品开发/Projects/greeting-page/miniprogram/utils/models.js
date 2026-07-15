const PHONE_MODELS = [
  {
    name: "iPhone 15 Pro 256G",
    shortName: "iPhone 15 Pro",
    aliases: ["iphone15pro256", "15pro256"],
    priceLow: 5200, priceMid: 5700, priceHigh: 6200,
    liquidity: 9, demand: 9,
    brand: "apple", generation: 15, isPro: true, storage: "256G", storageBonus: true,
  },
  {
    name: "iPhone 15 Pro",
    shortName: "iPhone 15 Pro",
    aliases: ["iphone15pro", "苹果15pro", "15pro"],
    priceLow: 4800, priceMid: 5300, priceHigh: 5800,
    liquidity: 8, demand: 8,
    brand: "apple", generation: 15, isPro: true, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 15",
    shortName: "iPhone 15",
    aliases: ["iphone15", "苹果15"],
    priceLow: 3200, priceMid: 3600, priceHigh: 4000,
    liquidity: 8, demand: 8,
    brand: "apple", generation: 15, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 14 Pro 256G",
    shortName: "iPhone 14 Pro",
    aliases: ["iphone14pro256", "14pro256"],
    priceLow: 4100, priceMid: 4500, priceHigh: 4900,
    liquidity: 9, demand: 8,
    brand: "apple", generation: 14, isPro: true, storage: "256G", storageBonus: true,
  },
  {
    name: "iPhone 14 Pro",
    shortName: "iPhone 14 Pro",
    aliases: ["iphone14pro", "苹果14pro", "14pro"],
    priceLow: 3800, priceMid: 4200, priceHigh: 4600,
    liquidity: 8, demand: 8,
    brand: "apple", generation: 14, isPro: true, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 14",
    shortName: "iPhone 14",
    aliases: ["iphone14", "苹果14"],
    priceLow: 2600, priceMid: 2900, priceHigh: 3200,
    liquidity: 9, demand: 9,
    brand: "apple", generation: 14, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 13 256G",
    shortName: "iPhone 13",
    aliases: ["iphone13256", "13 256"],
    priceLow: 2400, priceMid: 2700, priceHigh: 3000,
    liquidity: 9, demand: 9,
    brand: "apple", generation: 13, isPro: false, storage: "256G", storageBonus: true,
  },
  {
    name: "iPhone 13",
    shortName: "iPhone 13",
    aliases: ["iphone13", "苹果13"],
    priceLow: 2200, priceMid: 2500, priceHigh: 2800,
    liquidity: 9, demand: 9,
    brand: "apple", generation: 13, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 12",
    shortName: "iPhone 12",
    aliases: ["iphone12", "苹果12"],
    priceLow: 1500, priceMid: 1750, priceHigh: 2000,
    liquidity: 7, demand: 7,
    brand: "apple", generation: 12, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "iPhone 11",
    shortName: "iPhone 11",
    aliases: ["iphone11", "苹果11"],
    priceLow: 900, priceMid: 1100, priceHigh: 1300,
    liquidity: 6, demand: 6,
    brand: "apple", generation: 11, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "华为 Mate 60",
    shortName: "华为 Mate 60",
    aliases: ["mate60", "华为mate60"],
    priceLow: 3500, priceMid: 4000, priceHigh: 4500,
    liquidity: 8, demand: 9,
    brand: "huawei", generation: 14, isPro: false, storage: "256G", storageBonus: true,
  },
  {
    name: "小米 14",
    shortName: "小米 14",
    aliases: ["小米14", "xiaomi14", "mi14"],
    priceLow: 1800, priceMid: 2100, priceHigh: 2400,
    liquidity: 7, demand: 8,
    brand: "android", generation: 14, isPro: false, storage: "256G", storageBonus: true,
  },
  {
    name: "小米 13",
    shortName: "小米 13",
    aliases: ["小米13", "xiaomi13", "mi13"],
    priceLow: 1400, priceMid: 1600, priceHigh: 1850,
    liquidity: 7, demand: 7,
    brand: "android", generation: 13, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "Redmi K60",
    shortName: "Redmi K60",
    aliases: ["红米k60", "k60"],
    priceLow: 900, priceMid: 1100, priceHigh: 1300,
    liquidity: 7, demand: 7,
    brand: "android", generation: 12, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "华为 P60",
    shortName: "华为 P60",
    aliases: ["p60", "华为p60"],
    priceLow: 2200, priceMid: 2600, priceHigh: 3000,
    liquidity: 6, demand: 6,
    brand: "huawei", generation: 13, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "OPPO Find X6",
    shortName: "OPPO Find X6",
    aliases: ["findx6", "find x6"],
    priceLow: 1200, priceMid: 1500, priceHigh: 1800,
    liquidity: 5, demand: 5,
    brand: "android", generation: 12, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "vivo X90",
    shortName: "vivo X90",
    aliases: ["x90", "vivox90"],
    priceLow: 1300, priceMid: 1600, priceHigh: 1900,
    liquidity: 5, demand: 5,
    brand: "android", generation: 12, isPro: false, storage: "128G", storageBonus: false,
  },
  {
    name: "三星 S23",
    shortName: "三星 S23",
    aliases: ["s23", "galaxys23"],
    priceLow: 2000, priceMid: 2400, priceHigh: 2800,
    liquidity: 4, demand: 4,
    brand: "android", generation: 13, isPro: false, storage: "128G", storageBonus: false,
  },
];

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, "");
}

function findModel(query) {
  const key = normalize(query);
  if (!key) return null;
  return (
    PHONE_MODELS.find((model) => {
      if (normalize(model.name) === key) return true;
      return model.aliases.some((alias) => normalize(alias) === key || key.includes(normalize(alias)));
    }) || null
  );
}

function getModelNames() {
  return PHONE_MODELS.map((model) => model.name);
}

function getSuggestedPrices(model) {
  return {
    suggestBuy: Math.round(model.priceLow * 0.97),
    suggestSell: Math.round(model.priceMid * 1.06),
  };
}

module.exports = {
  PHONE_MODELS,
  findModel,
  getModelNames,
  getSuggestedPrices,
};
