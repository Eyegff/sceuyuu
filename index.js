const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');

const app = express();

// LINE Bot configuration - ใส่ token ของคุณที่นี่
const config = {
  channelAccessToken: 'UKcDMbQt8jAwg7zji13tVf50BPdwOsQYhtyK1D+kACdxYJt1XKY0kvhYdiOK8GE4fgHsrakIGT9Q4UCphSpIhNJwMBeDKaWMzU06YUwhHUqiD7qE5H3GSVvKvpFygwA7DXP8MroQPNW+onG+UYXQ1AdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6884027b48dc05ad5deadf87245928da'
};

// เบอร์มือถือสำหรับรับเงิน TrueMoney Wallet
const MOBILE_NUMBER = 'your_mobile_number_here';

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
            voucher_hash: code
          },
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Origin': 'https://gift.truemoney.com',
              'Accept-Language': 'en-US,en;q=0.9',
              'Connection': 'keep-alive'
            }
          }
        );

        if (response.status === 200) {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'รับเงินเรียบร้อยแล้ว! ขอบคุณที่โดเนทครับ'
          });
        } else {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'เกิดข้อผิดพลาดในการรับเงิน โปรดตรวจสอบลิงก์และลองใหม่อีกครั้ง'
          });
        }
      } catch (error) {
        console.error('Error processing donation:', error);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
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
