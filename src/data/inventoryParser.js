/**
 * inventoryParser — V1.6 库存文件解析
 * 负责：读取 mock / 用户上传的 CSV（及未来 Excel），转换为库存 JSON
 * @future Excel API:   接入 SheetJS / 服务端解析 .xlsx
 * @future Database API: POST /api/inventory/import 写入商家库存库
 */
(function (global) {
  const FIELD_ALIASES = {
    brand: ["品牌", "brand", "厂牌"],
    model: ["型号", "model", "机型", "商品名称", "商品名"],
    capacity: ["容量", "capacity", "规格"],
    condition: ["成色", "condition", "品相"],
    cost: ["采购价", "成本", "进价", "cost", "价格"],
    qty: ["数量", "qty", "数量（台）", "库存"],
    purchaseDate: ["采购日期", "入库日期", "日期", "purchaseDate", "date"],
  };

  /** 内置 mock CSV，演示商家自有数据闭环（不接外部平台） */
  const MOCK_CSV = [
    "品牌,型号,容量,成色,采购价,数量,采购日期",
    "Apple,iPhone 15 Pro,256GB,95新,5100,8,2026-07-10",
    "Apple,AirPods Pro2,标准版,99新,980,15,2026-07-12",
    "Apple,iPad Pro 11 M2,256GB,95新,4200,4,2026-07-08",
    "Apple,iPhone 14,128GB,95新,3200,6,2026-07-01",
    "Apple,Apple Watch S9,41mm,99新,1850,5,2026-07-09",
    "Apple,MacBook Air M2,8GB+256GB,95新,4200,6,2026-06-20",
    "Apple,iPhone 13 Pro Max,256GB,9新,3800,3,2026-06-28",
    "华为,Mate 50,256GB,95新,2100,4,2026-05-28",
    "Apple,iPad 9,64GB,95新,1100,5,2026-07-02",
    "小米,小米 13,256GB,95新,1600,3,2026-05-30",
  ].join("\n");

  function splitCsvLine(line) {
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
        continue;
      }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  }

  function detectHeaderMap(headers) {
    const map = {};
    headers.forEach((h, idx) => {
      const key = String(h || "").trim().toLowerCase();
      Object.keys(FIELD_ALIASES).forEach((field) => {
        if (map[field] != null) return;
        const aliases = FIELD_ALIASES[field];
        if (aliases.some((a) => a.toLowerCase() === key || key.includes(a.toLowerCase()))) {
          map[field] = idx;
        }
      });
    });
    return map;
  }

  function daysSince(dateStr) {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    if (Number.isNaN(t)) return 0;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }

  function classifyItem(item) {
    if (item.days >= 18) return "risk";
    if (item.days >= 12) return "watch";
    return "healthy";
  }

  function suggestFor(item) {
    if (item.level === "risk") return "优先出售";
    if (item.level === "watch") return "关注价格";
    return "继续持有";
  }

  function normalizeRow(raw, map) {
    const get = (field) => {
      const idx = map[field];
      return idx == null ? "" : String(raw[idx] || "").trim();
    };
    const cost = Number(get("cost")) || 0;
    const qty = Number(get("qty")) || 0;
    const purchaseDate = get("purchaseDate");
    const brand = get("brand");
    const model = get("model");
    const capacity = get("capacity");
    const condition = get("condition");
    const days = daysSince(purchaseDate);
    const capital = cost * qty;
    const item = {
      id: `${brand}-${model}-${capacity}-${purchaseDate}`.replace(/\s+/g, "-").toLowerCase(),
      brand,
      model,
      capacity,
      condition,
      cost,
      qty,
      purchaseDate,
      days,
      capital,
      name: [brand, model, capacity].filter(Boolean).join(" "),
    };
    item.level = classifyItem(item);
    item.suggest = suggestFor(item);
    return item;
  }

  function parseCsvText(text) {
    const lines = String(text || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return { ok: false, message: "文件内容为空或缺少数据行", items: [] };
    }

    const headers = splitCsvLine(lines[0]);
    const map = detectHeaderMap(headers);
    const required = ["brand", "model", "cost", "qty"];
    const missing = required.filter((k) => map[k] == null);
    if (missing.length) {
      return {
        ok: false,
        message: `缺少必要字段：${missing.map((k) => FIELD_ALIASES[k][0]).join("、")}`,
        items: [],
        detected: Object.keys(map),
      };
    }

    const items = lines.slice(1).map((line) => normalizeRow(splitCsvLine(line), map));
    return {
      ok: true,
      count: items.length,
      items,
      detected: Object.keys(map),
      schema: Object.keys(FIELD_ALIASES),
    };
  }

  function summarize(items) {
    const list = items || [];
    const count = list.reduce((s, i) => s + (i.qty || 0), 0);
    const amount = list.reduce((s, i) => s + (i.capital || 0), 0);
    const avgDays = list.length
      ? Math.round(list.reduce((s, i) => s + (i.days || 0) * (i.qty || 1), 0) / Math.max(1, count))
      : 0;
    const riskQty = list.filter((i) => i.level === "risk").reduce((s, i) => s + i.qty, 0);
    const watchQty = list.filter((i) => i.level === "watch").reduce((s, i) => s + i.qty, 0);
    let healthScore = 92;
    if (count) {
      healthScore = Math.max(40, Math.round(92 - (riskQty / count) * 40 - (watchQty / count) * 15));
    }
    return {
      count,
      amount,
      amountText: amount >= 10000 ? `¥${(amount / 10000).toFixed(1)}万` : `¥${amount.toLocaleString()}`,
      avgDays,
      healthScore,
      healthyCount: list.filter((i) => i.level === "healthy").length,
      watchCount: list.filter((i) => i.level === "watch").length,
      riskCount: list.filter((i) => i.level === "risk").length,
    };
  }

  function groupByLevel(items) {
    const buckets = { healthy: [], watch: [], risk: [] };
    (items || []).forEach((item) => {
      const key = item.level || "healthy";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(item);
    });
    return buckets;
  }

  global.InventoryParser = {
    FIELD_ALIASES,
    MOCK_CSV,

    /** 读取内置 mock 文件并转为库存 JSON */
    loadMock() {
      return parseCsvText(MOCK_CSV);
    },

    parseCsvText,
    summarize,
    groupByLevel,
    daysSince,

    /** 读取用户上传的文本文件（CSV） */
    async parseFile(file) {
      if (!file) return { ok: false, message: "未选择文件", items: [] };
      const name = (file.name || "").toLowerCase();
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        // @future Excel API
        return {
          ok: false,
          message: "Excel 解析即将接入，请先使用 CSV 文件",
          items: [],
        };
      }
      const text = await file.text();
      return parseCsvText(text);
    },

    /** @future Database API */
    async saveToDatabase(items) {
      return { ok: true, count: (items || []).length };
    },
  };
})(window);
