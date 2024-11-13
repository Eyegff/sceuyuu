const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');

const app = express();

// LINE Bot configuration
const config = {
  channelAccessToken: 'UKcDMbQt8jAwg7zji13tVf50BPdwOsQYhtyK1D+kACdxYJt1XKY0kvhYdiOK8GE4fgHsrakIGT9Q4UCphSpIhNJwMBeDKaWMzU06YUwhHUqiD7qE5H3GSVvKvpFygwA7DXP8MroQPNW+onG+UYXQ1AdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6884027b48dc05ad5deadf87245928da'
};

// เบอร์มือถือสำหรับรับเงิน TrueMoney Wallet
const MOBILE_NUMBER = '0825658423';

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' && event.type !== 'postback') {
    return Promise.resolve(null);
  }

  // จัดการกับการกดปุ่ม
  if (event.type === 'postback') {
    if (event.postback.data === 'donate') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'กรุณาส่งลิงก์ซองอั่งเปาวอเลทมาให้เรานะครับ'
      });
    }
  }

  // จัดการกับข้อความ
  if (event.type === 'message' && event.message.type === 'text') {
    // ถ้าพิมพ์ /start จะแสดงปุ่มโดเนท
    if (event.message.text === '/start') {
      const message = {
        type: 'template',
        altText: 'Donate Button',
        template: {
          type: 'buttons',
          text: 'กดปุ่มเพื่อโดเนทซองอั่งเปาวอเลท',
          actions: [{
            type: 'postback',
            label: 'Donate',
            data: 'donate'
          }]
        }
      };
      return client.replyMessage(event.replyToken, message);
    }

    // จัดการกับลิงก์ TrueMoney
    if (event.message.text.includes('https://gift.truemoney.com/campaign/?v=')) {
      try {
        const code = event.message.text.split('?v=')[1];
        const response = await axios.post(
          `https://gift.truemoney.com/campaign/vouchers/${code}/redeem`,
          {
            mobile: MOBILE_NUMBER,
            voucher_hash: code,
            campaignType: "transfer"
          },
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Origin': 'https://gift.truemoney.com',
              'Accept-Language': 'en-US,en;q=0.9',
              'Connection': 'keep-alive',
              'Referer': 'https://gift.truemoney.com/',
              'Cookie': '_fbp=fb.1.1234567890123.123456789; _ga=GA1.2.123456789.1234567890; _gid=GA1.2.123456789.1234567890'
            }
          }
        );

        // เพิ่ม console.log เพื่อดูการตอบกลับ
        console.log('TrueMoney API Response:', response.data);

        if (response.data && response.data.status && response.data.status.code === 'SUCCESS') {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `รับเงินเรียบร้อยแล้ว! จำนวน ${response.data.amount} บาท ขอบคุณที่โดเนทครับ`
          });
        } else {
          throw new Error('Invalid response from TrueMoney API');
        }
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error);
        
        let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        
        // ตรวจสอบประเภทของ error
        if (error.response) {
          if (error.response.data && error.response.data.message) {
            errorMessage = `ข้อผิดพลาด: ${error.response.data.message}`;
          }
          // ถ้าซองถูกใช้ไปแล้ว
          if (error.response.status === 400 || error.response.status === 404) {
            errorMessage = 'ซองอั่งเปานี้ถูกใช้ไปแล้วหรือไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
          }
        }
        
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: errorMessage
        });
      }
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'กรุณาส่งลิงก์ซองอั่งเปาวอเลทที่ถูกต้อง'
      });
    }
  }

  return Promise.resolve(null);
}

// เริ่มต้น server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
