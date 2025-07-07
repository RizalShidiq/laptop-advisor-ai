document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("laptop-form");
  const submitBtn = document.getElementById("submit-btn");
  const loadingDiv = document.getElementById("loading");
  const resultsContainer = document.getElementById("results-container");
  const recommendationsDiv = document.getElementById("recommendations");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Tampilkan loading spinner
    submitBtn.disabled = true;
    loadingDiv.classList.remove("hidden");
    resultsContainer.classList.add("hidden");

    // Kumpulkan data dari form
    const formData = new FormData(form);
    const usage = Array.from(formData.getAll("usage"));
    const features = Array.from(formData.getAll("features"));

    const data = {
      budget: formData.get("budget"),
      usage: usage,
      priority: formData.get("priority"),
      os: formData.get("os"),
      features: features,
    };

    try {
      // Kirim data ke backend API
      const response = await fetch("/api/get-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Tampilkan hasil
      displayResults(result.rekomendasi);
    } catch (error) {
      recommendationsDiv.innerHTML = `<p style="color: red;">Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi nanti.</p>`;
      console.error("Error:", error);
    } finally {
      // Sembunyikan loading dan aktifkan kembali tombol
      loadingDiv.classList.add("hidden");
      resultsContainer.classList.remove("hidden");
      submitBtn.disabled = false;
    }
  });

  function displayResults(laptops) {
    recommendationsDiv.innerHTML = ""; // Kosongkan hasil sebelumnya

    if (!laptops || laptops.length === 0) {
      recommendationsDiv.innerHTML =
        "<p>Maaf, AI tidak dapat menemukan rekomendasi yang cocok. Coba ubah kriteria Anda.</p>";
      return;
    }

    // Buat kartu untuk setiap rekomendasi
    laptops.forEach((laptop) => {
      const card = document.createElement("div");
      card.className = "recommendation-card";

      const priceFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(laptop.harga);

      card.innerHTML = `
                <h3>${laptop.nama}</h3>
                <div class="price">${priceFormatted}</div>
                <p><strong>Mengapa ini cocok?</strong> ${laptop.penjelasan}</p>
                <div class="spec-grid">
                    <span><strong>CPU:</strong> ${laptop.spesifikasi.CPU}</span>
                    <span><strong>GPU:</strong> ${laptop.spesifikasi.GPU}</span>
                    <span><strong>RAM:</strong> ${laptop.spesifikasi.RAM}</span>
                    <span><strong>Penyimpanan:</strong> ${laptop.spesifikasi.Penyimpanan}</span>
                </div>
                <div class="ecommerce-links">
                    <a href="${laptop.link_tokopedia}" target="_blank">Beli di Tokopedia</a>
                    <a href="${laptop.link_lazada}" target="_blank">Beli di Lazada</a>
                </div>
            `;
      recommendationsDiv.appendChild(card);
    });
  }
});
