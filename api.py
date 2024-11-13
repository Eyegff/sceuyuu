from flask import Flask, request, jsonify
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)

@app.route('/filter-url', methods=['POST'])
def filter_url():
    try:
        # รับข้อมูล URL จาก Body ของคำขอ
        data = request.json
        input_url = data.get("url")
        
        if not input_url:
            return jsonify({"status": "error", "message": "URL is required"}), 400
        
        # ตรวจสอบว่า URL เป็นแบบ vless://
        if not input_url.startswith("vless://"):
            return jsonify({"status": "error", "message": "Invalid URL format"}), 400
        
        # ตัด vless:// ออกเพื่อ parse ข้อมูลที่เหลือ
        url_without_scheme = input_url.split("://", 1)[1]
        parsed_url = urlparse(f"http://{url_without_scheme}")  # ใช้ http:// เพื่อช่วย parse
        
        # ดึง Query Parameters
        params = parse_qs(parsed_url.query)
        
        # กรองเฉพาะค่าที่ต้องการ
        filtered_data = {
            "sni": params.get("sni", [""])[0],
            "type": params.get("type", [""])[0],
            "host": params.get("host", [""])[0]
        }
        
        return jsonify({"status": "success", "filtered_data": filtered_data})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
