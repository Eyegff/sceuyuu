from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ai5_r():
    try:
        # รับคำถามจากผู้ใช้
        data = request.get_json()
        question = data.get('question', '').lower()

        if not question:
            return jsonify({"error": "กรุณาระบุคำถาม"}), 400

        # เงื่อนไขตอบคำถาม
        if "ขอโค้ด" in question or "v2ray" in question or "สร้างโค้ด" in question:
            response = {
                "message": "✅ โค้ดของคุณถูกสร้างสำเร็จ!",
                "code": "vless://86802fae-a78e-4f45-a411-d466b00a1a58@www.opensignal.com.esnfvpnfreevip_bot.itow.online:80?path=%2F&security=none&encryption=none&host=www.opensignal.com.esnfvpnfreevip_bot.itow.online&type=ws#%E0%B9%80%E0%B8%97%E0%B8%AA%E0%B8%AB"
            }
        elif "vpn" in question or "เครือข่าย" in question or "ส่วนตัว" in question:
            response = {
                "message": "VPN (Virtual Private Network) คือระบบที่ช่วยให้คุณเชื่อมต่ออินเทอร์เน็ตได้อย่างปลอดภัยและเป็นส่วนตัว โดยสร้างการเชื่อมต่อเข้ารหัสระหว่างอุปกรณ์ของคุณกับเซิร์ฟเวอร์"
            }
        elif "ชื่อ" in question or "ใครสร้าง" in question or "มาจากไหน" in question:
            response = {
                "message": "ผมคือ AI5-R บอทที่ถูกสร้างขึ้นมาเพื่อช่วยคุณสร้างโค้ด V2Ray และตอบคำถามเกี่ยวกับ VPN และเทคโนโลยีออนไลน์"
            }
        elif "ใช้งานยังไง" in question or "วิธีใช้" in question:
            response = {
                "message": "คุณสามารถใช้ VPN ได้โดยติดตั้งแอปพลิเคชัน เช่น NordVPN หรือ ProtonVPN ลงชื่อเข้าใช้ และเลือกเซิร์ฟเวอร์ที่ต้องการ"
            }
        elif "เซิร์ฟเวอร์" in question or "ประเทศไหน" in question:
            response = {
                "message": "เซิร์ฟเวอร์ที่เหมาะสมขึ้นอยู่กับความต้องการของคุณ เช่น ถ้าต้องการความเร็ว ควรเลือกเซิร์ฟเวอร์ที่อยู่ใกล้ เช่น ไทย ญี่ปุ่น หรือสิงคโปร์"
            }
        elif "อินเทอร์เน็ตช้า" in question or "เน็ตไม่ดี" in question:
            response = {
                "message": "หากอินเทอร์เน็ตช้าขณะใช้ VPN ลองเปลี่ยนเซิร์ฟเวอร์ หรือเลือกโปรโตคอลที่เหมาะสม เช่น WireGuard หรือ OpenVPN"
            }
        elif "แนะนำ" in question or "ควรใช้" in question:
            response = {
                "message": "VPN ที่แนะนำได้แก่ NordVPN, Surfshark, และ ExpressVPN ซึ่งมีความน่าเชื่อถือและความเร็วสูง"
            }
        elif "ความปลอดภัย" in question or "ป้องกัน" in question:
            response = {
                "message": "VPN ช่วยป้องกันข้อมูลของคุณไม่ให้ถูกดักฟัง โดยเฉพาะเมื่อเชื่อมต่อผ่าน Wi-Fi สาธารณะ"
            }
        elif "ข้อมูลส่วนตัว" in question or "แฮกเกอร์" in question:
            response = {
                "message": "การใช้ VPN ช่วยป้องกันไม่ให้แฮกเกอร์หรือบุคคลที่สามเข้าถึงข้อมูลส่วนตัวของคุณในขณะใช้อินเทอร์เน็ต"
            }
        elif "ดีกว่ายังไง" in question or "ข้อดี" in question:
            response = {
                "message": "ข้อดีของ VPN คือการปกป้องความเป็นส่วนตัว เลี่ยงการเซ็นเซอร์ และเพิ่มความปลอดภัยในการเชื่อมต่ออินเทอร์เน็ต"
            }
        elif "ข้อเสีย" in question:
            response = {
                "message": "ข้อเสียของ VPN บางครั้งอาจทำให้ความเร็วอินเทอร์เน็ตลดลง หรือเชื่อมต่อไม่ได้หากเซิร์ฟเวอร์มีปัญหา"
            }
        elif "ฟรี" in question or "เสียเงิน" in question:
            response = {
                "message": "VPN แบบฟรีมีข้อจำกัดเรื่องความเร็วและความปลอดภัย ควรใช้ VPN แบบเสียเงินเพื่อประสบการณ์ที่ดีกว่า"
            }
        elif "จีน" in question or "ประเทศบล็อก" in question:
            response = {
                "message": "ในประเทศที่มีการบล็อกอินเทอร์เน็ต เช่น จีน การใช้ VPN เช่น Shadowsocks หรือ WireGuard อาจช่วยได้ แต่ต้องเลือกบริการที่ไม่ถูกบล็อก"
            }
        elif "เกม" in question or "ping" in question:
            response = {
                "message": "การใช้ VPN สำหรับเล่นเกมควรเลือกเซิร์ฟเวอร์ที่ใกล้ประเทศเซิร์ฟเวอร์เกม เพื่อให้ค่าปิงต่ำที่สุด"
            }
        elif "อุปกรณ์" in question or "รองรับ" in question:
            response = {
                "message": "VPN รองรับหลายอุปกรณ์ เช่น คอมพิวเตอร์, มือถือ, และเราเตอร์ คุณสามารถติดตั้ง VPN บนอุปกรณ์ที่คุณใช้บ่อยได้"
            }
        elif "ความเร็ว" in question or "เร็วขึ้น" in question:
            response = {
                "message": "VPN บางตัวมีโปรโตคอลที่ช่วยให้ความเร็วสูงขึ้น เช่น WireGuard หากต้องการความเร็วควรเลือกเซิร์ฟเวอร์ใกล้ตัวคุณ"
            }
        elif "ปัญหา" in question or "แก้ไข" in question:
            response = {
                "message": "หาก VPN มีปัญหา เช่น เชื่อมต่อไม่ได้ ลองรีสตาร์ทแอปพลิเคชัน เปลี่ยนเซิร์ฟเวอร์ หรืออัพเดตแอป"
            }
        else:
            response = {
                "message": "ขอโทษครับ ผมไม่เข้าใจคำถามของคุณ ลองถามใหม่หรือถามเกี่ยวกับ VPN หรือ V2Ray ได้เลย!"
            }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
