/**
 * 交易判断记录 — localStorage
 */
(function (global) {
  const STORAGE_KEY = "v12_trade_records";
  const MAX_RECORDS = 100;

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECORDS)));
  }

  function add(record) {
    const list = getAll();
    const entry = {
      id: `tr_${Date.now()}`,
      createdAt: Date.now(),
      ...record,
    };
    list.unshift(entry);
    save(list);
    return entry;
  }

  function remove(id) {
    save(getAll().filter((r) => r.id !== id));
  }

  function getSummary() {
    const list = getAll();
    const profits = list.map((r) => r.grossProfit).filter((n) => typeof n === "number");
    return {
      total: list.length,
      avgProfit: profits.length
        ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length)
        : 0,
      goodCount: list.filter((r) => r.verdictLevel === "good").length,
    };
  }

  global.TradeRecordStore = { getAll, add, remove, getSummary };
})(typeof window !== "undefined" ? window : globalThis);
