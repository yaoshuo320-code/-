/**
 * profileData — V1.9 我的 AI经营档案 Mock
 * 定位：商家的 AI 经营数字画像（非普通个人中心）
 * @future userAPI:     GET /api/user/profile
 * @future insightAPI:  GET /api/ai/portrait
 * @future growthAPI:   GET /api/user/growth
 * @future database:    用户系统 + 经营行为库
 */
(function (global) {
  const PROFILE_BRAIN = {
    archive: {
      days: 128,
      daysLabel: "经营时间",
      productCount: 86,
      productLabel: "管理商品数量",
      aiAnalysisCount: 342,
      aiLabel: "累计AI分析次数",
      shopName: "老板的店",
    },

    portrait: {
      mainCategory: "苹果手机 / 配件",
      strength: "苹果产品周转能力强",
      habit: "偏好快周转、小批量补货",
      risk: "高价值库存占用资金较多",
      summary: "你擅长苹果链路的快进快出，建议继续控制高客单库存天数。",
    },

    stats: [
      { key: "buy", label: "累计收货", value: "486件" },
      { key: "sell", label: "累计销售", value: "412件" },
      { key: "profit", label: "平均利润", value: "¥380/台" },
      { key: "turnover", label: "平均周转", value: "11天" },
    ],

    growthLog: [
      {
        date: "07-15",
        advice: "优先处理 MacBook Air M2 积压",
        result: "已卖出 2 台 · 释放资金 ¥8,400",
        status: "done",
      },
      {
        date: "07-14",
        advice: "iPhone15 Pro 可适当加价出售",
        result: "利润 +¥860",
        status: "done",
      },
      {
        date: "07-13",
        advice: "补货 AirPods Pro2",
        result: "已补货 8 件",
        status: "done",
      },
      {
        date: "07-10",
        advice: "控制安卓旗舰收货规模",
        result: "待执行",
        status: "pending",
      },
    ],

    level: {
      name: "成长店长",
      rank: "Lv.3",
      progress: 68,
      next: "下一级：智慧店长",
      tasks: [
        { id: "t1", title: "完成本周 3 次 AI 拍照入库", done: true },
        { id: "t2", title: "处理全部风险库存", done: false },
        { id: "t3", title: "连续 7 天打开经营日报", done: false },
      ],
    },
  };

  global.ProfileData = {
    getBrain() {
      return PROFILE_BRAIN;
    },

    /** @future userAPI */
    async fetchProfile() {
      return PROFILE_BRAIN.archive;
    },

    /** @future insightAPI */
    async fetchPortrait() {
      return PROFILE_BRAIN.portrait;
    },

    /** @future growthAPI */
    async fetchGrowth() {
      return {
        log: PROFILE_BRAIN.growthLog,
        level: PROFILE_BRAIN.level,
      };
    },

    /** @future database */
    async saveProfile(_patch) {
      return { ok: true };
    },
  };
})(window);
