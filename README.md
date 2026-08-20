# 🤖 Laptop Advisor AI

**Laptop Advisor AI** adalah aplikasi web modern berbasis kecerdasan buatan (*AI*) yang dirancang untuk membantu pengguna—baik pemula maupun pengguna profesional—menemukan rekomendasi laptop paling ideal di pasar Indonesia berdasarkan anggaran, kebutuhan penggunaan spesifik, dan prioritas fitur pribadi.

Didukung oleh **Google GenAI SDK (`gemini-3.7-flash`)**, aplikasi ini menganalisis spesifikasi pasar terkini secara *real-time* dan menyajikan hasil dalam format kartu terstruktur beserta grafik komparasi multi-dimensi.

🔗 **[Demo Langsung Aplikasi](https://laptop-advisor-ai.vercel.app/)**

---

## ✨ Fitur Unggulan

- 🖥️ **Dashboard Satu Halaman (2-Kolom Terpisah)**:
  - **Panel Kiri (Sticky Input)**: Kontrol terpadu untuk rentang anggaran, jumlah rekomendasi (3, 4, atau 5 pilihan), kebutuhan utama (*Kantor/Kuliah, Gaming, Kreasi Konten, Programming*), dan pemilihan prioritas (maksimal 2).
  - **Panel Kanan (Dynamic Results)**: Hasil rekomendasi langsung tampil seketika tanpa perlu berpindah-pindah halaman atau step wizard.
- 🧠 **Mesin Rekomendasi Berbasis AI**:
  - Menggunakan model **Gemini 2.5 Flash** melalui **Google GenAI SDK** (`google-genai`) dengan *Structured JSON Output*.
- 📊 **Visualisasi Metrik Interaktif (Chart.js)**:
  - Menyajikan grafik komparasi 5 dimensi: *Performa*, *Portabilitas*, *Daya Baterai*, *Kualitas Layar*, dan *Value for Money*.
  - Dilengkapi tombol switcher untuk beralih antara **Radar Chart** dan **Bar Chart**.
- 🌓 **Dukungan Dark Mode Adaptif**:
  - Pilihan tema Gelap (*Dark*) dan Terang (*Light*) dengan persistensi di `localStorage` dan sinkronisasi warna grafik instan.
- ✨ **Skeleton Shimmer Loading**:
  - Animasi placeholder modern saat AI memproses rekomendasi.
- 🛒 **Integrasi Marketplace Langsung**:
  - Setiap kartu rekomendasi dilengkapi estimasi harga pasar Indonesia (IDR), ringkasan ulasan AI, grid 4 spesifikasi kunci (CPU, GPU, RAM, Storage), dan tautan pencarian instan ke Tokopedia.

---

## 🛠️ Arsitektur & Teknologi

| Lapisan | Teknologi |
|---|---|
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), Tailwind CSS, Material Symbols, Chart.js |
| **Backend** | Python 3 (Flask, Flask-CORS) |
| **AI Engine** | Google Gemini API via official **Google GenAI SDK** (`google-genai`) |
| **Deployment** | Serverless Architecture di **Vercel** (`vercel.json`) |

---

## 📂 Struktur Repositori

```
laptop-advisor-ai/
├── api/
│   └── index.py             # Server Flask & integrasi Google GenAI SDK
├── public/
│   ├── index.html           # Antarmuka Dashboard 2-Kolom & Dark Mode
│   ├── script.js            # Interaksi DOM, validasi, Chart.js, & API fetch
│   └── style.css            # Animasi shimmer skeleton & custom styles
├── .gitignore               # Daftar pengecualian Git (venv, cache, secrets)
├── requirements.txt         # Dependensi backend Python
├── vercel.json              # Konfigurasi routing & serverless build Vercel
└── README.md                # Dokumentasi proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal:

### 1. Clone Repositori
```bash
git clone https://github.com/RizalShidiq/laptop-advisor-ai.git
cd laptop-advisor-ai
```

### 2. Siapkan Virtual Environment & Instal Dependensi
```bash
# Buat virtual environment Python
python -m venv .venv

# Aktifkan virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Instal pustaka yang diperlukan
pip install -r requirements.txt
```

### 3. Konfigurasi API Key Google Gemini
Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/apikey), lalu atur di terminal Anda:

```bash
# Windows (PowerShell):
$env:GEMINI_API_KEY="API_KEY_GEMINI_ANDA"

# Windows (CMD):
set GEMINI_API_KEY=API_KEY_GEMINI_ANDA

# Linux / macOS:
export GEMINI_API_KEY="API_KEY_GEMINI_ANDA"
```

### 4. Jalankan Backend Server
```bash
flask --app api/index run
```
*Server API akan aktif di `http://127.0.0.1:5000`.*

### 5. Buka Frontend
Buka file `public/index.html` menggunakan **Live Server** di VS Code atau web server lokal pilihan Anda.

---

## 📡 Dokumentasi API

### `POST /api/get-recommendation`
Menerima kriteria preferensi pengguna dan mengembalikan daftar rekomendasi laptop terstruktur beserta skor evaluasi metrik.

#### Request Body (JSON):
```json
{
  "budget_min": 5000000,
  "budget_max": 15000000,
  "primary_use": "Gaming",
  "priorities": ["Performa", "Kualitas Layar"],
  "recommendation_count": 3
}
```

#### Response Body (JSON):
```json
{
  "rekomendasi": [
    {
      "nama": "Lenovo LOQ 15IAX9",
      "brand": "lenovo",
      "harga": "12.000.000 - 13.500.000",
      "sumber_harga": "Tokopedia, 2025",
      "spesifikasi": {
        "CPU": "Intel Core i5-12450HX",
        "GPU": "NVIDIA GeForce RTX 3050 6GB",
        "RAM": "12GB DDR5",
        "Penyimpanan": "512GB NVMe SSD"
      },
      "skor": {
        "performa": 8.5,
        "portabilitas": 6.5,
        "baterai": 6.0,
        "layar": 8.5,
        "value": 9.0
      },
      "penjelasan": "Pilihan gaming entry-level terbaik dengan GPU RTX 3050 6GB dan layar 100% sRGB.",
      "link_tokopedia": "https://www.tokopedia.com/search?q=Lenovo+LOQ+15IAX9",
      "link_lazada": "https://www.lazada.co.id/catalog/?q=Lenovo+LOQ+15IAX9"
    }
  ]
}
```

---

## ☁️ Deployment ke Vercel

Proyek ini telah dikonfigurasi untuk berjalan di **Vercel** secara otomatis menggunakan file [`vercel.json`](./vercel.json).

1. Hubungkan repositori GitHub ini ke [Vercel](https://vercel.com).
2. Tambahkan variabel lingkungan pada pengaturan proyek:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `API_KEY_GEMINI_ANDA`
3. Klik **Deploy**.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Bebas digunakan, dikembangkan, dan dipelajari.
