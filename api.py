from flask import Flask, jsonify, request

app = Flask(__name__)

# Route สำหรับ /fetch-code
@app.route('/fetch-code', methods=['GET'])
def fetch_code():
    return jsonify({"status": "success", "message": "Fetch Code API is working!"})

# Route สำหรับ /filter-url
@app.route('/filter-url', methods=['POST'])
def filter_url():
    data = request.json
    if not data or "url" not in data:
        return jsonify({"status": "error", "message": "URL is required"}), 400

    # ตัวอย่าง URL ที่จะกรอง
    input_url = data["url"]

    # ตรวจสอบว่าเป็น URL แบบ vless://
    if not input_url.startswith("vless://"):
        return jsonify({"status": "error", "message": "Invalid URL format"}), 400

    # ดึงพารามิเตอร์ที่ต้องการ
    from urllib.parse import urlparse, parse_qs
    url_without_scheme = input_url.split("://", 1)[1]
    parsed_url = urlparse(f"http://{url_without_scheme}")  # ใช้ http:// เพื่อช่วย parse
    params = parse_qs(parsed_url.query)

    # กรองค่าที่ต้องการ
    filtered_data = {
        "sni": params.get("sni", [""])[0],
        "type": params.get("type", [""])[0],
        "host": params.get("host", [""])[0]
    }

    return jsonify({"status": "success", "filtered_data": filtered_data})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
