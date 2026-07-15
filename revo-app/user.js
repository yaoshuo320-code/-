/**
 * V10 用户与收费控制
 * 角色：guest（游客）| pro（付费）
 */
(function (global) {
  const STORAGE_KEY = "v10_user";
  const ROLE = { GUEST: "guest", PRO: "pro" };

  function migrateLegacy() {
    const legacy = localStorage.getItem("v7_plan");
    if (legacy === "paid" || legacy === "paid_pro") {
      return save({ role: ROLE.PRO, subscribedAt: Date.now(), plan: "pro_monthly" });
    }
    return null;
  }

  function save(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  function get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return migrateLegacy() || { role: ROLE.GUEST, subscribedAt: null, plan: null };
  }

  function isPro() {
    return get().role === ROLE.PRO;
  }

  function upgradeToPro() {
    return save({
      role: ROLE.PRO,
      subscribedAt: Date.now(),
      plan: "pro_monthly",
      price: 99,
    });
  }

  function resetToGuest() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("v7_plan");
    return { role: ROLE.GUEST, subscribedAt: null, plan: null };
  }

  function getPlanForEngine() {
    return isPro() ? "pro" : "guest";
  }

  global.UserStore = {
    ROLE,
    STORAGE_KEY,
    get,
    save,
    isPro,
    upgradeToPro,
    resetToGuest,
    getPlanForEngine,
  };
})(typeof window !== "undefined" ? window : globalThis);
