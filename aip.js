// app.js
const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const schedule = require('node-schedule');
const line = require('@line/bot-sdk');

const app = express();

// LINE Bot's Channel Access Token and Channel Secret
const LINE_CHANNEL_ACCESS_TOKEN = 'UKcDMbQt8jAwg7zji13tVf50BPdwOsQYhtyK1D+kACdxYJt1XKY0kvhYdiOK8GE4fgHsrakIGT9Q4UCphSpIhNJwMBeDKaWMzU06YUwhHUqiD7qE5H3GSVvKvpFygwA7DXP8MroQPNW+onG+UYXQ1AdB04t89/1O/w1cDnyilFU='; // ใส่ Channel Access Token ของคุณที่นี่
const LINE_CHANNEL_SECRET = '6884027b48dc05ad5deadf87245928da'; // ใส่ Channel Secret ของคุณที่นี่
const SERVER_URL = 'https://yourapp.onrender.com'; // ใส่ URL ของเซิร์ฟเวอร์ของคุณที่นี่

// LINE SDK config
const config = {
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// คำศัพท์และข้อมูลต่าง ๆ
const thaiPrefixes = [
  'เทพ', 'พญา', 'ราชา', 'จอม', 'เซียน', 'ปราชญ์', 'มาสเตอร์', 'ซุปเปอร์', 'อัลตร้า', 'เมก้า',
  'จักร', 'มหา', 'ยอด', 'เจ้า', 'ทิพย์', 'ทิว', 'พระ', 'มือ', 'สุด', 'เหนือ', 'สายลม', 'อัศวิน',
  'ดิจิ', 'ไซเบอร์', 'ไวรัส', 'คอสมิก', 'เทอร์โบ', 'นิวเคลียร์', 'แร็พเตอร์', 'โครโนส'
];

const thaiMainWords = [
  'สายฟ้า', 'เหนือเมฆ', 'พลังเทพ', 'จักรวาล', 'มังกร', 'เกราะเพชร', 'สายลับ', 'พลังจิต',
  'เหนือฟ้า', 'ทะยานดาว', 'คลื่นเหล็ก', 'พายุดาว', 'เกราะทอง', 'สายนักรบ', 'เทพเวหา',
  'ราชาเน็ต', 'ความเร็วแสง', 'พลังเน็ต', 'สายด่วน', 'เน็ตทะลุ', 'ไร้ขีดจำกัด', 'ทะลุมิติ',
  'ดาบศักดิ์สิทธิ์', 'ฟีนิกซ์', 'ดาวตก', 'นินจา', 'สปาย', 'อินฟินิตี้', 'สตรอม', 'ซิกม่า'
];

const thaiSuffixes = [
  'ทะลุมิติ', 'พันธุ์แกร่ง', 'เหนือชั้น', 'ไร้ขีดจำกัด', 'ทะลุฟ้า', 'พิชิตใจ', 'ไร้เทียมทาน',
  'เกินต้าน', 'ไร้พ่าย', 'ชาญเน็ต', 'แห่งยุค', 'สปีด', 'สปีดสตาร์', 'ซุปเปอร์สปีด', 'เทอร์โบ',
  'เมก้าบูสต์', 'อัลติเมท', 'สปีดแม็กซ์', 'แรงทะลุฟ้า', 'เต็มสปีด', 'ซุปเปอร์เน็ต'
];

const englishPrefixes = [
  'CYBER', 'QUANTUM', 'HYPER', 'ULTRA', 'MEGA', 'SUPER', 'THUNDER', 'LIGHTNING',
  'PLASMA', 'NOVA', 'NEXUS', 'ELITE', 'PRIME', 'OMEGA', 'ALPHA', 'DELTA',
  'GIGA', 'TURBO', 'INFINITE', 'VELOCITY', 'BLAZE', 'FLASH', 'CRYPTO', 'PHOENIX'
];

const englishMainWords = [
  'SPEED', 'SURGE', 'FLUX', 'FORCE', 'PULSE', 'WAVE', 'STREAM', 'BEAM',
  'CORE', 'BLADE', 'EDGE', 'RUSH', 'BURST', 'BLAST', 'SPARK', 'VOLT',
  'BOOST', 'DRIVE', 'ZONE', 'LINK', 'NET', 'VORTEX', 'CYCLONE', 'STORM'
];

const englishSuffixes = [
  'PRO', 'MAX', 'PLUS', 'ELITE', 'PREMIUM', 'EXTREME', 'ULTIMATE', 'MASTER',
  'X', 'ZERO', 'ALPHA', 'OMEGA', 'PRIME', 'CORE', 'NEXT', 'NOVA',
  'BOOST', 'VELOCITY', 'EDGE', 'FUSION', 'INFINITY', 'TURBO', 'EXPERT'
];

const techTerms = [
  '5G', '64K', 'X1', 'V2', 'X2', 'GT', 'XS', 'XT',
  'RTX', 'GTX', 'PRO', 'MAX', 'PLUS', 'ULTRA', 'XR', 'RS',
  'VPN', 'NET', 'LINK', 'DATA', 'STREAM', 'ONLINE', 'WEB', 'DIGI'
];

// ลิงก์รูปภาพพื้นหลังและโลโก้
const backgroundUrls = [
  "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800"
];

const logoUrl = 'https://raw.githubusercontent.com/github/explore/main/topics/python/python.png';

let generatedNames = new Set();
let trueV2Count = 0;
let sequence = ['TRUE_PRO_FACEBOOK'];
let sequenceIndex = 0;
let userIds = new Set();

// ฟังก์ชันสำหรับดึงและจัดการโค้ด VLESS
async function fetchVlessCodes() {
  const urls = [
    'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub1.txt',
    'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub2.txt',
    'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub3.txt',
    'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub4.txt',
    'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub5.txt'
  ];
  let allCodes = [];
  for (const url of urls) {
    try {
      const response = await axios.get(url);
      const vlessPattern = /vless:\/\/[^#\s]+/g;
      const codes = response.data.match(vlessPattern) || [];
      allCodes = allCodes.concat(codes);
      console.log(`ดึงโค้ด VLESS จาก ${url} ได้ ${codes.length} โค้ด`);
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการดึงโค้ดจาก ${url}: ${error}`);
    }
  }
  return allCodes;
}

function filterVlessCodesBySni(codes, targetSni = 'BpB-V.PagEs.dev') {
  const filteredCodes = [];
  for (const code of codes) {
    try {
      const parsedUrl = new URL(code);
      if (parsedUrl.protocol !== 'vless:') continue;

      const queryParams = qs.parse(parsedUrl.search.substring(1));
      const sniParams = ['sni', 'serverName', 'host'];
      let foundSni = false;

      for (const param of sniParams) {
        if (queryParams[param]) {
          const sniValue = queryParams[param];
          if (sniValue.toLowerCase() === targetSni.toLowerCase()) {
            filteredCodes.push(code);
            foundSni = true;
            break;
          }
        }
      }

      if (!foundSni) {
        const host = parsedUrl.hostname;
        if (host.toLowerCase() === targetSni.toLowerCase()) {
          filteredCodes.push(code);
        }
      }
    } catch (error) {
      console.error(`ข้ามโค้ดเนื่องจากข้อผิดพลาด: ${error}`);
    }
  }
  return filteredCodes;
}

function generateRandomCodeName(provider) {
  let attempt = 0;
  const maxAttempts = 1000;

  while (attempt < maxAttempts) {
    attempt++;

    const useThai = Math.random() < 0.5;
    let nameBody;

    if (useThai) {
      // สร้างชื่อภาษาไทย
      const prefix = randomChoice(thaiPrefixes);
      const mainWord = randomChoice(thaiMainWords);
      const suffix = randomChoice(thaiSuffixes);
      const useSuffix = Math.random() < 0.7;
      nameBody = useSuffix ? `${prefix}${mainWord}${suffix}` : `${prefix}${mainWord}`;
    } else {
      // สร้างชื่อภาษาอังกฤษ
      const prefix = randomChoice(englishPrefixes);
      const mainWord = randomChoice(englishMainWords);
      const suffix = randomChoice(englishSuffixes);
      const techTerm = randomChoice(techTerms);

      const namePattern = Math.floor(Math.random() * 5) + 1;
      switch (namePattern) {
        case 1:
          nameBody = `${prefix}-${mainWord}-${suffix}`;
          break;
        case 2:
          nameBody = `${prefix}${techTerm}-${mainWord}${suffix}`;
          break;
        case 3:
          nameBody = `${prefix}-${mainWord}-${techTerm}`;
          break;
        case 4:
          nameBody = `${prefix}-${mainWord}-${techTerm}-${suffix}`;
          break;
        default:
          nameBody = `${prefix}${mainWord}-${suffix}${techTerm}`;
          break;
      }
    }

    const networkPrefix = provider.toUpperCase() === 'TRUE'
      ? randomChoice(['TRUE', 'TRUEMOVE', 'TRUEONLINE'])
      : randomChoice(['AIS', 'AISONLINE', 'AISFIBRE']);

    // เพิ่มอิโมจิแบบสุ่ม
    const emojis = [
      '🚀', '⚡', '🌟', '💫', '✨', '🔥', '💥', '🌈', '🎯', '🎮',
      '🛡️', '🌐', '🔰', '🌀', '⚔️', '🎆', '🎇', '🚧', '📡', '📶',
      '🔌', '💻', '📲', '🛰️', '🔮', '🕹️', '⚙️', '💠', '🧿', '🗲'
    ];
    const emoji = randomChoice(emojis);

    let codeName = `${emoji} ${networkPrefix} ${nameBody}`;

    if (Math.random() < 0.5) {
      const separators = ['×', '•', '⚡', '☆', '★', '➤', '⟫', '❯', '◉', '◈', '➥', '☯', '✦', '✧'];
      const separator = randomChoice(separators);
      codeName = codeName.replace(' ', ` ${separator} `);
    }

    if (!generatedNames.has(codeName)) {
      generatedNames.add(codeName);
      return codeName;
    }
  }
  throw new Error('ไม่สามารถสร้างชื่อโค้ดที่ไม่ซ้ำกันได้');
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function saveImage(imageBuffer, filename) {
  const staticDir = path.join(__dirname, 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir);
  }
  const filepath = path.join(staticDir, filename);
  fs.writeFileSync(filepath, imageBuffer);
  const imageUrl = `${SERVER_URL}/static/${encodeURIComponent(filename)}`;
  return imageUrl;
}

async function generateCodeAuto() {
  const currentStep = sequence[sequenceIndex % sequence.length];
  sequenceIndex++;

  try {
    console.log(`เริ่มสร้างโค้ดสำหรับ: ${currentStep}`);

    if (currentStep === 'TRUE_PRO_FACEBOOK') {
      const provider = 'TRUE';
      const allCodes = await fetchVlessCodes();
      const filteredCodes = filterVlessCodesBySni(allCodes, 'BpB-V.PagEs.dev');
      console.log(`ทั้งหมด ${allCodes.length} โค้ดที่ดึงมา`);
      console.log(`หลังจากกรองเหลือ ${filteredCodes.length} โค้ด`);

      if (filteredCodes.length === 0) {
        console.warn('ไม่พบโค้ด TRUE V2 ที่ใช้งานได้');
        return;
      }

      let codeTemplate = randomChoice(filteredCodes);
      const codeName = generateRandomCodeName(provider) + ' V2';
      trueV2Count++;

      const parsedUrl = new URL(codeTemplate);
      const originalHost = parsedUrl.hostname;

      // ปรับปรุง host เป็น 's.true.th'
      parsedUrl.hostname = 's.true.th';
      parsedUrl.hash = encodeURIComponent(codeName);
      codeTemplate = parsedUrl.toString();

      const serverHost = originalHost;
      const providerText = 'TRUE V2 | โปรเฟส-เกมมิ่ง';
      const instructions = `วิธีใช้งาน TRUE V2:
1. เปิดแอพ v2BOX
2. วางโค้ดลงไป

สมัครโปรเน็ตทรู:
- กด *935*99# เฟส100MB/วัน
- หรือ *935*59# เกมมิ่ง100MB/วัน
- แนะนำใช้โปร *900*2894# 512KB
- ราคา 22 บาท นาน 7 วัน

- ขอให้มีความสุขกับการใช้เน็ต`;

      console.log(`สร้างโค้ด TRUE V2: ${codeName}`);

      // สร้าง QR Code และภาพ
      const backgroundUrl = randomChoice(backgroundUrls);
      const backgroundResponse = await axios.get(backgroundUrl, { responseType: 'arraybuffer' });
      let background = await sharp(backgroundResponse.data)
        .resize(800, 1200)
        .toBuffer();

      const qrCodeBuffer = await QRCode.toBuffer(codeTemplate, {
        type: 'png',
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // เพิ่มโลโก้
      try {
        const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        const logoBuffer = await sharp(logoResponse.data)
          .resize({ width: 60 })
          .toBuffer();

        // รวม QR Code กับโลโก้
        const qrWithLogo = await sharp(qrCodeBuffer)
          .composite([{ input: logoBuffer, gravity: 'center' }])
          .toBuffer();

        qrCodeBuffer = qrWithLogo;
        console.log('เพิ่มโลโก้ลงใน QR Code สำเร็จ');
      } catch (error) {
        console.error(`ไม่สามารถเพิ่มโลโก้ลงใน QR Code ได้: ${error}`);
      }

      // วาง QR Code บนพื้นหลัง
      const finalImage = await sharp(background)
        .composite([{ input: qrCodeBuffer, top: 450, left: 250 }])
        .toBuffer();

      // บันทึกภาพและสร้าง URL
      const imageFilename = `${codeName}.png`;
      const imageUrl = await saveImage(finalImage, imageFilename);

      // เตรียมข้อความส่งให้ผู้ใช้
      const tz = 'Asia/Bangkok';
      const currentTime = new Date().toLocaleString('th-TH', { timeZone: tz });

      const messageText = `${codeName}
${codeTemplate}

🔹 ผู้ให้บริการเครือข่าย: ${provider.toUpperCase()}
⚡ โปรโตคอล: VLESS ผ่าน WebSocket
📡 เซิร์ฟเวอร์: ${serverHost}
🔒 ระบบความปลอดภัย: เข้ารหัส AES-256
🌐 ประสิทธิภาพเครือข่าย: ปรับแต่งให้เหมาะสมสำหรับความเร็วสูงสุด

📅 ดึงโค้ดเมื่อ: ${currentTime} 🕰

🤖 ดึงโค้ดโดยบอท: XCELLENT O5. </>
🏷️ กลุ่ม: CKOI VIP`;

      // ส่งข้อความถึงผู้ใช้
      for (const userId of userIds) {
        try {
          await client.pushMessage(userId, [
            {
              type: 'image',
              originalContentUrl: imageUrl,
              previewImageUrl: imageUrl,
            },
            {
              type: 'text',
              text: messageText,
            },
          ]);
          console.log(`ส่งโค้ด ${codeName} ไปยังผู้ใช้ ${userId} สำเร็จ`);
        } catch (error) {
          console.error(`ไม่สามารถส่งข้อความถึงผู้ใช้ ${userId}: ${error}`);
        }
      }
    } else {
      console.error(`ไม่รู้จักขั้นตอนการสร้างโค้ด: ${currentStep}`);
      return;
    }
  } catch (error) {
    console.error(`เกิดข้อผิดพลาดใน generateCodeAuto: ${error}`);
  }
}

function sendCodeCountUpdate() {
  const messageText = `📊 สรุปจำนวนโค้ดที่สร้างทั้งหมด

🔴 TRUE V2: ${trueV2Count} โค้ด`;

  // ส่งข้อความถึงผู้ใช้
  for (const userId of userIds) {
    try {
      client.pushMessage(userId, {
        type: 'text',
        text: messageText,
      });
      console.log(`ส่งข้อความอัปเดตจำนวนโค้ดถึงผู้ใช้ ${userId} สำเร็จ`);
    } catch (error) {
      console.error(`ไม่สามารถส่งข้อความถึงผู้ใช้ ${userId}: ${error}`);
    }
  }
}

// ตั้งค่า webhook endpoint
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
      console.error(error);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    userIds.add(userId);
    // ตอบกลับผู้ใช้
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'สวัสดีครับ! คุณสามารถรอรับโค้ดจากบอทได้เลย',
    });
  }
  return Promise.resolve(null);
}

// ตั้งค่า Scheduler
schedule.scheduleJob('0 * * * *', generateCodeAuto); // รันทุกชั่วโมง
schedule.scheduleJob('0 0 * * *', sendCodeCountUpdate); // รันทุกวันตอนเที่ยงคืน

// ให้บริการไฟล์ในโฟลเดอร์ static
app.use('/static', express.static(path.join(__dirname, 'static')));

// เริ่มต้นเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์เริ่มต้นที่พอร์ต ${port}`);
});
