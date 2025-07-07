import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# --- Konfigurasi Gemini API ---
try:
    # Ambil API Key dari environment variable untuk keamanan
    # Jika tidak ada, gunakan placeholder (harap diganti)
    api_key = os.environ.get("AIzaSyAPn_0bwPgkdmIJIgOsjz_3zf9ZimQc_2g", "AIzaSyAPn_0bwPgkdmIJIgOsjz_3zf9ZimQc_2g")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")


@app.route('/api/get-recommendation', methods=['POST'])
def get_recommendation():
    try:
        # 1. Ambil data dari frontend baru
        data = request.json
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')
        primary_use = data.get('primary_use')
        priorities = ", ".join(data.get('priorities', []))
        os_pref = data.get('os')

        # 2. Buat Prompt yang lebih detail untuk AI, meminta skor performa dan gambar placeholder
        prompt_template = f"""
        Anda adalah seorang ahli teknologi yang sangat berpengalaman dalam merekomendasikan laptop di pasar Indonesia.
        Tugas Anda adalah memberikan 3 rekomendasi laptop terbaik berdasarkan kebutuhan spesifik pengguna.
        Berikan jawaban dalam format JSON yang terstruktur dan valid.

        Berikut adalah data pengguna:
        - Rentang Budget: Rp {budget_min:,} hingga Rp {budget_max:,}
        - Kebutuhan Utama: {primary_use}
        - Prioritas Utama: {priorities}
        - Preferensi Sistem Operasi: {os_pref}

        Instruksi Jawaban:
        1. Analisis kebutuhan pengguna secara mendalam.
        2. Cari 3 laptop paling sesuai yang ada di pasaran Indonesia saat ini dalam rentang budget tersebut.
        3. Untuk setiap laptop, berikan:
           - "nama": Nama lengkap laptop (contoh: "ASUS ROG Zephyrus G14").
           - "harga": Estimasi harga dalam Rupiah (sebuah angka, contoh: 18500000). Pastikan harga berada dalam rentang budget.
           - "spesifikasi": Objek JSON berisi "CPU", "GPU", "RAM", "Penyimpanan".
           - "penjelasan": Penjelasan singkat (maksimal 2 kalimat) mengapa laptop ini cocok untuk pengguna berdasarkan kebutuhan dan prioritasnya.
           - "perf_score": Skor performa relatif laptop ini dibandingkan laptop lain di pasaran (angka 0-100). 100 adalah yang terbaik.
           - "link_tokopedia": Link pencarian di Tokopedia untuk laptop tersebut.
           - "link_lazada": Link pencarian di Lazada untuk laptop tersebut.
           - "img_placeholder": URL gambar placeholder dari placehold.co, contoh: "https://placehold.co/600x400/3b82f6/FFFFFF?text=NamaLaptop"
        4. Pastikan outputnya adalah sebuah objek JSON tunggal dengan kunci "rekomendasi" yang berisi sebuah array dari 3 objek laptop.
           Contoh: {{"rekomendasi": [...]}}
        """

        # Inisialisasi model Gemini untuk menghasilkan JSON
        model = genai.GenerativeModel(
            'gemini-1.5-flash-latest',
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # Kirim prompt ke Gemini API
        response = model.generate_content(prompt_template)
        
        return response.text, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        # Kirim pesan error yang lebih informatif
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# Rute root untuk memastikan server berjalan
@app.route('/')
def home():
    return "Backend is running with Gemini API for the new frontend."