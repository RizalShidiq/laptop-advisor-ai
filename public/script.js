document.addEventListener("DOMContentLoaded", () => {
  // State Management
  const state = {
    userChoices: {
      budget_min: 3000000,
      budget_max: 20000000,
      primary_use: null,
      priorities: [],
      recommendation_count: 3,
    },
  };

  let comparisonChartInstance = null;
  let currentRecommendations = [];
  let currentChartType = "radar"; // 'radar' or 'bar'

  // DOM Elements
  const budgetMinInput = document.getElementById("budget_min");
  const budgetMaxInput = document.getElementById("budget_max");
  const recommendationCountInput = document.getElementById("recommendation_count");
  const recCountBtns = document.querySelectorAll(".rec-count-btn");
  const getRecommendationsBtn = document.getElementById("get-recommendations-btn");
  const resetBtn = document.getElementById("reset-btn");

  const emptyState = document.getElementById("empty-state");
  const loadingSection = document.getElementById("loading-section");
  const resultsSection = document.getElementById("results-section");
  const recommendationsList = document.getElementById("recommendations-list");
  const noResultsDiv = document.getElementById("no-results");
  const chartSection = document.getElementById("chart-section");

  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
  const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
  const themeToggleText = document.getElementById("theme-toggle-text");

  // Chart Switcher Elements
  const chartRadarBtn = document.getElementById("chart-radar-btn");
  const chartBarBtn = document.getElementById("chart-bar-btn");

  // ----- THEME MANAGEMENT (DARK / LIGHT MODE) -----
  function updateThemeUI(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
      if (themeToggleLightIcon) themeToggleLightIcon.classList.remove("hidden");
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add("hidden");
      if (themeToggleText) themeToggleText.textContent = "Terang";
    } else {
      document.documentElement.classList.remove("dark");
      if (themeToggleLightIcon) themeToggleLightIcon.classList.add("hidden");
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove("hidden");
      if (themeToggleText) themeToggleText.textContent = "Gelap";
    }
  }

  function initTheme() {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    updateThemeUI(isDark);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      const newTheme = isCurrentlyDark ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      updateThemeUI(!isCurrentlyDark);

      // Re-render chart jika ada rekomendasi yang sedang ditampilkan
      if (currentRecommendations.length > 0) {
        renderComparisonChart(currentRecommendations, currentChartType);
      }
    });
  }

  initTheme();

  // ----- FORM INTERACTION LOGIC -----

  // 1. Recommendation Count Selection
  recCountBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      recCountBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      const count = parseInt(btn.dataset.value) || 3;
      recommendationCountInput.value = count;
      state.userChoices.recommendation_count = count;
    });
  });

  // 2. Primary Use & Priorities Option Cards
  document.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => {
      const parent = card.parentElement;
      const question = parent.dataset.question;
      const value = card.dataset.value;
      const maxSelection = parseInt(parent.dataset.maxSelection) || 1;

      if (maxSelection > 1) {
        // Multi-select (Priorities)
        const priorities = state.userChoices.priorities;
        if (priorities.includes(value)) {
          state.userChoices.priorities = priorities.filter((p) => p !== value);
          card.classList.remove("selected");
        } else {
          if (priorities.length < maxSelection) {
            state.userChoices.priorities.push(value);
            card.classList.add("selected");
          } else {
            alert(`Anda hanya dapat memilih maksimal ${maxSelection} prioritas.`);
          }
        }
      } else {
        // Single-select (Primary Use)
        state.userChoices[question] = value;
        parent.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      }
    });
  });

  // 3. Form Validation
  function validateForm() {
    const min = parseInt(budgetMinInput.value) * 1000000;
    const max = parseInt(budgetMaxInput.value) * 1000000;

    if (isNaN(min) || isNaN(max) || min < 1000000 || max <= min) {
      alert("Masukkan rentang anggaran yang valid (Maksimum harus lebih besar dari Minimum).");
      return false;
    }
    state.userChoices.budget_min = min;
    state.userChoices.budget_max = max;
    state.userChoices.recommendation_count = parseInt(recommendationCountInput.value) || 3;

    if (!state.userChoices.primary_use) {
      alert("Silakan pilih salah satu kategori Penggunaan Utama.");
      return false;
    }

    if (state.userChoices.priorities.length === 0) {
      alert("Silakan pilih setidaknya satu Prioritas Utama.");
      return false;
    }

    return true;
  }

  // 4. Reset Button
  resetBtn.addEventListener("click", () => {
    state.userChoices = {
      budget_min: 3000000,
      budget_max: 20000000,
      primary_use: null,
      priorities: [],
      recommendation_count: 3,
    };

    budgetMinInput.value = 3;
    budgetMaxInput.value = 20;
    recommendationCountInput.value = 3;

    recCountBtns.forEach((b, idx) => {
      b.classList.toggle("selected", idx === 0);
    });

    document.querySelectorAll(".option-card.selected").forEach((c) => c.classList.remove("selected"));

    currentRecommendations = [];
    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
      comparisonChartInstance = null;
    }

    // Switch back to empty state
    if (resultsSection) resultsSection.classList.add("hidden");
    if (loadingSection) loadingSection.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
  });

  // ----- API CALL & RENDERING -----
  getRecommendationsBtn.addEventListener("click", async () => {
    if (!validateForm()) return;

    // Show loading state
    if (emptyState) emptyState.classList.add("hidden");
    if (resultsSection) resultsSection.classList.add("hidden");
    if (loadingSection) loadingSection.classList.remove("hidden");

    // Scroll slightly on mobile if needed
    if (window.innerWidth < 1024) {
      const resultsPanel = document.getElementById("results-panel");
      if (resultsPanel) resultsPanel.scrollIntoView({ behavior: "smooth" });
    }

    try {
      const response = await fetch("/api/get-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.userChoices),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      currentRecommendations = result.rekomendasi || [];
      renderRecommendations(currentRecommendations);
      renderComparisonChart(currentRecommendations, currentChartType);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      currentRecommendations = [];
      renderRecommendations([]);
    } finally {
      if (loadingSection) loadingSection.classList.add("hidden");
      if (resultsSection) resultsSection.classList.remove("hidden");
    }
  });

  function formatHargaRange(laptop) {
    if (!laptop) return "Harga Menyesuaikan";

    // 1. Jika ada harga_min dan harga_max eksplisit (angka)
    if (laptop.harga_min && laptop.harga_max && !isNaN(laptop.harga_min) && !isNaN(laptop.harga_max)) {
      const minStr = new Intl.NumberFormat("id-ID").format(laptop.harga_min);
      const maxStr = new Intl.NumberFormat("id-ID").format(laptop.harga_max);
      return `Rp ${minStr} - ${maxStr}`;
    }

    // 2. Jika harga adalah string yang memuat rentang harga
    const hargaVal = laptop.rentang_harga || laptop.harga;
    if (typeof hargaVal === "string" && hargaVal.trim() !== "") {
      let clean = hargaVal.trim();
      if (!clean.toLowerCase().startsWith("rp")) {
        clean = `Rp ${clean}`;
      }
      return clean;
    }

    // 3. Jika harga adalah angka tunggal
    if (typeof hargaVal === "number" && !isNaN(hargaVal) && hargaVal > 0) {
      const min = Math.floor((hargaVal * 0.95) / 100000) * 100000;
      const max = Math.ceil((hargaVal * 1.05) / 100000) * 100000;
      const minStr = new Intl.NumberFormat("id-ID").format(min);
      const maxStr = new Intl.NumberFormat("id-ID").format(max);
      return `Rp ${minStr} - ${maxStr}`;
    }

    return "Harga Menyesuaikan";
  }

  function getLogoUrl(brand) {
    if (!brand) return "https://placehold.co/400/e2e8f0/64748b?text=LAPTOP";
    const normalizedBrand = brand.toLowerCase().trim();
    let domain;
    switch (normalizedBrand) {
      case "apple":
        domain = "apple.com";
        break;
      case "asus":
      case "rog":
        domain = "asus.com";
        break;
      case "lenovo":
      case "legion":
        domain = "lenovo.com";
        break;
      case "hp":
        domain = "hp.com";
        break;
      case "dell":
      case "alienware":
        domain = "dell.com";
        break;
      case "acer":
      case "predator":
        domain = "acer.com";
        break;
      case "msi":
        domain = "msi.com";
        break;
      case "samsung":
        domain = "samsung.com";
        break;
      case "microsoft":
        domain = "microsoft.com";
        break;
      case "infinix":
        domain = "infinixmobility.com";
        break;
      case "advan":
        return "https://advan.id/wp-content/uploads/2023/11/advan_logo_2023.png";
      case "axioo":
        return "https://axiooworld.com/wp-content/uploads/2020/09/Logo-Axioo.png";
      default:
        domain = `${normalizedBrand}.com`;
    }
    return `https://logo.clearbit.com/${domain}`;
  }

  function renderRecommendations(recommendations) {
    recommendationsList.innerHTML = "";
    const hasResults = recommendations && recommendations.length > 0;
    noResultsDiv.classList.toggle("hidden", hasResults);
    chartSection.classList.toggle("hidden", !hasResults);

    if (hasResults) {
      recommendations.forEach((laptop, index) => {
        const logoUrl = getLogoUrl(laptop.brand);
        const tokolink =
          laptop.link_tokopedia ||
          `https://www.tokopedia.com/search?q=${encodeURIComponent(laptop.nama)}`;

        const card = `
          <div class="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md transition-all duration-200 fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light dark:border-border-dark">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/60 p-2 flex items-center justify-center border border-border-light dark:border-border-dark flex-shrink-0">
                  <img
                    src="${logoUrl}"
                    alt="Logo ${laptop.brand || 'Laptop'}"
                    class="max-h-8 max-w-full object-contain filter dark:brightness-110"
                    onerror="this.onerror=null; this.src='https://placehold.co/100/e2e8f0/475569?text=${encodeURIComponent(laptop.brand || 'LAPTOP')}';"
                  />
                </div>
                <div>
                  <span class="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-primary dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider mb-1">
                    Pilihan #${index + 1}
                  </span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    ${laptop.nama}
                  </h3>
                </div>
              </div>

              <div class="sm:text-right flex-shrink-0">
                <p class="font-extrabold text-primary dark:text-blue-400 text-lg">
                  ${formatHargaRange(laptop)}
                </p>
                <p class="text-[11px] text-slate-400 dark:text-slate-400 italic">
                  ${laptop.sumber_harga || "Marketplace ID"}
                </p>
              </div>
            </div>

            <!-- Technical Specifications Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
              <div class="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">CPU</span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1" title="${laptop.spesifikasi?.CPU || '-'}">${laptop.spesifikasi?.CPU || "-"}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">GPU</span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1" title="${laptop.spesifikasi?.GPU || '-'}">${laptop.spesifikasi?.GPU || "-"}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">RAM</span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1" title="${laptop.spesifikasi?.RAM || '-'}">${laptop.spesifikasi?.RAM || "-"}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
                <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Storage</span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1" title="${laptop.spesifikasi?.Penyimpanan || '-'}">${laptop.spesifikasi?.Penyimpanan || "-"}</span>
              </div>
            </div>

            <!-- AI Verdict Box -->
            <div class="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-xl mb-4">
              <p class="text-xs font-bold text-primary dark:text-blue-300 flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Analisis AI:</span>
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ${laptop.penjelasan || "Pilihan optimal sesuai dengan profil anggaran dan kebutuhan Anda."}
              </p>
            </div>

            <!-- CTA Button -->
            <div>
              <a
                href="${tokolink}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all text-xs"
              >
                <span class="material-symbols-outlined text-base">shopping_cart</span>
                <span>Cek Harga & Beli di Tokopedia</span>
              </a>
            </div>
          </div>
        `;
        recommendationsList.innerHTML += card;
      });
    }
  }

  // ----- COMPARISON CHART (CHART.JS) -----
  const colorPalette = [
    { bg: "rgba(0, 88, 190, 0.25)", border: "#0058be" },     // Blue
    { bg: "rgba(16, 185, 129, 0.25)", border: "#10b981" },   // Emerald
    { bg: "rgba(249, 115, 22, 0.25)", border: "#f97316" },   // Orange
    { bg: "rgba(168, 85, 247, 0.25)", border: "#a855f7" },   // Purple
    { bg: "rgba(236, 72, 153, 0.25)", border: "#ec4899" },   // Pink
  ];

  function getMetricsFromLaptop(laptop, index) {
    if (laptop.skor && typeof laptop.skor === "object") {
      return [
        laptop.skor.performa ?? 8.0,
        laptop.skor.portabilitas ?? 7.5,
        laptop.skor.baterai ?? 7.5,
        laptop.skor.layar ?? 8.0,
        laptop.skor.value ?? 8.5,
      ];
    }
    const base = 7 + (index === 0 ? 1.5 : index === 1 ? 1.0 : 0.5);
    return [
      Math.min(9.5, base + (Math.random() * 1.5 - 0.7)),
      Math.min(9.5, base + (Math.random() * 1.5 - 0.7)),
      Math.min(9.5, base + (Math.random() * 1.5 - 0.7)),
      Math.min(9.5, base + (Math.random() * 1.5 - 0.7)),
      Math.min(9.5, base + (Math.random() * 1.5 - 0.7)),
    ].map((val) => Number(val.toFixed(1)));
  }

  function renderComparisonChart(recommendations, type = "radar") {
    const canvas = document.getElementById("comparisonChart");
    if (!canvas || !recommendations || recommendations.length === 0) return;

    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
      comparisonChartInstance = null;
    }

    const isDarkMode = document.documentElement.classList.contains("dark");
    const textColor = isDarkMode ? "#cbd5e1" : "#475569";
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.07)";

    const labels = [
      "Performa",
      "Portabilitas",
      "Daya Baterai",
      "Kualitas Layar",
      "Value for Money",
    ];

    const datasets = recommendations.map((laptop, i) => {
      const palette = colorPalette[i % colorPalette.length];
      const data = getMetricsFromLaptop(laptop, i);
      const shortName = laptop.nama.length > 20 ? laptop.nama.substring(0, 18) + "..." : laptop.nama;

      return {
        label: shortName,
        data: data,
        backgroundColor: palette.bg,
        borderColor: palette.border,
        borderWidth: 2,
        pointBackgroundColor: palette.border,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: palette.border,
        pointRadius: 3.5,
      };
    });

    const ctx = canvas.getContext("2d");

    if (type === "radar") {
      comparisonChartInstance = new Chart(ctx, {
        type: "radar",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: textColor,
                font: { family: "Inter", size: 11, weight: "600" },
                padding: 12,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.formattedValue} / 10`,
              },
            },
          },
          scales: {
            r: {
              min: 0,
              max: 10,
              ticks: {
                stepSize: 2,
                color: textColor,
                backdropColor: "transparent",
                font: { size: 9 },
              },
              grid: { color: gridColor },
              angleLines: { color: gridColor },
              pointLabels: {
                color: textColor,
                font: { family: "Inter", size: 11, weight: "600" },
              },
            },
          },
        },
      });
    } else {
      comparisonChartInstance = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: textColor,
                font: { family: "Inter", size: 11, weight: "600" },
                padding: 12,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.formattedValue} / 10`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: "Inter", size: 11, weight: "600" },
              },
            },
            y: {
              min: 0,
              max: 10,
              ticks: { stepSize: 2, color: textColor },
              grid: { color: gridColor },
            },
          },
        },
      });
    }
  }

  // Chart Switcher Buttons
  if (chartRadarBtn && chartBarBtn) {
    chartRadarBtn.addEventListener("click", () => {
      currentChartType = "radar";
      chartRadarBtn.className =
        "px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm transition-all cursor-pointer";
      chartBarBtn.className =
        "px-3 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer";
      if (currentRecommendations.length > 0) {
        renderComparisonChart(currentRecommendations, "radar");
      }
    });

    chartBarBtn.addEventListener("click", () => {
      currentChartType = "bar";
      chartBarBtn.className =
        "px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm transition-all cursor-pointer";
      chartRadarBtn.className =
        "px-3 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer";
      if (currentRecommendations.length > 0) {
        renderComparisonChart(currentRecommendations, "bar");
      }
    });
  }
});
