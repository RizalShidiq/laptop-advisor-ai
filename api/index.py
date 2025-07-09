import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from serverless_wsgi import handle

app = Flask(__name__)
CORS(app)

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    print("Gemini API Key loaded successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

@app.route('/api/get-recommendation', methods=['POST'])
def get_recommendation():
    try:
        data = request.json
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')
        primary_use = data.get('primary_use')
        priorities = ", ".join(data.get('priorities', []))
        recommendation_count = data.get('recommendation_count', 3)
        
        prompt_template = f"""
        Anda adalah seorang ahli teknologi yang sangat berpengalaman dalam merekomendasikan laptop di pasar Indonesia.
        Tugas Anda adalah memberikan {recommendation_count} rekomendasi laptop terbaik berdasarkan kebutuhan spesifik pengguna.
        Berikan jawaban dalam format JSON yang terstruktur dan valid.

        Berikut adalah data pengguna:
        - Rentang Budget: Rp {budget_min:,} hingga Rp {budget_max:,}
        - Kebutuhan Utama: {primary_use}
        - Prioritas Utama: {priorities}

        Instruksi Jawaban:
        1. Analisis kebutuhan pengguna secara mendalam.
        2. Cari {recommendation_count} laptop paling sesuai yang ada di pasaran Indonesia saat ini.
        3. Untuk setiap laptop, berikan:
           - "nama": Nama lengkap laptop.
           - "brand": Nama merek (contoh: "asus", "lenovo").
           - "harga": Estimasi harga dalam Rupiah (angka).
           - "sumber_harga": Sumber pengecekan harga dan tanggal (Contoh: "Tokopedia, 9 Juli 2025").
           - "spesifikasi": Objek JSON berisi "CPU", "GPU", "RAM", "Penyimpanan".
           - "penjelasan": Penjelasan singkat.
           - "link_tokopedia": Link pencarian di Tokopedia.
           - "link_lazada": Link pencarian di Lazada.
        4. Pastikan outputnya adalah objek JSON tunggal dengan kunci "rekomendasi".
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash-latest', generation_config=genai.types.GenerationConfig(response_mime_type="application/json"))
        response = model.generate_content(prompt_template)
        return response.text, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e), "rekomendasi": []}), 500
    
def handler(event, context):
    """Fungsi ini adalah pintu masuk untuk Netlify Functions."""
    return handle(app, event, context)