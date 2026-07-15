/**
 * SearchBox — Revo AI Value Engine entry.
 */
(function (global) {
  const HOT_PICKS = [
    { label: "iPhone15 Pro", brand: "Apple", model: "iPhone 15 Pro", capacity: "256GB", condition: "95新" },
    { label: "MacBook Air M2", brand: "Apple", model: "MacBook Air M2", capacity: "8GB+256GB", condition: "95新" },
    { label: "AirPods Pro2", brand: "Apple", model: "AirPods Pro 2", capacity: "—", condition: "95新" },
  ];

  global.SearchBox = {
    HOT_PICKS,

    render(containerId, { onSearch }) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = `
        <div class="search-hero">
          <div class="search-kicker">REVO 智脑</div>
          <div class="search-title">✨ 问 Revo</div>
          <div class="search-subtitle">输入型号，30秒判断是否值得交易</div>
        </div>
        <div class="search-form-card">
          <div class="search-form-grid">
            <label class="search-field">
              <span>品牌</span>
              <select class="search-input" id="searchBrand">
                <option value="Apple">Apple</option>
                <option value="华为">华为</option>
                <option value="三星">三星</option>
                <option value="其他">其他</option>
              </select>
            </label>
            <label class="search-field">
              <span>型号</span>
              <input class="search-input" id="searchModel" placeholder="如 iPhone 15 Pro" autocomplete="off" />
            </label>
            <label class="search-field">
              <span>容量</span>
              <select class="search-input" id="searchCapacity">
                <option value="128GB">128GB</option>
                <option value="256GB" selected>256GB</option>
                <option value="512GB">512GB</option>
                <option value="8GB+256GB">8GB+256GB</option>
                <option value="16GB+512GB">16GB+512GB</option>
                <option value="—">—</option>
              </select>
            </label>
            <label class="search-field">
              <span>成色</span>
              <select class="search-input" id="searchCondition">
                <option value="99新">99新</option>
                <option value="95新" selected>95新</option>
                <option value="9成新">9成新</option>
                <option value="8成新">8成新</option>
                <option value="大花">大花</option>
                <option value="功能异常">功能异常</option>
              </select>
            </label>
          </div>
          <button type="button" class="search-run-btn" id="searchRunBtn">
            <span class="search-run-icon">✦</span>
            <span>AI 价值判断</span>
          </button>
          <button type="button" class="search-photo-btn" id="searchPhotoBtn" disabled title="即将上线">
            <span>📷</span><span>拍照识别</span><em>预留</em>
          </button>
        </div>
        <div class="search-hot">
          <div class="search-hot-label">今日热门判断</div>
          <div class="search-hot-row">
            ${HOT_PICKS.map((p, i) => `
              <button type="button" class="search-hot-chip" data-hot="${i}">${p.label}</button>
            `).join("")}
          </div>
        </div>`;

      const run = () => {
        onSearch({
          brand: document.getElementById("searchBrand").value,
          model: document.getElementById("searchModel").value.trim(),
          capacity: document.getElementById("searchCapacity").value,
          condition: document.getElementById("searchCondition").value,
        });
      };

      document.getElementById("searchRunBtn").onclick = run;
      document.getElementById("searchModel").onkeydown = (e) => { if (e.key === "Enter") run(); };

      el.querySelectorAll("[data-hot]").forEach((btn) => {
        btn.onclick = () => {
          const pick = HOT_PICKS[Number(btn.dataset.hot)];
          document.getElementById("searchBrand").value = pick.brand;
          document.getElementById("searchModel").value = pick.model;
          document.getElementById("searchCapacity").value = pick.capacity;
          document.getElementById("searchCondition").value = pick.condition;
          onSearch(pick);
        };
      });
    },

    fillForm(values) {
      if (!values) return;
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      set("searchBrand", values.brand);
      set("searchModel", values.model);
      set("searchCapacity", values.capacity);
      set("searchCondition", values.condition);
    },
  };
})(window);
