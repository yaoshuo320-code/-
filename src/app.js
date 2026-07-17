/**
 * Revo — AI资产价值判断平台 App bootstrap
 */
(function () {
  const PriceBrain = window.PriceBrain;
  const TradeEngine = window.TradeEngine;
  const TradeRecordStore = window.TradeRecordStore;
  const MarketHeat = window.MarketHeat;
  const IndustryData = window.IndustryData;
  const HomeData = window.HomeData;

  const LAST_PAGE_KEY = "revo_last_page_v1";
  // V2 结构：3 个一级 Tab（生意 / 智脑 / 市场），旧页面映射到所属 Tab 以保持高亮
  const PAGE_TO_TAB = {
    business: "business",
    inventory: "business",
    "inventory-import": "business",
    "inventory-capture": "business",
    "inventory-capture-result": "business",
    "inventory-confirm": "business",
    "inventory-detail": "business",
    buy: "business",
    sell: "business",
    brain: "brain",
    profile: "brain",
    market: "market",
    industry: "market",
    opportunity: "market",
    // search（问 Revo）不抢占智脑高亮，保持旧行为
  };
  let currentPage = "brain";
  let activeCategory = "all";
  let industrySector = "phone";
  let industryDrillSector = "phone";
  let industryProductId = "iphone";
  let inventoryDetailId = null;

  const OPP_MODEL_MAP = {
    iphone15pro: { brand: "Apple", model: "iPhone 15 Pro", capacity: "256GB", condition: "95新" },
    macbookairm2: { brand: "Apple", model: "MacBook Air M2", capacity: "8GB+256GB", condition: "95新" },
    iphone16: { brand: "Apple", model: "iPhone 16", capacity: "256GB", condition: "95新" },
  };

  function saveLastPage(page) {
    try {
      localStorage.setItem(LAST_PAGE_KEY, page);
    } catch { /* ignore */ }
  }

  function readLastPage() {
    try {
      return localStorage.getItem(LAST_PAGE_KEY);
    } catch {
      return null;
    }
  }

  function isPro() { return window.UserStore.isPro(); }
  function riskClass(l) { return l === "good" || l === "strong" ? "good" : l === "bad" ? "bad" : "warn"; }

  function setCategory(cat) {
    activeCategory = cat;
    refreshCurrentPage();
  }

  function refreshCurrentPage() {
    if (currentPage === "brain") renderHomePage();
    if (currentPage === "profile") renderProfilePage();
    if (currentPage === "business") renderBusinessPage();
    if (currentPage === "market") renderMarketPage();
    if (currentPage === "inventory") renderInventoryPage();
    if (currentPage === "inventory-import") renderInventoryImportPage();
    if (currentPage === "inventory-capture") renderInventoryCapturePage();
    if (currentPage === "inventory-capture-result") renderInventoryCaptureResultPage();
    if (currentPage === "inventory-confirm") renderInventoryConfirmPage();
    if (currentPage === "inventory-detail") renderInventoryDetailPage();
    if (currentPage === "buy") renderBuyPage();
    if (currentPage === "search") renderSearchPage();
    if (currentPage === "sell") renderSellPage();
    if (currentPage === "opportunity") renderOpportunityPage();
    if (currentPage === "industry") renderIndustryPage();
  }

  function renderCategoryFilter(containerId, theme) {
    CategoryFilter.render(containerId, { active: activeCategory, theme, onChange: setCategory });
  }

  function updateHeader(page) {
    const header = document.getElementById("appHeader");
    const titles = {
      brain: ["Revo", "AI店长 · 今日经营助手"],
      profile: ["AI经营档案", "商家的 AI 经营数字画像"],
      business: ["生意", "管理自己的经营 · 库存 利润 收货 卖货"],
      market: ["市场大脑", "理解市场变化 · 发现经营机会"],
      inventory: ["我的库存大脑", "库存决策 · 赚钱机会与风险"],
      "inventory-import": ["导入库存", "支持 Excel / CSV · 字段自动识别"],
      "inventory-capture": ["AI拍照入库", "上传商品图 · 自动生成库存卡"],
      "inventory-capture-result": ["识别结果", "AI 识别与价值判断"],
      "inventory-confirm": ["入库确认", "确认采购信息 · 加入库存大脑"],
      "inventory-detail": ["商品详情", "利润 · 周期 · AI经营建议"],
      buy: ["收货热度", "发现值得收的资产 · 趋势与资金效率"],
      search: ["问 Revo", "输入型号，30秒判断是否值得交易"],
      sell: ["销售热度", "周转速度 · 利润效率 · 资金占用"],
      opportunity: ["未来机会", "新品周期 · 需求变化 · 机会标签"],
      industry: ["行业生命周期地图", "二手3C · 淡旺季与备货节奏"],
    };
    const [title, sub] = titles[page] || titles.brain;
    document.getElementById("appTitle").textContent = title;
    document.getElementById("appSubtitle").textContent = sub;
    document.body.dataset.page = page;
    if (header) {
      // 智脑 / 库存大脑 / 生意 / 市场 均使用页面内欢迎区，隐藏全局 Header
      const hideHeader = ["brain", "profile", "inventory", "inventory-import", "inventory-capture", "inventory-capture-result", "inventory-confirm", "inventory-detail", "business", "market"].includes(page);
      header.classList.toggle("header-minimal", hideHeader);
      header.classList.toggle("header-hidden", hideHeader);
    }
  }

  function toast(msg) {
    let el = document.getElementById("revoToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "revoToast";
      el.className = "revo-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function openProductAnalysis(id) {
    const query = OPP_MODEL_MAP[id];
    if (query) {
      navigate("search");
      setTimeout(() => handleSearch(query), 50);
      return;
    }
    navigate("opportunity");
  }

  function renderHomePage() {
    const mount = document.getElementById("homePageMount");
    if (mount) mount.innerHTML = "";

    HomePage.render("homePageMount", {
      data: HomeData.getAiDaily(),
      onOppClick: openProductAnalysis,
      onAskRevo: () => navigate("search"),
      onAskMode: (mode) => {
        if (mode === "type") {
          navigate("search");
          return;
        }
        if (mode === "photo") {
          navigate("inventory-capture");
          return;
        }
        toast("语音描述即将上线，先试试拍照或输入型号");
        navigate("search");
      },
      onIndustryClick: () => navigate("industry"),
      onMessage: () => toast("暂无新消息"),
      onSettings: () => navigate("profile"),
    });

    if (window.FirstExperience && window.DemoExperienceData) {
      FirstExperience.render("firstExperienceMount", {
        toast,
        onStartPhoto: () => navigate("inventory-capture"),
        onStartType: () => navigate("search"),
        onComplete: () => {
          HomePage.markGuideSeen && HomePage.markGuideSeen();
        },
      });
    }

    if (window.AIDailyReport && window.DailyReportData) {
      AIDailyReport.render("aiDailyReportMount", {
        data: DailyReportData.getReport(),
        onActionClick: (item) => {
          if (!item) return;
          if (item.type === "risk") {
            navigate("inventory");
            return;
          }
          if (item.type === "opportunity") {
            navigate("buy");
            return;
          }
          if (item.type === "profit") {
            navigate("sell");
            return;
          }
          toast(`${item.label}：${item.name} · ${item.suggest}`);
        },
        onHistoryClick: (item) => {
          if (!item) return;
          toast(`${item.date} · ${item.advice} → ${item.result}`);
        },
      });
    }

    if (window.DailyInsight && window.DailyInsightData) {
      DailyInsight.render("dailyInsightMount", {
        data: DailyInsightData.getInsights(),
        onCardClick: (item) => {
          if (!item) return;
          const link = item.link || {};
          if (link.page === "inventory-detail" && link.itemId) {
            inventoryDetailId = link.itemId;
            navigate("inventory-detail");
            return;
          }
          if (link.page === "inventory") {
            navigate("inventory");
            return;
          }
          if (link.page === "buy" || link.page === "sell") {
            navigate(link.page);
            return;
          }
          toast(`${item.title}：${item.text}`);
        },
      });
    }

    if (window.InventoryBrain && window.InventoryData) {
      InventoryBrain.render("inventoryBrainMount", {
        data: InventoryData.getBrain(),
        onImport: (schema) => {
          const fields = (schema || []).map((f) => f.label).join("、");
          toast(`即将支持 Excel / CSV 导入（${fields}）`);
        },
        onDiagClick: (item) => {
          if (!item) return;
          toast(`${item.title}：${item.name} · ${item.suggest}`);
        },
      });
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-brain");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderProfilePage() {
    // V1.9：我的 AI经营档案（数字画像）
    const mount = document.getElementById("profilePageMount");
    if (mount) mount.innerHTML = "";

    ProfileBrain.render("profilePageMount", {
      data: ProfileData.getBrain(),
      onBack: () => navigate("brain"),
      onLogClick: (item) => {
        if (!item) return;
        toast(`${item.date} · ${item.advice} → ${item.result}`);
      },
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-profile");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryPage() {
    // V1.9：库存大脑闭环首页
    const mount = document.getElementById("inventoryPageMount");
    if (mount) mount.innerHTML = "";

    InventoryDashboard.render("inventoryPageMount", {
      onCapture: () => navigate("inventory-capture"),
      onImport: () => navigate("inventory-import"),
      onItemClick: (item) => {
        if (!item) return;
        inventoryDetailId = item.id;
        navigate("inventory-detail");
      },
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryImportPage() {
    const mount = document.getElementById("inventoryImportMount");
    if (mount) mount.innerHTML = "";

    InventoryImport.render("inventoryImportMount", {
      toast,
      onBack: () => navigate("inventory"),
      onImported: () => navigate("inventory"),
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory-import");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryCapturePage() {
    const mount = document.getElementById("inventoryCaptureMount");
    if (mount) mount.innerHTML = "";

    AIInventoryCapture.render("inventoryCaptureMount", {
      toast,
      onBack: () => navigate("inventory"),
      onRecognized: () => navigate("inventory-capture-result"),
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory-capture");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryCaptureResultPage() {
    const mount = document.getElementById("inventoryCaptureResultMount");
    if (mount) mount.innerHTML = "";

    InventoryCaptureResult.render("inventoryCaptureResultMount", {
      toast,
      onBack: () => navigate("inventory-capture"),
      onRetry: () => {
        if (window.InventoryBrainData) InventoryBrainData.clearPendingCapture();
        navigate("inventory-capture");
      },
      onConfirm: () => navigate("inventory-confirm"),
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory-capture-result");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryConfirmPage() {
    const mount = document.getElementById("inventoryConfirmMount");
    if (mount) mount.innerHTML = "";

    InventoryConfirm.render("inventoryConfirmMount", {
      toast,
      onBack: () => navigate("inventory-capture-result"),
      onSuccess: (item) => {
        inventoryDetailId = item && item.id;
        if (window.DemoExperienceData) DemoExperienceData.markDone();
        navigate("inventory");
      },
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory-confirm");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderInventoryDetailPage() {
    const mount = document.getElementById("inventoryDetailMount");
    if (mount) mount.innerHTML = "";

    InventoryDetail.render("inventoryDetailMount", {
      itemId: inventoryDetailId,
      toast,
      onBack: () => navigate("inventory"),
      onAction: (action, item) => {
        if (!item) return;
        if (action === "watch") {
          if (window.DailyInsightData) DailyInsightData.addWatch(item);
          toast(`已加入关注：${item.name}`);
          return;
        }
        if (action === "sell-alert") {
          if (window.DailyInsightData) DailyInsightData.setSellAlert(item);
          toast(`已设置出售提醒：${item.name}`);
          return;
        }
        if (action === "sell-now") {
          toast(`去卖货：${item.name}`);
          navigate("sell");
        }
      },
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-inventory-detail");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function hubEnter(item) {
    if (!item) return;
    if (item.soon) {
      toast(`${item.title} 即将上线`);
      return;
    }
    navigate(item.page);
  }

  function renderBusinessPage() {
    // V1.5 生意驾驶舱：回答「我的生意现在怎么样？」
    const mount = document.getElementById("businessPageMount");
    if (mount) mount.innerHTML = "";

    BusinessPage.render("businessPageMount", {
      data: BusinessData.getDashboard(),
      onDiagClick: (item) => {
        if (!item) return;
        if (item.type === "risk") {
          navigate("inventory");
          return;
        }
        if (item.type === "profit") {
          navigate("buy");
          return;
        }
        toast(`${item.title}：${item.suggest}`);
      },
      onScoreClick: (item) => {
        if (!item) return;
        if (item.page) {
          navigate(item.page);
          return;
        }
        toast(`${item.label} ${item.value} 分 · 详细分析即将上线`);
      },
      onQuickNav: (page) => navigate(page),
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-business");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderMarketPage() {
    // V1.8：市场 = 市场大脑（AI 分析中心，非价格查询）
    const mount = document.getElementById("marketPageMount");
    if (mount) mount.innerHTML = "";

    MarketBrain.render("marketPageMount", {
      data: MarketData.getBrain(),
      onCategoryClick: (item) => {
        if (!item) return;
        toast(`${item.name} · ${item.judge}`);
      },
      onOppClick: (item) => {
        if (!item) return;
        if (item.id === "opp-iphone15pro") {
          navigate("buy");
          return;
        }
        toast(`${item.name} · ${item.suggest}`);
      },
      onPriceClick: (item) => {
        if (!item) return;
        toast(`${item.name} 区间 ${item.range} · ${item.judge}`);
      },
      onDeepLink: (page) => navigate(page),
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    const pageEl = document.getElementById("page-market");
    if (pageEl) pageEl.scrollTop = 0;
  }

  function renderBuyPage() {
    renderCategoryFilter("buyCategoryFilter", "buy");
    const list = MarketHeat.getHeatMap("buy", activeCategory);
    HeatMap.render("buyHeatMap", { mode: "buy", list, detailPanelId: "buyDetail" });
    document.getElementById("buyDetail").classList.remove("show");
  }

  function renderSellPage() {
    renderCategoryFilter("sellCategoryFilter", "sell");
    const list = MarketHeat.getHeatMap("sell", activeCategory);
    HeatMap.render("sellHeatMap", { mode: "sell", list, detailPanelId: "sellDetail" });
    document.getElementById("sellDetail").classList.remove("show");
  }

  function renderOpportunityPage() {
    renderCategoryFilter("oppCategoryFilter", "opportunity");
    const list = MarketHeat.getHeatMap("future", activeCategory);
    HeatMap.render("oppHeatMap", { mode: "future", list, detailPanelId: "oppDetail" });
    document.getElementById("oppDetail").classList.remove("show");
  }

  function renderSearchPage() {
    SearchBox.render("searchBoxMount", { onSearch: handleSearch });
  }

  function setIndustrySector(sector) {
    industrySector = sector;
    industryDrillSector = sector === "all" ? null : sector;
    const products = (window.SeasonTrendData && SeasonTrendData.getProductsBySector(sector)) || [];
    const preferred = products.find((p) => p.hasCurve) || products[0];
    industryProductId = preferred ? preferred.id : null;
    renderIndustryPage();
  }

  function drillIndustrySector(sector) {
    setIndustrySector(sector);
  }

  function setIndustryProduct(productId) {
    industryProductId = productId;
    renderIndustryPage();
  }

  function renderIndustryPage() {
    IndustryTrend.renderSectorFilter("industrySectorFilter", {
      active: industrySector,
      onChange: setIndustrySector,
    });

    const heatItems = IndustryData.getSectorHeat("all");
    const activeKey = industryDrillSector || (industrySector !== "all" ? industrySector : null);

    BarChart.renderIndustryBars("industryHeatChart", {
      items: heatItems,
      activeKey,
      onSelect: drillIndustrySector,
    });

    const trendSector = industryDrillSector || (industrySector !== "all" ? industrySector : null);

    IndustryTrend.renderProductTabs("industryProductTabs", {
      sector: trendSector,
      activeProductId: industryProductId,
      onSelect: setIndustryProduct,
    });

    const chartEl = document.getElementById("industrySeasonChart");
    if (chartEl && window.SeasonTrendChart) {
      if (industryProductId) {
        SeasonTrendChart.render("industrySeasonChart", {
          productId: industryProductId,
          showInsight: true,
        });
      } else {
        chartEl.innerHTML = `<div class="stc-empty">选择三级品类查看全年趋势曲线</div>`;
      }
    }

    IndustryTrend.renderAiAdvice("industryAiAdvice", {
      advice: IndustryData.getAiAdvice(trendSector || "all"),
    });
  }

  function parseSearchInput(input) {
    const brand = input.brand?.trim();
    const model = input.model?.trim();
    const capacity = input.capacity === "—" ? "" : (input.capacity || "256GB");
    const condition = input.condition || "95新";
    if (!brand || !model) return null;

    const product = PriceBrain.findProduct(brand, model, capacity);
    if (!product) return null;

    const prices = PriceBrain.resolvePrices(product, { brand, capacity, condition, battery: 90 });
    const buyMid = Math.round((prices.buyMin + prices.buyMax) / 2);

    return TradeEngine.analyzeTradeProfit({
      brand,
      model,
      capacity: capacity || product.capacity,
      condition,
      battery: 90,
      buyPrice: buyMid,
    });
  }

  function buildRiskRadar(result) {
    const liquidity = result.liquidity || 5;
    const priceRisk = result.quoteAdvantageType === "high" ? 30 : result.quoteAdvantageType === "low" ? 70 : 45;
    const inventoryRisk = liquidity >= 8 ? 25 : liquidity >= 6 ? 50 : 75;
    const repairRisk = result.condition === "功能异常" || result.condition === "大花" ? 85
      : result.risk === "高" ? 70 : result.risk === "中" ? 45 : 25;
    const flowRisk = liquidity >= 9 ? 20 : liquidity >= 7 ? 40 : 65;
    const toLevel = (v) => (v <= 35 ? "低" : v <= 60 ? "中" : "高");

    return [
      { label: "价格风险", value: priceRisk, level: toLevel(priceRisk) },
      { label: "库存风险", value: inventoryRisk, level: toLevel(inventoryRisk) },
      { label: "维修风险", value: repairRisk, level: toLevel(repairRisk) },
      { label: "流通风险", value: flowRisk, level: toLevel(flowRisk) },
    ];
  }

  function buildTrendTags(result) {
    const tags = [];
    const liquidity = result.liquidity || 5;
    if (result.verdictLevel === "strong" || result.verdictLevel === "good") {
      tags.push({ type: "up", icon: "↑", label: "价格上涨12%" });
    }
    if (liquidity >= 7) tags.push({ type: "hot", icon: "🔥", label: "需求增加" });
    if (liquidity <= 5) tags.push({ type: "warn", icon: "⚠", label: "库存增加" });
    return tags;
  }

  function calcValueScore(result) {
    const liquidity = result.liquidity || 5;
    let score = 60;
    if (result.verdictLevel === "strong") score = 92;
    else if (result.verdictLevel === "good") score = 85;
    else if (result.verdictLevel === "warn") score = 62;
    else score = 45;
    score += Math.min(8, liquidity);
    return Math.min(99, score);
  }

  const WATCH_KEY = "price_brain_watchlist_v1";
  function getWatchlist() {
    try { return JSON.parse(localStorage.getItem(WATCH_KEY) || "[]"); } catch { return []; }
  }
  function isWatched(id) { return getWatchlist().some((w) => w.id === id); }
  function toggleWatch(item) {
    const list = getWatchlist();
    const idx = list.findIndex((w) => w.id === item.id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push({ id: item.id, name: item.name, addedAt: Date.now() });
    localStorage.setItem(WATCH_KEY, JSON.stringify(list));
  }

  function formatSearchResult(result, input) {
    const riskRadar = buildRiskRadar(result);
    const riskSimple = riskRadar.reduce((best, r) => {
      const order = { 高: 3, 中: 2, 低: 1 };
      return order[r.level] > order[best] ? r.level : best;
    }, "低");

    return {
      ...result,
      brand: result.brand || input.brand,
      model: result.model || input.model,
      capacity: result.capacity || input.capacity,
      condition: result.condition || input.condition,
      valueScore: calcValueScore(result),
      buyRangeText: result.buyRangeText ? `${result.buyRangeText}` : "—",
      sellRangeText: result.merchantOutRangeText ? `${result.merchantOutRangeText}` : "—",
      profitRangeText: result.profitRangeText
        ? `+${String(result.profitRangeText).replace(/^[+¥]/g, "").split("-")[0] || result.profitRangeText}`
        : "—",
      marginText: result.marginText || "—",
      dealerRangeText: result.merchantOutRangeText || "—",
      dealRangeText: result.actualDealRangeText || "—",
      marketRangeText: result.listingRangeText || "—",
      compositeRangeText: result.listingRangeText && result.buyRangeText
        ? `收货 ${result.buyRangeText} · 出货 ${result.merchantOutRangeText || result.sellRangeText}`
        : "—",
      riskRadar,
      riskSimple,
      trendTags: buildTrendTags(result),
      aiAdvice: result.verdict || "当前适合买入",
      watched: isWatched(result.productId || `${input.brand}-${input.model}`),
      watchId: result.productId || `${input.brand}-${input.model}`,
    };
  }

  function handleSearchAction(action, data) {
    if (action === "buy") {
      navigate("buy");
      const modelEl = document.getElementById("tradeModel");
      const brandEl = document.getElementById("tradeBrand");
      const capEl = document.getElementById("tradeCapacity");
      const condEl = document.getElementById("tradeCondition");
      if (brandEl && data.brand) brandEl.value = data.brand;
      if (modelEl && data.model) modelEl.value = data.model;
      if (capEl && data.capacity && data.capacity !== "—") capEl.value = data.capacity;
      if (condEl && data.condition) condEl.value = data.condition;
      return;
    }
    if (action === "sell") {
      navigate("sell");
      return;
    }
    if (action === "watch") {
      toggleWatch({ id: data.watchId, name: data.productName });
      ProductCard.render("searchResult", {
        ...data,
        watched: isWatched(data.watchId),
        onAction: handleSearchAction,
      });
    }
  }

  function handleSearch(input) {
    if (!input || (!input.model && typeof input === "string" && !input.trim())) {
      ProductCard.render("searchResult", null);
      return;
    }

    const query = typeof input === "string" ? { brand: "Apple", model: input.trim(), capacity: "256GB", condition: "95新" } : input;
    SearchBox.fillForm(query);

    const result = parseSearchInput(query);
    if (!result || !result.ok) {
      ProductCard.render("searchResult", {
        productName: `${query.brand} ${query.model}`,
        brand: query.brand,
        model: query.model,
        capacity: query.capacity,
        condition: query.condition,
        valueScore: 55,
        buyRangeText: "—",
        sellRangeText: "—",
        profitRangeText: "—",
        marginText: "—",
        turnoverDays: "—",
        priceConfidence: "低",
        priceConfidenceHint: "该型号暂未进入价格大脑，建议人工核价",
        dealerRangeText: "—",
        dealRangeText: "—",
        marketRangeText: "—",
        compositeRangeText: "—",
        verdictLevel: "warn",
        riskSimple: "中",
        trendTags: [{ type: "warn", icon: "⚠", label: "数据不足" }],
        aiAdvice: "建议人工核价后再判断",
        riskRadar: [
          { label: "价格风险", value: 70, level: "高" },
          { label: "库存风险", value: 55, level: "中" },
          { label: "维修风险", value: 50, level: "中" },
          { label: "流通风险", value: 60, level: "中" },
        ],
        watched: isWatched(`${query.brand}-${query.model}`),
        watchId: `${query.brand}-${query.model}`,
        onAction: handleSearchAction,
      });
      syncCollectFromSearch(query.model, null, query);
      return;
    }

    const formatted = formatSearchResult(result, query);
    formatted.onAction = handleSearchAction;
    ProductCard.render("searchResult", formatted);
    syncCollectFromSearch(query.model, result, query);
  }

  function syncCollectFromSearch(q, result, input) {
    const brand = result?.brand || input?.brand || "Apple";
    const model = result?.model || input?.model || q;
    const capacity = result?.capacity || input?.capacity || "256GB";
    const condition = result?.condition || input?.condition || "95新";
    document.getElementById("collectBrand").value = brand;
    document.getElementById("collectModel").value = model;
    document.getElementById("collectCapacity").value = capacity === "—" ? "" : capacity;
    document.getElementById("collectCondition").value = condition;
  }

  function buildCollectKeyword(values) {
    return [values.brand, values.model, values.capacity, values.condition, "二手"].filter(Boolean).join(" ");
  }

  function collectPlatforms(keyword) {
    const encoded = encodeURIComponent(keyword);
    return [
      { name: "京东搜索", url: `https://search.jd.com/Search?keyword=${encoded}` },
      { name: "闲鱼搜索", url: `https://www.goofish.com/search?q=${encoded}` },
      { name: "转转搜索", url: `https://www.zhuanzhuan.com/search?keyword=${encoded}` },
      { name: "爱回收搜索", url: `https://www.aihuishou.com/search?keyword=${encoded}` },
      { name: "华强北报价", keyword: `${keyword} 华强北 报价`, url: null },
    ];
  }

  function renderCollectLinks() {
    const values = {
      brand: document.getElementById("collectBrand").value.trim(),
      model: document.getElementById("collectModel").value.trim(),
      capacity: document.getElementById("collectCapacity").value.trim(),
      condition: document.getElementById("collectCondition").value.trim(),
    };
    const box = document.getElementById("collectLinks");
    const status = document.getElementById("collectStatus");
    if (!values.model) {
      status.style.color = "#b91c1c";
      status.textContent = "请先填写型号信息";
      return;
    }
    status.textContent = "";
    status.style.color = "#F6A623";
    const keyword = buildCollectKeyword(values);
    box.innerHTML = collectPlatforms(keyword).map((platform) => `
      <div class="collect-item">
        <strong>${platform.name}</strong>
        <div>关键词：<span class="collect-keyword">${platform.keyword || keyword}</span></div>
        ${platform.url
          ? `<a class="collect-action" href="${platform.url}" target="_blank" rel="noreferrer">查看价格 🔗</a>`
          : `<span class="collect-action collect-copy">复制关键词</span>`}
      </div>`).join("");
    box.classList.add("show");
  }

  function saveManualPriceSku() {
    const values = {
      brand: document.getElementById("collectBrand").value.trim(),
      model: document.getElementById("collectModel").value.trim(),
      capacity: document.getElementById("collectCapacity").value.trim(),
      condition: document.getElementById("collectCondition").value.trim(),
    };
    const status = document.getElementById("collectStatus");
    try {
      const saved = PriceBrain.saveManualSku({
        ...values,
        marketMin: document.getElementById("manualMarketMin").value,
        marketMax: document.getElementById("manualMarketMax").value,
        transactionPrice: document.getElementById("manualTransaction").value,
        dealerPrice: document.getElementById("manualDealer").value,
        buyPrice: document.getElementById("manualBuy").value,
        liquidity: document.getElementById("manualLiquidity").value,
        confidence: "中",
        risk: "中",
        riskLevel: "mid",
        turnoverDays: "人工采集",
      });
      status.style.color = "#F6A623";
      status.textContent = `✓ 已保存到本地价格库：${saved.model} ${saved.capacity}`;
    } catch (err) {
      status.style.color = "#b91c1c";
      status.textContent = err.message || "保存失败";
    }
  }

  function toggleBatteryField() {
    const brand = document.getElementById("tradeBrand").value;
    document.getElementById("batteryGroup").classList.toggle("hidden", !TradeEngine.isPhoneBrand(brand));
  }

  function renderTradeResult(r) {
    const icon = r.verdictLevel === "strong" ? "🔥" : r.verdictLevel === "good" ? "✅" : r.verdictLevel === "bad" ? "❌" : "⚠️";
    return `
      <div class="result-section">
        <h3>【价格层级】</h3>
        <div class="result-row"><label>市场挂牌价</label><span class="range-value">¥${r.listingRangeText}</span></div>
        <div class="result-row"><label>实际成交价</label><span class="range-value">¥${r.actualDealRangeText}</span></div>
        <div class="result-row"><label>成交价中位数</label><span>¥${r.actualDealAvg}</span></div>
        <div class="result-row"><label>商家出货价</label><span class="range-value">¥${r.merchantOutRangeText}</span></div>
      </div>
      <div class="result-section">
        <h3>【收货判断】</h3>
        <div class="result-row"><label>合理收货</label><span class="range-value">¥${r.buyRangeText}</span></div>
        <div class="result-row"><label>你的报价</label><span>¥${r.buyCost}</span></div>
        <div class="result-row"><label>报价优势</label><span>${r.quoteAdvantage}</span></div>
      </div>
      <div class="result-section">
        <h3>【利润分析】</h3>
        <div class="result-row"><label>预计净利润</label><span class="range-value" style="color:#F6A623">¥${r.profitRangeText}</span></div>
        <div class="result-row"><label>利润率</label><span>${r.marginText}</span></div>
        <div class="result-row"><label>风险扣减</label><span>¥${r.riskCostText}</span></div>
      </div>
      <div class="result-section">
        <h3>【AI 建议】</h3>
        <div class="result-verdict ${riskClass(r.verdictLevel)}">${icon} ${r.verdict}</div>
        <ul class="explain-list">${r.explanations.map((e) => `<li>${e}</li>`).join("")}</ul>
      </div>`;
  }

  function navigate(page) {
    // 智脑是主入口：任意页点击都强制回到 Dashboard 并重新渲染
    const target = page === "home" ? "brain" : page;
    currentPage = target;
    saveLastPage(target);

    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(`page-${target}`)?.classList.add("active");

    // V2：子页面高亮所属一级 Tab（生意/智脑/市场）；问 Revo(search) 不抢占高亮
    BottomNav.setActive(PAGE_TO_TAB[target] || null);
    updateHeader(target);

    if (target === "brain") {
      renderHomePage();
      return;
    }
    if (target === "profile") {
      renderProfilePage();
      return;
    }
    if (target === "business") {
      renderBusinessPage();
      return;
    }
    if (target === "market") {
      renderMarketPage();
      return;
    }
    if (target === "inventory") {
      renderInventoryPage();
      return;
    }
    if (target === "inventory-import") {
      renderInventoryImportPage();
      return;
    }
    if (target === "inventory-capture") {
      renderInventoryCapturePage();
      return;
    }
    if (target === "inventory-capture-result") {
      renderInventoryCaptureResultPage();
      return;
    }
    if (target === "inventory-confirm") {
      renderInventoryConfirmPage();
      return;
    }
    if (target === "inventory-detail") {
      renderInventoryDetailPage();
      return;
    }
    if (target === "buy") renderBuyPage();
    if (target === "search") {
      renderSearchPage();
      ProductCard.render("searchResult", null);
    }
    if (target === "sell") renderSellPage();
    if (target === "opportunity") renderOpportunityPage();
    if (target === "industry") renderIndustryPage();
  }

  function updateUserUI() {
    const pro = isPro();
    document.getElementById("userBadge").textContent = pro ? "Pro" : "游客";
    document.getElementById("userBadge").className = `user-badge ${pro ? "pro" : "guest"}`;
    document.getElementById("headerUpgrade").style.display = pro ? "none" : "block";
  }

  function openPaywall() { document.getElementById("paywallModal").classList.add("show"); }
  function closePaywall() { document.getElementById("paywallModal").classList.remove("show"); }

  function bindEvents() {
    HeatMap.bind("buyHeatMap", "buyDetail", MarketHeat.getDetail);
    HeatMap.bind("sellHeatMap", "sellDetail", MarketHeat.getDetail);
    HeatMap.bind("oppHeatMap", "oppDetail", MarketHeat.getDetail);

    document.getElementById("tradeBrand").onchange = toggleBatteryField;
    document.getElementById("tradeSubmit").onclick = () => {
      const r = TradeEngine.analyzeTradeProfit({
        brand: document.getElementById("tradeBrand").value,
        model: document.getElementById("tradeModel").value,
        capacity: document.getElementById("tradeCapacity").value,
        condition: document.getElementById("tradeCondition").value,
        battery: document.getElementById("tradeBattery").value,
        buyPrice: document.getElementById("tradeBuyPrice").value,
      });
      const box = document.getElementById("tradeResult");
      if (!r.ok) {
        box.innerHTML = `<div class="result-section"><p style="color:#b91c1c;font-weight:700">${r.message}</p></div>`;
        box.classList.add("show");
        return;
      }
      box.innerHTML = renderTradeResult(r);
      box.classList.add("show");
      TradeRecordStore.add({
        productName: r.productName,
        buyCost: r.buyCost,
        listingRangeText: r.listingRangeText,
        actualDealRangeText: r.actualDealRangeText,
        merchantOutRangeText: r.merchantOutRangeText,
        sellRangeText: r.sellRangeText,
        buyRangeText: r.buyRangeText,
        quoteAdvantage: r.quoteAdvantage,
        riskCostText: r.riskCostText,
        profitRangeText: r.profitRangeText,
        marginText: r.marginText,
        priceConfidence: r.priceConfidence,
        verdict: r.verdict,
        verdictLevel: r.verdictLevel,
      });
    };

    document.getElementById("collectGenerateBtn").onclick = renderCollectLinks;
    document.getElementById("manualSaveBtn").onclick = saveManualPriceSku;
    document.getElementById("headerUpgrade").onclick = openPaywall;
    document.getElementById("userBadge").onclick = () => { if (!isPro()) openPaywall(); };
    document.getElementById("brandHomeBtn").onclick = () => navigate("brain");
    document.querySelectorAll(".modal-close").forEach((b) => b.onclick = () => closePaywall());
    document.getElementById("paywallModal").onclick = (e) => { if (e.target.id === "paywallModal") closePaywall(); };
    document.getElementById("subscribeBtn").onclick = () => {
      UserStore.upgradeToPro();
      closePaywall();
      updateUserUI();
    };

    BottomNav.render("bottomNavMount", { active: "brain", onNavigate: navigate });
  }

  function init() {
    toggleBatteryField();
    updateUserUI();
    bindEvents();
    // 优先展示智脑；仍写入 / 保留 last page，但不覆盖默认入口
    readLastPage();
    SplashScreen.show(() => navigate("brain"));
  }

  init();
})();
