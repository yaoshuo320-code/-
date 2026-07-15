/**
 * SplashScreen — Revo brand open animation.
 * Halo rotation + light particles + asset fragments recombining.
 */
(function (global) {
  const STORAGE_KEY = "revo_splash_seen_v1";
  const DURATION_MS = 2800;

  function shouldShow() {
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  }

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
  }

  function fragmentHtml(i) {
    const positions = [
      { x: 18, y: 22 }, { x: 72, y: 18 }, { x: 82, y: 58 },
      { x: 12, y: 62 }, { x: 48, y: 78 }, { x: 58, y: 28 },
    ];
    const p = positions[i % positions.length];
    return `<div class="splash-fragment" style="--fx:${p.x}%;--fy:${p.y}%;animation-delay:${i * 0.12}s"></div>`;
  }

  global.SplashScreen = {
    show(onComplete) {
      if (!shouldShow()) {
        onComplete && onComplete();
        return;
      }

      const overlay = document.createElement("div");
      overlay.className = "splash-overlay";
      overlay.id = "revoSplash";
      overlay.innerHTML = `
        <div class="splash-stage">
          <div class="splash-halo"></div>
          <div class="splash-halo splash-halo-2"></div>
          ${Array.from({ length: 6 }, (_, i) => fragmentHtml(i)).join("")}
          <div class="splash-particles">
            ${Array.from({ length: 8 }, (_, i) => `<span class="splash-dot" style="--di:${i}"></span>`).join("")}
          </div>
          <div class="splash-logo-core">
            <div class="splash-sun"></div>
            <span class="splash-brand">Revo</span>
          </div>
          <p class="splash-motto">AI发现每件资产的新价值</p>
        </div>`;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add("show"));

      setTimeout(() => {
        overlay.classList.add("hide");
        setTimeout(() => {
          overlay.remove();
          markSeen();
          onComplete && onComplete();
        }, 500);
      }, DURATION_MS);
    },

    reset() {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    },
  };
})(window);
