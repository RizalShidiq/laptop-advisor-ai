document.addEventListener("DOMContentLoaded", () => {
  // State Management
  const state = {
    currentStep: 1,
    userChoices: {
      budget_min: 3000000,
      budget_max: 20000000,
      primary_use: null,
      priorities: [],
      os: null,
    },
  };

  const totalSteps = 4;
  let comparisonChartInstance = null;

  // DOM Elements
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

  // ----- LOGIKA KUESIONER -----

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
      case 4:
        if (!state.userChoices.os) {
          alert("Pilih preferensi sistem operasi.");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  nextBtn.addEventListener("click", () => {
    if (validateStep(state.currentStep)) {
      if (state.currentStep < totalSteps) {
        state.currentStep++;
        showStep(state.currentStep);
      }
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
      os: null,
    };
    budgetMinInput.value = 3;
    budgetMaxInput.value = 20;
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
      // Panggil backend API
      const response = await fetch(
        "http://127.0.0.1:5000/api/get-recommendation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state.userChoices),
        }
      );

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
      recommendationsList.innerHTML = `<p class="text-red-500 col-span-full text-center">Maaf, terjadi kesalahan: ${error.message}</p>`;
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

  function renderRecommendations(recommendations) {
    recommendationsList.innerHTML = "";
    noResultsDiv.classList.toggle("hidden", recommendations.length > 0);

    if (recommendations.length > 0) {
      recommendations.forEach((laptop) => {
        const card = `
                    <div class="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col fade-in">
                        <img src="${laptop.img_placeholder}" alt="${
          laptop.nama
        }" class="w-full h-48 object-cover bg-slate-200">
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="text-xl font-bold text-slate-900">${
                              laptop.nama
                            }</h3>
                            <p class="font-semibold text-blue-600 mt-1">${formatRupiah(
                              laptop.harga
                            )}</p>
                            <div class="mt-4 text-sm text-slate-600 space-y-1">
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
                            <div class="mt-4 bg-slate-100 p-3 rounded-lg text-sm text-slate-700 flex-grow">
                                <p><strong>Rekomendasi AI:</strong> ${
                                  laptop.penjelasan
                                }</p>
                            </div>
                            <a href="${
                              laptop.link_tokopedia
                            }" target="_blank" rel="noopener noreferrer" class="block w-full text-center mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Lihat di Tokopedia
                            </a>
                        </div>
                    </div>
                `;
        recommendationsList.innerHTML += card;
      });
    }
    updateComparisonChart(recommendations);
  }

  function updateComparisonChart(recommendations) {
    const ctx = document.getElementById("comparisonChart").getContext("2d");
    const labels = recommendations.map((l) => l.nama);
    const perfData = recommendations.map((l) => l.perf_score); // Menggunakan skor dari API
    const priceData = recommendations.map((l) => l.harga);

    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
    }

    comparisonChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Skor Performa (relatif)",
            data: perfData,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Skor Performa (Semakin tinggi semakin baik)",
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Skor Performa: ${context.parsed.x}`,
              afterLabel: (context) =>
                `Harga: ${formatRupiah(priceData[context.dataIndex])}`,
            },
          },
        },
      },
    });
  }

  // Inisialisasi tampilan awal
  showStep(state.currentStep);
});
