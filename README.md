# ระบบนิเทศชั้นเรียน กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ

เว็บแอปสำหรับบันทึกการนิเทศชั้นเรียน โรงเรียนผดุงนารี พร้อมรายงานรายบุคคล, dashboard รวม, CSV export และการบันทึกข้อมูลออนไลน์ด้วย Netlify Blobs

## เปิดใช้งานในเครื่อง

ต้องเปิดผ่าน server เพื่อให้ระบบบันทึกไฟล์รูปภาพและรายงานลงโฟลเดอร์โปรเจกต์ได้:

```bash
node server.mjs
```

จากนั้นเปิด `http://127.0.0.1:4173`

## การบันทึกข้อมูล

เมื่อกดบันทึกรายงาน ระบบจะส่งข้อมูลไปที่ `server.mjs` ผ่าน endpoint `/api/supervision-records`

## Deploy ขึ้น Netlify

1. อัปโหลดโปรเจกต์นี้ขึ้น GitHub
2. เข้า Netlify แล้วเลือก `Add new site` > `Import an existing project`
3. เลือก repository ของโปรเจกต์นี้
4. ตั้งค่า build:
   - Build command: เว้นว่างได้
   - Publish directory: `.`
5. Deploy
6. Netlify จะใช้ `netlify.toml` และ `_redirects` เพื่อ route `/api/supervision-records` ไปที่ Function
7. ข้อมูลออนไลน์จะเก็บใน Netlify Blobs store ชื่อ `supervision-records`

สำหรับปุ่มล้างข้อมูลออนไลน์ ให้ตั้ง Environment variable ชื่อ `SUPERVISION_ADMIN_TOKEN` ใน Netlify ก่อน เมื่อกดล้างข้อมูลบนเว็บออนไลน์ ระบบจะถาม token นี้ เพื่อกันคนทั่วไปลบข้อมูลทั้งหมด

## แก้ปัญหา Netlify Function ไม่ทำงาน

ถ้ากดทดสอบแล้วขึ้นข้อความประมาณ `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` แปลว่าเว็บได้รับหน้า HTML กลับมาแทน JSON จาก Function

สาเหตุที่พบบ่อย:

- อัปเว็บด้วยการลากไฟล์เข้า Netlify แบบ manual deploy ทำให้ Function ไม่ถูก build
- ไม่ได้อัปไฟล์ `functions/supervision-records.js`
- ไม่ได้อัปไฟล์ `netlify.toml`
- Deploy จาก GitHub ไม่สำเร็จเพราะติดตั้ง dependency ไม่ผ่าน

วิธีแก้ที่แนะนำ:

1. ใช้ GitHub repository แล้วให้ Netlify deploy จาก GitHub
2. ตรวจว่า repo มี `netlify.toml`
3. ตรวจว่า repo มี `functions/supervision-records.js`
4. ใน Netlify ไปที่ `Deploys` แล้วเปิด deploy log ดูว่ามี Functions ถูก deploy
5. ลองเปิด URL นี้โดยตรง:
   `https://ชื่อเว็บของคุณ.netlify.app/.netlify/functions/supervision-records`
6. ถ้าถูกต้องควรเห็น JSON ประมาณ:
   `{"ok":true,"records":[]}`
7. ลองเปิดอีก URL:
   `https://ชื่อเว็บของคุณ.netlify.app/api/ping`
8. ถ้ายังได้ Page not found ให้กด `Clear cache and deploy site` ใน Netlify แล้วตรวจว่า deploy log มีคำว่า `Functions bundling` หรือ `functions/supervision-records`

## ไฟล์ข้อมูล

- เมื่อรัน local ด้วย `node server.mjs` ข้อมูลจะเก็บใน `data/supervision-records`
- เมื่อ deploy บน Netlify ข้อมูลจะเก็บใน Netlify Blobs
- แต่ละรายการนิเทศจะมี `report.json` และรูปภาพหลักฐาน
- browser ยังเก็บสำเนาชั่วคราวใน `localStorage` เพื่อให้หน้าเว็บแสดงผลได้ลื่นขึ้น

## หมายเหตุ

ต้องเปิดหน้าเว็บผ่าน `http://127.0.0.1:4173` หรือ server เดียวกันนี้ หากเปิด `index.html` ตรง ๆ ระบบจะไม่สามารถบันทึกลง server ได้
