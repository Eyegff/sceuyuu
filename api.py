from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/fetch-code', methods=['GET'])
def fetch_code():
    url = "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub4.txt"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.text
        return jsonify({"status": "success", "data": data})
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 500
