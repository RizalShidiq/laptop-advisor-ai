import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

# Initialize Gemini client using Google GenAI SDK
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
        print("Gemini Client configured with API key.")
    else:
        client = genai.Client()
        print("Gemini Client configured with environment/default credentials.")
except Exception as e:
    print(f"Warning initializing Gemini Client: {e}")
    client = None

@app.route('/api/get-recommendation', methods=['POST'])
def get_recommendation():
    try:
        data = request.json or {}
        budget_min = data.get('budget_min', 3000000)
        budget_max = data.get('budget_max', 20000000)
        primary_use = data.get('primary_use', 'Umum')
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
           - "brand": Nama merek (contoh: "asus", "lenovo", "apple", "acer", "hp", "dell", "msi").
           - "harga": Estimasi rentang harga (contoh: "10.000.000 - 12.000.000").
           - "harga_min": Estimasi harga terendah dalam Rupiah (angka bilangan bulat murni, contoh: 10000000).
           - "harga_max": Estimasi harga tertinggi dalam Rupiah (angka bilangan bulat murni, contoh: 12000000).
           - "sumber_harga": Sumber pengecekan harga dan tanggal (Contoh: "Tokopedia, 2025").
           - "spesifikasi": Objek JSON berisi "CPU", "GPU", "RAM", "Penyimpanan".
           - "skor": Objek JSON nilai 1-10 (boleh desimal seperti 8.5) untuk evaluasi metrik:
               - "performa": Skor performa prosesor/grafis untuk kebutuhan tersebut (1-10)
               - "portabilitas": Skor keringanan & kemudahan dibawa (1-10)
               - "baterai": Skor efisiensi daya tahan baterai (1-10)
               - "layar": Skor kualitas panel & resolusi layar (1-10)
               - "value": Skor perbandingan harga vs spesifikasi (1-10)
           - "penjelasan": Penjelasan ringkas mengapa laptop ini cocok untuk pengguna.
           - "link_tokopedia": URL pencarian Tokopedia untuk laptop tersebut.
           - "link_lazada": URL pencarian Lazada untuk laptop tersebut.
        4. Pastikan outputnya adalah objek JSON tunggal dengan kunci "rekomendasi".
        """

        current_client = client or (genai.Client(api_key=os.environ.get("GEMINI_API_KEY")) if os.environ.get("GEMINI_API_KEY") else genai.Client())
        
        response = current_client.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt_template,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7
            )
        )
        return response.text, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e), "rekomendasi": []}), 500
