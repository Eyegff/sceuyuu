// นำเข้าโมดูลที่จำเป็น
const line = require('@line/bot-sdk');
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// กำหนดค่า LINE Bot
const config = {
  channelAccessToken: 'UKcDMbQt8jAwg7zji13tVf50BPdwOsQYhtyK1D+kACdxYJt1XKY0kvhYdiOK8GE4fgHsrakIGT9Q4UCphSpIhNJwMBeDKaWMzU06YUwhHUqiD7qE5H3GSVvKvpFygwA7DXP8MroQPNW+onG+UYXQ1AdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6884027b48dc05ad5deadf87245928da'
};

// สร้าง client สำหรับ LINE Bot
const client = new line.Client(config);

// สร้างแอป Express
const app = express();

// ตั้งค่า body parser สำหรับ raw body
const bodyParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});

app.use(bodyParser);

// เก็บสถานะการสนทนาของผู้ใช้
const userSessions = {};

// ฟังก์ชันสำหรับแรนดอม UUID
function generateUUID() {
  return uuidv4();
}

// ฟังก์ชันสำหรับสร้างเวลา expiryTime (3 ชั่วโมง)
function generateExpiryTime() {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 ชั่วโมง
  return expiryDate.getTime();
}

// ฟังก์ชันสำหรับเข้าสู่ระบบ (ใช้ VPS xvre เท่านั้น)
function login(callback) {
  const loginOptions = {
    method: 'POST',
    url: 'http://botvipicopc.vipv2boxth.xyz:2053/0UnAOmjQ1vIaSIr/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      'username': '6FocoC0F7a',
      'password': 'hmSwvyVmAo'
    })
  };

  axios(loginOptions)
    .then(response => {
      const body = response.data;
      if (body.success) {
        console.log('เข้าสู่ระบบสำเร็จ:', body.msg);
        callback(null);
      } else {
        console.log('เข้าสู่ระบบล้มเหลว:', body.msg);
        callback(new Error(body.msg));
      }
    })
    .catch(error => {
      console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
      callback(error);
    });
}

// ฟังก์ชันสำหรับเพิ่มลูกค้าใหม่ (ใช้ VPS xvre เท่านั้น)
function addNewClient(session, successCallback, errorCallback) {
  const clientUUID = generateUUID();
  const expiryTime = generateExpiryTime();

  const apiUrl = 'http://botvipicopc.vipv2boxth.xyz:2053/0UnAOmjQ1vIaSIr/panel/api/inbounds/addClient';
  const apiSettings = {
    clients: [{
      id: clientUUID,
      alterId: 0,
      email: session.codeName,
      limitIp: 2,
      totalGB: 0, // ไม่จำกัด GB
      expiryTime: expiryTime,
      enable: true,
      tgId: '',
      subId: ''
    }]
  };

  const options = {
    method: 'POST',
    url: apiUrl,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: {
      id: 4,
      settings: JSON.stringify(apiSettings)
    }
  };

  axios(options)
    .then(response => {
      const body = response.data;
      if (body.success) {
        console.log('เพิ่มลูกค้าสำเร็จ:', body.msg);
        let clientCode = `vless://${clientUUID}@botvipicopc.vipv2boxth.xyz:2052?type=ws&path=%2F&host=botvipicopc.vipv2boxth.xyz&security=none#${encodeURIComponent(session.codeName)}`;
        successCallback(clientCode, expiryTime);
      } else {
        console.log('การเพิ่มลูกค้าล้มเหลว:', body.msg);
        errorCallback(body.msg);
      }
    })
    .catch(error => {
      console.error('เกิดข้อผิดพลาดในการส่งคำขอ:', error);
      errorCallback('เกิดข้อผิดพลาดในการส่งคำขอ');
    });
}

// ฟังก์ชันสำหรับส่งโค้ดไปยังผู้ใช้ในแชทเดียวกัน
function sendCodeToChat(replyToken, chatId, clientCode, session, expiryTime) {
  const message = {
    type: 'text',
    text: `✅ *โค้ดของคุณถูกสร้างสำเร็จ!*\n\n📬 กรุณาตรวจสอบโค้ดของคุณด้านล่าง:\n\n\`${clientCode}\`\n\n⏰ หมดอายุใน 3 ชั่วโมง`
  };

  client.replyMessage(replyToken, message)
    .then(() => {
      console.log('ส่งโค้ดไปยังผู้ใช้เรียบร้อยแล้ว');
      delete userSessions[chatId];
    })
    .catch((error) => {
      if (error.statusCode === 403) {
        const replyMessage = {
          type: 'text',
          text: `🔗 กรุณาเริ่มแชทกับบอทก่อนที่จะรับโค้ด\n\n📌 คลิกที่นี่เพื่อเริ่มแชท: https://line.me/R/ti/p/YOUR_LINE_ID`
        };
        client.pushMessage(chatId, replyMessage)
          .catch((err) => {
            console.error('Error notifying user to start chat:', err);
          });
      } else {
        console.error('Error sending code to user:', error);
      }
    });
}

