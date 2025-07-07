import os
from flask import Flask, request, jsonify
from openai import OpenAI

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Konfigurasi API Key Deepseek dari environment variable
client = OpenAI(
    api_key="sk-38fe7a92481f4c678ae6af527efcca8b",
    base_url="https://api.deepseek.com"
)

@app.route('/api/get-recommendation', methods=['POST'])
def get_recommendation():
    try:
        # 1. Ambil data JSON yang dikirim dari frontend
        data = request.json
        budget = data.get('budget')
        usage = ", ".join(data.get('usage', []))
        priority = data.get('priority')
        os_pref = data.get('os')
        features = ", ".join(data.get('features', []))

        # 2. Buat Prompt (Perintah) yang Detail untuk AI
        # Ini adalah bagian paling krusial. Prompt ini mengarahkan AI
        # untuk bertindak sebagai ahli laptop.
        prompt_template = f"""
        Anda adalah seorang ahli teknologi yang sangat berpengalaman dalam merekomendasikan laptop di pasar Indonesia.
        Tugas Anda adalah memberikan 3 rekomendasi laptop terbaik berdasarkan kebutuhan spesifik pengguna.
        Berikan jawaban dalam format JSON yang terstruktur.

        Berikut adalah data pengguna:
        - Budget: {budget} Rupiah
        - Kebutuhan Utama: {usage}
        - Prioritas: {priority}
        - Preferensi Sistem Operasi: {os_pref}
        - Fitur Tambahan yang Diinginkan: {features if features else 'Tidak ada'}

        Instruksi Jawaban:
        1.  Analisis kebutuhan pengguna secara mendalam.
        2.  Cari 3 laptop paling sesuai yang ada di pasaran Indonesia saat ini.
        3.  Untuk setiap laptop, berikan:
            - "nama": Nama lengkap laptop (contoh: "ASUS ROG Zephyrus G14").
            - "harga": Estimasi harga dalam Rupiah (contoh: 18500000).
            - "spesifikasi": Objek JSON berisi "CPU", "GPU", "RAM", "Penyimpanan".
            - "penjelasan": Penjelasan singkat (maksimal 2 kalimat) mengapa laptop ini cocok untuk pengguna.
            - "link_tokopedia": Link pencarian di Tokopedia untuk laptop tersebut.
            - "link_lazada": Link pencarian di Lazada untuk laptop tersebut.
        4.  Pastikan outputnya adalah sebuah objek JSON tunggal dengan kunci "rekomendasi" yang berisi sebuah array dari 3 objek laptop.
            Contoh: {{"rekomendasi": [...]}}
        """

        # 3. Kirim prompt ke Deepseek API
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides laptop recommendations in Indonesian and responds in JSON format."},
                {"role": "user", "content": prompt_template}
            ],
            temperature=0.7, # Sedikit kreativitas untuk hasil yang lebih baik
            response_format={"type": "json_object"} # Memaksa output menjadi JSON
        )

        # 4. Kembalikan hasil dari AI ke frontend
        ai_response = response.choices[0].message.content
        return ai_response, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        # Jika terjadi error, kirim pesan error
        return jsonify({"error": str(e)}), 500

# Rute ini hanya untuk memastikan server berjalan
@app.route('/')
def home():
    return "Backend is running."