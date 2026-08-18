# 🤖 Laptop Advisor AI

Sebuah aplikasi web berbasis AI yang membantu pengguna, terutama yang awam teknologi, untuk menemukan rekomendasi laptop ideal berdasarkan anggaran, kebutuhan (gaming, kerja, dll.), dan prioritas pribadi mereka. Proyek ini menggunakan Google Gemini API sebagai otak di balik mesin rekomendasinya.

**[Lihat Demo Langsung](https://laptop-advisor-ai.vercel.app/)**

## ✨ Fitur Utama

- **Dashboard Interaktif Satu Halaman (2-Kolom)**: Seluruh formulir preferensi (anggaran, kegunaan, prioritas) berada di panel sebelah kiri, sementara hasil analisis, kartu rekomendasi, dan grafik perbandingan ditampilkan seketika di panel sebelah kanan.
- **Rekomendasi Berbasis AI**: Menggunakan kekuatan Google Gemini API untuk menganalisis kebutuhan dan memberikan rekomendasi laptop paling relevan dari pasar Indonesia.
- **Bagan Perbandingan Interaktif (Chart.js)**: Menyajikan grafik metrik multi-dimensi (**Radar Chart** & **Bar Chart**) untuk membandingkan Performa, Portabilitas, Daya Tahan Baterai, Kualitas Layar, dan *Value for Money*.
- **Skeleton Shimmer Loading**: Tampilan placeholder animasi modern saat AI memproses data rekomendasi.
- **Dukungan Dark Mode**: Opsi tema Gelap dan Terang yang nyaman di mata dengan persistensi preferensi di `localStorage`.
- **Hasil Terpersonalisasi**: Menampilkan kartu rekomendasi lengkap dengan logo merek, spesifikasi teknis (CPU, GPU, RAM, Penyimpanan), ulasan singkat AI, estimasi harga, dan tautan langsung ke Tokopedia.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript, Chart.js
- **Backend**: Python 3, Flask, CORS
- **AI Engine**: Google Gemini API via **Google GenAI SDK** (`google-genai` & `gemini-2.5-flash`)
- **Deployment**: Serverless Architecture di Vercel

---

## 📂 Struktur Proyek

```
/
├── api/
│   └── index.py         # Backend Flask & pemrosesan prompt terstruktur ke Gemini API
├── public/
│   ├── index.html       # Antarmuka web utama (UI kuesioner, dark mode, chart container)
│   ├── script.js        # State management, Chart.js rendering, dark mode logic, & API fetch
│   └── style.css        # Animasi shimmer skeleton, transisi tema, dan custom styling
├── vercel.json          # Konfigurasi routing & deployment serverless Vercel
├── requirements.txt     # Daftar dependensi Python
└── README.md            # Dokumentasi proyek & panduan instalasi
```

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Untuk menjalankan aplikasi ini di komputer Anda, ikuti langkah-langkah berikut:

1.  **Clone Repositori**

    ```bash
    git clone https://github.com/RizalShidiq/laptop-advisor-ai.git
    cd laptop-advisor-ai
    ```

2.  **Siapkan Lingkungan Python & Instal Dependensi**

    ```bash
    # Buat virtual environment (opsional tapi direkomendasikan)
    python -m venv venv
    source venv/bin/activate  # Di Windows: venv\Scripts\activate

    # Instal semua library yang dibutuhkan
    pip install -r requirements.txt
    ```

3.  **Atur Environment Variable**
    Backend ini membutuhkan API Key dari Google Gemini. Atur di terminal Anda:

    ```bash
    # Untuk macOS/Linux
    export GEMINI_API_KEY="KUNCI_API_GEMINI_ANDA"

    # Untuk Windows (Command Prompt)
    set GEMINI_API_KEY="KUNCI_API_GEMINI_ANDA"
    ```

4.  **Jalankan Backend Server**
    Buka terminal **pertama** dan jalankan server Flask. Biarkan terminal ini tetap berjalan.

    ```bash
    flask --app api/index run
    ```

    Server akan berjalan di `http://127.0.0.1:5000`.

5.  **Jalankan Frontend Server**
    Pastikan `script.js` Anda menggunakan URL `http://127.0.0.1:5000` untuk `fetch`. Buka `index.html` menggunakan ekstensi **Live Server** di VS Code atau server lokal lainnya.

---

## ☁️ Deployment

Proyek ini sudah dikonfigurasi untuk deployment yang mudah ke:

- **Vercel**: Menggunakan file `vercel.json`.

Cukup hubungkan repositori GitHub Anda ke salah satu platform tersebut dan jangan lupa untuk menambahkan `GEMINI_API_KEY` di bagian Environment Variables pada pengaturan situs.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.
