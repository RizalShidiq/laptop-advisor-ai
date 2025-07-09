document.addEventListener("DOMContentLoaded", () => {
  // State Management (Tidak berubah)
  const state = {
    currentStep: 1,
    userChoices: {
      budget_min: 3000000,
      budget_max: 20000000,
      primary_use: null,
      priorities: [],
      recommendation_count: 3,
    },
  };

  const totalSteps = 3;
  // comparisonChartInstance Dihapus

  // DOM Elements (Tidak berubah)
  const stepIndicatorsContainer = document.getElementById("step-indicators");
  const steps = document.querySelectorAll(".step");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const getRecommendationsBtn = document.getElementById(
    "get-recommendations-btn"
  );
  const advisorSection = document.getElementById("advisor-section");
  const loadingSection = document.getElementById("loading-section");
  const resultsSection = document.getElementById("results-section");
  const recommendationsList = document.getElementById("recommendations-list");
  const noResultsDiv = document.getElementById("no-results");
  const resetBtn = document.getElementById("reset-btn");
  const budgetMinInput = document.getElementById("budget_min");
  const budgetMaxInput = document.getElementById("budget_max");
  const recommendationCountSelect = document.getElementById(
    "recommendation_count"
  );

  // ----- LOGIKA KUESIONER (Tidak ada perubahan signifikan) -----
  function updateStepIndicators() {
    stepIndicatorsContainer.innerHTML = "";
    for (let i = 1; i <= totalSteps; i++) {
      const indicator = document.createElement("div");
      indicator.className = `step-indicator w-8 h-2 rounded-full ${
        i <= state.currentStep ? "bg-blue-600" : "bg-slate-200"
      }`;
      stepIndicatorsContainer.appendChild(indicator);
    }
  }

  function showStep(stepNumber) {
    steps.forEach((step) => step.classList.add("hidden"));
    document.getElementById(`step-${stepNumber}`).classList.remove("hidden");
    prevBtn.classList.toggle("hidden", stepNumber === 1);
    nextBtn.classList.toggle("hidden", stepNumber === totalSteps);
    getRecommendationsBtn.classList.toggle("hidden", stepNumber !== totalSteps);
    updateStepIndicators();
  }

  function validateStep(stepNumber) {
    switch (stepNumber) {
      case 1:
        const min = parseInt(budgetMinInput.value) * 1000000;
        const max = parseInt(budgetMaxInput.value) * 1000000;
        if (isNaN(min) || isNaN(max) || min < 0 || max <= min) {
          alert("Masukkan rentang anggaran yang valid.");
          return false;
        }
        state.userChoices.budget_min = min;
        state.userChoices.budget_max = max;
        state.userChoices.recommendation_count = parseInt(
          recommendationCountSelect.value
        );
        return true;
      case 2:
        if (!state.userChoices.primary_use) {
          alert("Pilih penggunaan utama.");
          return false;
        }
        return true;
      case 3:
        if (state.userChoices.priorities.length === 0) {
          alert("Pilih setidaknya satu prioritas.");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  // Event listeners (next, prev, options, reset) tidak berubah
  nextBtn.addEventListener("click", () => {
    if (validateStep(state.currentStep) && state.currentStep < totalSteps) {
      state.currentStep++;
      showStep(state.currentStep);
    }
  });
  prevBtn.addEventListener("click", () => {
    if (state.currentStep > 1) {
      state.currentStep--;
      showStep(state.currentStep);
    }
  });
  document.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => {
      const question = card.parentElement.dataset.question;
      const value = card.dataset.value;
      const maxSelection =
        parseInt(card.parentElement.dataset.maxSelection) || 1;
      if (maxSelection > 1) {
        const priorities = state.userChoices.priorities;
        if (priorities.includes(value)) {
          state.userChoices.priorities = priorities.filter((p) => p !== value);
          card.classList.remove("selected");
        } else {
          if (priorities.length < maxSelection) {
            state.userChoices.priorities.push(value);
            card.classList.add("selected");
          } else {
            alert(
              `Anda hanya bisa memilih maksimal ${maxSelection} prioritas.`
            );
          }
        }
      } else {
        state.userChoices[question] = value;
        card.parentElement
          .querySelectorAll(".option-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      }
    });
  });
  resetBtn.addEventListener("click", () => {
    state.currentStep = 1;
    state.userChoices = {
      budget_min: 3000000,
      budget_max: 20000000,
      primary_use: null,
      priorities: [],
      recommendation_count: 3,
    };
    budgetMinInput.value = 3;
    budgetMaxInput.value = 20;
    recommendationCountSelect.value = 3;
    document
      .querySelectorAll(".option-card.selected")
      .forEach((c) => c.classList.remove("selected"));
    resultsSection.classList.add("hidden");
    advisorSection.classList.remove("hidden");
    showStep(1);
  });

  // ----- LOGIKA API & HASIL -----
  getRecommendationsBtn.addEventListener("click", async () => {
    if (!validateStep(state.currentStep)) return;
    advisorSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");
    try {
      const response = await fetch("/api/get-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.userChoices),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const result = await response.json();
      renderRecommendations(result.rekomendasi || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      noResultsDiv.classList.remove("hidden");
    } finally {
      loadingSection.classList.add("hidden");
      resultsSection.classList.remove("hidden");
    }
  });

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }
  function getLogoUrl(brand) {
    if (!brand) return "https://placehold.co/400/e2e8f0/e2e8f0?text=LOGO";
    const normalizedBrand = brand.toLowerCase().trim();
    let domain;
    switch (normalizedBrand) {
      case "apple":
        domain = "apple.com";
        break;
      case "asus":
        domain = "asus.com";
        break;
      case "lenovo":
        domain = "lenovo.com";
        break;
      case "hp":
        domain = "hp.com";
        break;
      case "dell":
        domain = "dell.com";
        break;
      case "acer":
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
      default:
        domain = `${normalizedBrand}.com`;
    }
    return `https://logo.clearbit.com/${domain}`;
  }

  function renderRecommendations(recommendations) {
    recommendationsList.innerHTML = "";
    const hasResults = recommendations.length > 0;
    noResultsDiv.classList.toggle("hidden", hasResults);

    if (hasResults) {
      recommendations.forEach((laptop) => {
        const logoUrl = getLogoUrl(laptop.brand);
        const card = `
                    <div class="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col fade-in">
                        <div class="h-48 flex items-center justify-center p-4 bg-slate-100">
                           <img src="${logoUrl}" alt="Logo ${
          laptop.brand
        }" class="max-h-20 max-w-full object-contain" onerror="this.onerror=null; this.src='https://placehold.co/400/e2e8f0/e2e8f0?text=LOGO';">
                        </div>
                        <div class="p-5 flex flex-col flex-grow">
                            <h3 class="text-lg font-bold text-slate-900">${
                              laptop.nama
                            }</h3>
                            <div class="mt-2">
                                <p class="font-semibold text-blue-600 text-lg">${formatRupiah(
                                  laptop.harga
                                )}</p>
                                <p class="text-xs text-slate-500 italic">Sumber: ${
                                  laptop.sumber_harga || "N/A"
                                }</p>
                            </div>
                            <div class="my-4 text-xs text-slate-600 space-y-1">
                                <p><strong>CPU:</strong> ${
                                  laptop.spesifikasi.CPU
                                }</p>
                                <p><strong>GPU:</strong> ${
                                  laptop.spesifikasi.GPU
                                }</p>
                                <p><strong>RAM:</strong> ${
                                  laptop.spesifikasi.RAM
                                }</p>
                                <p><strong>Penyimpanan:</strong> ${
                                  laptop.spesifikasi.Penyimpanan
                                }</p>
                            </div>
                            <div class="mt-auto">
                               <div class="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                                   <p><strong>Rekomendasi AI:</strong> ${
                                     laptop.penjelasan
                                   }</p>
                               </div>
                               <a href="${
                                 laptop.link_tokopedia
                               }" target="_blank" rel="noopener noreferrer" class="block w-full text-center mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                   Lihat di Tokopedia
                               </a>
                            </div>
                        </div>
                    </div>
                `;
        recommendationsList.innerHTML += card;
      });
    }
    // updateComparisonChart Dihapus
  }

  // FUNGSI updateComparisonChart DIHAPUS SELURUHNYA

  // Inisialisasi tampilan awal
  showStep(state.currentStep);
});
