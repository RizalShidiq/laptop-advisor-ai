# 🤖 Laptop Advisor AI

Sebuah aplikasi web berbasis AI yang membantu pengguna, terutama yang awam teknologi, untuk menemukan rekomendasi laptop ideal berdasarkan anggaran, kebutuhan (gaming, kerja, dll.), dan prioritas pribadi mereka. Proyek ini menggunakan Google Gemini API sebagai otak di balik mesin rekomendasinya.

**[Lihat Demo Langsung](https://laptop-advisor-ai.vercel.app/)**

## ✨ Fitur Utama

- **Kuesioner Interaktif**: Pengguna dipandu melalui serangkaian pertanyaan sederhana mengenai anggaran, tujuan penggunaan, dan prioritas utama (performa, portabilitas, baterai).
- **Rekomendasi Berbasis AI**: Menggunakan kekuatan Google Gemini API untuk menganalisis jawaban pengguna dan memberikan rekomendasi laptop yang paling relevan dari pasar saat ini.
- **Hasil yang Dipersonalisasi**: Menampilkan 3-5 kartu rekomendasi, lengkap dengan logo merek, spesifikasi utama, penjelasan singkat dari AI, dan tautan langsung ke e-commerce.
- **Desain Responsif**: Tampilan yang dioptimalkan untuk kenyamanan penggunaan di berbagai perangkat, mulai dari desktop hingga ponsel.
- **Transparansi Harga**: Menyertakan keterangan sumber estimasi harga untuk memberikan konteks yang lebih baik kepada pengguna.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Python 3, Flask
- **AI Engine**: Google Gemini API
- **Deployment**: Dikonfigurasi untuk Vercel dan Netlify

---

## 📂 Struktur Proyek

Proyek ini dipisahkan menjadi dua bagian utama untuk kemudahan pengelolaan, sesuai dengan praktik terbaik untuk deployment di platform seperti Netlify/Vercel.

```
/
├── api/
│   └── index.py         # Backend Flask & Logika panggilan ke Gemini API
├── public/
│   ├── index.html       # Halaman utama aplikasi
│   ├── script.js        # Logika frontend dan interaksi
│   └── style.css        # Styling tambahan
├── versel.json          # Konfigurasi untuk deployment ke Vercel
├── netlify.toml         # Konfigurasi untuk deployment ke Netlify
├── requirements.txt     # Daftar library Python yang dibutuhkan
└── README.md            # File yang sedang Anda baca
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
- **Netlify**: Menggunakan file `netlify.toml`.

Cukup hubungkan repositori GitHub Anda ke salah satu platform tersebut dan jangan lupa untuk menambahkan `GEMINI_API_KEY` di bagian Environment Variables pada pengaturan situs.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.
