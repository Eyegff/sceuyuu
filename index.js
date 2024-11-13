const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const https = require('https');

const app = express();

// LINE Bot configuration
const config = {
  channelAccessToken: 'UKcDMbQt8jAwg7zji13tVf50BPdwOsQYhtyK1D+kACdxYJt1XKY0kvhYdiOK8GE4fgHsrakIGT9Q4UCphSpIhNJwMBeDKaWMzU06YUwhHUqiD7qE5H3GSVvKvpFygwA7DXP8MroQPNW+onG+UYXQ1AdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6884027b48dc05ad5deadf87245928da'
};

const MOBILE_NUMBER = '0825658423';

// สร้าง axios instance พร้อมการตั้งค่าพิเศษ
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

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

  if (event.type === 'postback') {
    if (event.postback.data === 'donate') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'กรุณาส่งลิงก์ซองอั่งเปาวอเลทมาให้เรานะครับ'
      });
    }
  }

  if (event.type === 'message' && event.message.type === 'text') {
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

    if (event.message.text.includes('https://gift.truemoney.com/campaign/?v=')) {
      try {
        const code = event.message.text.split('?v=')[1];
        
        // สร้าง headers แบบสมจริง
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
          'Origin': 'https://gift.truemoney.com',
          'Connection': 'keep-alive',
          'Referer': `https://gift.truemoney.com/campaign/?v=${code}`,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };

        const response = await axiosInstance.post(
          `https://gift.truemoney.com/campaign/vouchers/${code}/redeem`,
          {
            mobile: MOBILE_NUMBER,
            voucher_hash: code
          },
          { headers }
        );

        console.log('TrueMoney API Response:', response.data);

        if (response.data && response.data.status && response.data.status.code === 'SUCCESS') {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `รับเงินเรียบร้อยแล้ว! จำนวน ${response.data.amount} บาท ขอบคุณที่โดเนทครับ`
          });
        } else {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'ไม่สามารถรับซองได้ กรุณาตรวจสอบว่าซองยังไม่หมดอายุและยังไม่ถูกใช้'
          });
        }
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error);
        
        let errorMessage = 'ไม่สามารถรับซองได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
        
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'ระบบกำลังมีปัญหา กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
          } else if (error.response.status === 404) {
            errorMessage = 'ไม่พบซองของขวัญ หรือซองถูกใช้ไปแล้ว';
          } else if (error.response.status === 400) {
            errorMessage = 'ซองไม่ถูกต้องหรือหมดอายุแล้ว';
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
