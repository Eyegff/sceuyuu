const express = require('express');
const app = express();

app.use(express.json());

app.post('/ask', (req, res) => {
    try {
        // รับคำถามจากผู้ใช้
        const data = req.body;
        let question = (data.question || '').toLowerCase();

        if (!question) {
            return res.status(400).json({ "error": "กรุณาระบุคำถาม" });
        }

        // เงื่อนไขตอบคำถาม
        let response;
        if (question.includes("ขอโค้ด") || question.includes("v2ray") || question.includes("สร้างโค้ด")) {
            response = {
                "message": "✅ โค้ดของคุณถูกสร้างสำเร็จ!",
                "code": "vless://86802fae-a78e-4f45-a411-d466b00a1a58@www.opensignal.com.esnfvpnfreevip_bot.itow.online:80?path=%2F&security=none&encryption=none&host=www.opensignal.com.esnfvpnfreevip_bot.itow.online&type=ws#%E0%B9%80%E0%B8%97%E0%B8%AA%E0%B8%AB"
            };
        } else if (question.includes("vpn") || question.includes("เครือข่าย") || question.includes("ส่วนตัว")) {
            response = {
                "message": "VPN (Virtual Private Network) คือระบบที่ช่วยให้คุณเชื่อมต่ออินเทอร์เน็ตได้อย่างปลอดภัยและเป็นส่วนตัว โดยสร้างการเชื่อมต่อเข้ารหัสระหว่างอุปกรณ์ของคุณกับเซิร์ฟเวอร์"
            };
        } else if (question.includes("ชื่อ") || question.includes("ใครสร้าง") || question.includes("มาจากไหน")) {
            response = {
                "message": "ผมคือ AI5-R บอทที่ถูกสร้างขึ้นมาเพื่อช่วยคุณสร้างโค้ด V2Ray และตอบคำถามเกี่ยวกับ VPN และเทคโนโลยีออนไลน์"
            };
        } else if (question.includes("ใช้งานยังไง") || question.includes("วิธีใช้")) {
            response = {
                "message": "คุณสามารถใช้ VPN ได้โดยติดตั้งแอปพลิเคชัน เช่น NordVPN หรือ ProtonVPN ลงชื่อเข้าใช้ และเลือกเซิร์ฟเวอร์ที่ต้องการ"
            };
        } else if (question.includes("เซิร์ฟเวอร์") || question.includes("ประเทศไหน")) {
            response = {
                "message": "เซิร์ฟเวอร์ที่เหมาะสมขึ้นอยู่กับความต้องการของคุณ เช่น ถ้าต้องการความเร็ว ควรเลือกเซิร์ฟเวอร์ที่อยู่ใกล้ เช่น ไทย ญี่ปุ่น หรือสิงคโปร์"
            };
        } else if (question.includes("อินเทอร์เน็ตช้า") || question.includes("เน็ตไม่ดี")) {
            response = {
                "message": "หากอินเทอร์เน็ตช้าขณะใช้ VPN ลองเปลี่ยนเซิร์ฟเวอร์ หรือเลือกโปรโตคอลที่เหมาะสม เช่น WireGuard หรือ OpenVPN"
            };
        } else if (question.includes("แนะนำ") || question.includes("ควรใช้")) {
            response = {
                "message": "VPN ที่แนะนำได้แก่ NordVPN, Surfshark, และ ExpressVPN ซึ่งมีความน่าเชื่อถือและความเร็วสูง"
            };
        } else if (question.includes("ความปลอดภัย") || question.includes("ป้องกัน")) {
            response = {
                "message": "VPN ช่วยป้องกันข้อมูลของคุณไม่ให้ถูกดักฟัง โดยเฉพาะเมื่อเชื่อมต่อผ่าน Wi-Fi สาธารณะ"
            };
        } else if (question.includes("ข้อมูลส่วนตัว") || question.includes("แฮกเกอร์")) {
            response = {
                "message": "การใช้ VPN ช่วยป้องกันไม่ให้แฮกเกอร์หรือบุคคลที่สามเข้าถึงข้อมูลส่วนตัวของคุณในขณะใช้อินเทอร์เน็ต"
            };
        } else if (question.includes("ดีกว่ายังไง") || question.includes("ข้อดี")) {
            response = {
                "message": "ข้อดีของ VPN คือการปกป้องความเป็นส่วนตัว เลี่ยงการเซ็นเซอร์ และเพิ่มความปลอดภัยในการเชื่อมต่ออินเทอร์เน็ต"
            };
        } else if (question.includes("ข้อเสีย")) {
            response = {
                "message": "ข้อเสียของ VPN บางครั้งอาจทำให้ความเร็วอินเทอร์เน็ตลดลง หรือเชื่อมต่อไม่ได้หากเซิร์ฟเวอร์มีปัญหา"
            };
        } else if (question.includes("ฟรี") || question.includes("เสียเงิน")) {
            response = {
                "message": "VPN แบบฟรีมีข้อจำกัดเรื่องความเร็วและความปลอดภัย ควรใช้ VPN แบบเสียเงินเพื่อประสบการณ์ที่ดีกว่า"
            };
        } else if (question.includes("จีน") || question.includes("ประเทศบล็อก")) {
            response = {
                "message": "ในประเทศที่มีการบล็อกอินเทอร์เน็ต เช่น จีน การใช้ VPN เช่น Shadowsocks หรือ WireGuard อาจช่วยได้ แต่ต้องเลือกบริการที่ไม่ถูกบล็อก"
            };
        } else if (question.includes("เกม") || question.includes("ping")) {
            response = {
                "message": "การใช้ VPN สำหรับเล่นเกมควรเลือกเซิร์ฟเวอร์ที่ใกล้ประเทศเซิร์ฟเวอร์เกม เพื่อให้ค่าปิงต่ำที่สุด"
            };
        } else if (question.includes("อุปกรณ์") || question.includes("รองรับ")) {
            response = {
                "message": "VPN รองรับหลายอุปกรณ์ เช่น คอมพิวเตอร์, มือถือ, และเราเตอร์ คุณสามารถติดตั้ง VPN บนอุปกรณ์ที่คุณใช้บ่อยได้"
            };
        } else if (question.includes("ความเร็ว") || question.includes("เร็วขึ้น")) {
            response = {
                "message": "VPN บางตัวมีโปรโตคอลที่ช่วยให้ความเร็วสูงขึ้น เช่น WireGuard หากต้องการความเร็วควรเลือกเซิร์ฟเวอร์ใกล้ตัวคุณ"
            };
        } else if (question.includes("ปัญหา") || question.includes("แก้ไข")) {
            response = {
                "message": "หาก VPN มีปัญหา เช่น เชื่อมต่อไม่ได้ ลองรีสตาร์ทแอปพลิเคชัน เปลี่ยนเซิร์ฟเวอร์ หรืออัพเดตแอป"
            };
        } else {
            response = {
                "message": "ขอโทษครับ ผมไม่เข้าใจคำถามของคุณ ลองถามใหม่หรือถามเกี่ยวกับ VPN หรือ V2Ray ได้เลย!"
            };
        }

        return res.json(response);
    } catch (error) {
        return res.status(500).json({ "error": error.toString() });
    }
});

app.listen(5000, '0.0.0.0', () => {
    console.log('เซิร์ฟเวอร์กำลังรันที่พอร์ต 5000');
});
