/**
 * V11 用户反馈与交易结果 — localStorage 持久化
 */
(function (global) {
  const STORAGE_KEY = "v11_feedback";

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function modelKey(nameOrId) {
    return String(nameOrId || "").toLowerCase().replace(/\s+/g, "-");
  }

  function getForModel(nameOrId) {
    const key = modelKey(nameOrId);
    return getAll()[key] || {};
  }

  function patch(nameOrId, patch) {
    const key = modelKey(nameOrId);
    const all = getAll();
    all[key] = {
      model: nameOrId,
      ...all[key],
      ...patch,
      updatedAt: Date.now(),
    };
    save(all);
    return all[key];
  }

  function setFeedback(nameOrId, type) {
    return patch(nameOrId, { feedback: type });
  }

  function setOutcome(nameOrId, outcome) {
    return patch(nameOrId, { outcome });
  }

  function getSummary() {
    const all = Object.values(getAll());
    return {
      total: all.length,
      helpful: all.filter((r) => r.feedback === "helpful").length,
      inaccurate: all.filter((r) => r.feedback === "inaccurate").length,
      bought: all.filter((r) => r.outcome === "bought").length,
      sold: all.filter((r) => r.outcome === "sold").length,
      noDeal: all.filter((r) => r.outcome === "no_deal").length,
    };
  }

  global.FeedbackStore = {
    modelKey,
    getAll,
    getForModel,
    setFeedback,
    setOutcome,
    getSummary,
  };
})(typeof window !== "undefined" ? window : globalThis);