// จัดการข้อความจากผู้ใช้
app.post('/webhook', (req, res) => {
  const signature = req.get('x-line-signature');
  
  if (!signature) {
    return res.status(400).send('Missing x-line-signature');
  }

  try {
    // ตรวจสอบความถูกต้องของ signature
    if (!line.validateSignature(req.rawBody, config.channelSecret, signature)) {
      return res.status(400).send('Invalid signature');
    }

    Promise.all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error('Error handling webhook:', err);
        res.status(500).end();
      });
  } catch (err) {
    console.error('Error validating signature:', err);
    res.status(500).send('Internal server error');
  }
});

// ฟังก์ชันสำหรับจัดการแต่ละเหตุการณ์
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const chatId = event.source.groupId || userId;
  const text = event.message.text.trim().toLowerCase();

  // ตรวจสอบว่าผู้ใช้อยู่ในสถานะการสนทนาหรือไม่
  if (userSessions[chatId]) {
    const session = userSessions[chatId];

    if (session.step === 'ask_network') {
      const network = text;
      if (['ทรูโนโปร', 'ทรูโปรเฟส', 'ais'].includes(network)) {
        session.network = network;
        session.step = 'ask_code_name';
        const reply = {
          type: 'text',
          text: '📛 กรุณาตั้งชื่อโค้ดที่คุณต้องการ'
        };
        return client.replyMessage(event.replyToken, reply);
      } else {
        const reply = {
          type: 'text',
          text: '⚠️ กรุณาเลือกเครือข่ายจากตัวเลือก: ทรูโนโปร, ทรูโปรเฟส, AIS'
        };
        return client.replyMessage(event.replyToken, reply);
      }
    } else if (session.step === 'ask_code_name') {
      const codeName = text;
      session.codeName = codeName;
      session.step = 'creating_code';
      const reply = {
        type: 'text',
        text: '⏳ กำลังสร้างโค้ดของคุณ โปรดรอสักครู่...'
      };
      client.replyMessage(event.replyToken, reply);

      login((loginError) => {
        if (loginError) {
          const errorReply = {
            type: 'text',
            text: '🚫 เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองใหม่อีกครั้ง'
          };
          client.pushMessage(chatId, errorReply);
          delete userSessions[chatId];
          return;
        }

        addNewClient(session, (clientCode, expiryTime) => {
          sendCodeToChat(event.replyToken, chatId, clientCode, session, expiryTime);

          const successReply = {
            type: 'text',
            text: '✅ โค้ดของคุณถูกส่งเรียบร้อยแล้ว! โปรดตรวจสอบ.'
          };
          client.pushMessage(chatId, successReply);
        }, (errorMsg) => {
          const errorReply = {
            type: 'text',
            text: `🚫 เกิดข้อผิดพลาดในการสร้างโค้ด: ${errorMsg}`
          };
          client.pushMessage(chatId, errorReply);
          delete userSessions[chatId];
        });
      });

      return Promise.resolve(null);
    }
  } else if (text.includes('สร้างโค้ดให้หน่อย')) {
    userSessions[chatId] = { step: 'ask_network' };
    const reply = {
      type: 'text',
      text: '🔧 กรุณาเลือกเครือข่ายที่ต้องการสร้างโค้ด:\n\n1. ทรูโนโปร\n2. ทรูโปรเฟส\n3. AIS'
    };
    return client.replyMessage(event.replyToken, reply);
  } else {
    const reply = {
      type: 'text',
      text: '❓ ไม่เข้าใจคำสั่งของคุณ โปรดพิมพ์ "สร้างโค้ดให้หน่อย" เพื่อเริ่มสร้างโค้ด'
    };
    return client.replyMessage(event.replyToken, reply);
  }
}

// เริ่มต้นเซิร์ฟเวอร์
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
