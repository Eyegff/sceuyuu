from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/fetch-code', methods=['GET'])
def fetch_code():
    url = "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub4.txt"
    try:
        # ดึงข้อมูลจาก URL
        response = requests.get(url)
        response.raise_for_status()  # ตรวจสอบข้อผิดพลาด
        data = response.text  # อ่านข้อมูลเป็นข้อความ
        return jsonify({"status": "success", "data": data})
    except requests.exceptions.RequestException as e:
        # จัดการข้อผิดพลาด
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # รันแอปพลิเคชัน
    app.run(host="0.0.0.0", port=5000)
