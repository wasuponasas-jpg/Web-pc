# Firebase PC Control

ระบบควบคุม PC ผ่านเว็บโดยใช้ Firebase Realtime Database

## วิธีติดตั้ง
1. Clone โปรเจกต์นี้ไปที่เครื่อง PC
2. รันคำสั่ง `npm install`
3. นำไฟล์ `serviceAccountKey.json` จาก Firebase Console มาวางไว้ในโฟลเดอร์หลัก
4. แก้ไข `databaseURL` ใน `agent.js` และใส่ Firebase Config ใน `index.html`
5. รันโปรแกรมด้วยคำสั่ง `node agent.js`

## ฟีเจอร์
- สั่ง Shutdown / Restart
- สั่งรัน Shell Command (CMD)
- ถ่ายรูปหน้าจอ (Screenshot) ดูผ่านเว็บ
