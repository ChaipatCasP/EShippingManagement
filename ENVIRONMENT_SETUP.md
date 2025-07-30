# Environment Setup Guide

คู่มือการตั้งค่า Environment Variables สำหรับ E-Shipping Management System

## 📋 การติดตั้งเบื้องต้น

### 1. สร้างไฟล์ Environment

```bash
# คัดลอกไฟล์ template
cp .env.example .env

# แก้ไขค่าต่างๆ ตามความเหมาะสม
nano .env
```

### 2. ค่าที่ต้องตั้งก่อนใช้งาน

#### 🔐 Security (จำเป็น)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret
ENCRYPTION_KEY=your-32-character-encryption-key
```

#### 🗄️ Database (จำเป็น)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/eshipping_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=eshipping_db
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

#### 📧 Email Service (แนะนำ)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🔧 การตั้งค่าแต่ละส่วน

### API Configuration
- `VITE_API_BASE_URL`: URL ของ Backend API
- `VITE_API_TIMEOUT`: Timeout สำหรับ API calls (มิลลิวินาที)

### Authentication
- `VITE_AUTH_TOKEN_KEY`: Key สำหรับเก็บ token ใน localStorage
- `VITE_AUTH_TOKEN_EXPIRY`: อายุของ token (วินาที)

### File Upload
- `VITE_MAX_FILE_SIZE`: ขนาดไฟล์สูงสุด (bytes)
- `VITE_ALLOWED_FILE_TYPES`: ประเภทไฟล์ที่อนุญาต (คั่นด้วย comma)

### Feature Flags
```env
VITE_FEATURE_NOTIFICATIONS=true    # เปิด/ปิด การแจ้งเตือน
VITE_FEATURE_ANALYTICS=true        # เปิด/ปิด Analytics
VITE_FEATURE_EXPORT=true           # เปิด/ปิด การ Export
VITE_FEATURE_BULK_OPERATIONS=true  # เปิด/ปิด การทำงานแบบ Bulk
```

## 🏢 การตั้งค่าบริษัท

```env
VITE_COMPANY_NAME="บริษัทของคุณ จำกัด"
VITE_COMPANY_ADDRESS="ที่อยู่บริษัท"
VITE_COMPANY_PHONE="+66-x-xxx-xxxx"
VITE_COMPANY_EMAIL="info@company.com"
```

## 🚚 การตั้งค่าผู้ให้บริการขนส่ง

### DHL
```env
DHL_API_KEY=your-dhl-api-key
DHL_API_SECRET=your-dhl-secret
DHL_SANDBOX=true  # false สำหรับ production
```

### FedEx
```env
FEDEX_API_KEY=your-fedex-api-key
FEDEX_SECRET_KEY=your-fedex-secret
FEDEX_SANDBOX=true
```

### UPS
```env
UPS_API_KEY=your-ups-api-key
UPS_SECRET=your-ups-secret
UPS_SANDBOX=true
```

### Thailand Post
```env
THAILAND_POST_API_KEY=your-thailand-post-api-key
```

## 💳 การตั้งค่าระบบชำระเงิน (Optional)

### Stripe
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🗺️ Google Services (Optional)

```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## ☁️ AWS S3 (Optional - สำหรับ file storage)

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket-name
```

## 📱 Push Notifications (Optional)

### Firebase
```env
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### SMS (Twilio)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🐛 Development Settings

```env
VITE_DEV_TOOLS=true      # เปิด Dev Tools
VITE_DEBUG_MODE=true     # เปิด Debug Mode
VITE_MOCK_API=false      # ใช้ Mock API แทน
```

## 🌍 Localization

```env
VITE_DEFAULT_LANGUAGE=th           # ภาษาเริ่มต้น
VITE_SUPPORTED_LANGUAGES=th,en     # ภาษาที่รองรับ
VITE_DEFAULT_TIMEZONE=Asia/Bangkok # Timezone เริ่มต้น
VITE_DEFAULT_CURRENCY=THB          # สกุลเงินเริ่มต้น
```

## 🔍 Monitoring & Logging (Production)

```env
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-license
LOG_LEVEL=warn
```

## 📂 ไฟล์ Environment แต่ละแบบ

- `.env` - Development environment (local)
- `.env.example` - Template file (commit ได้)
- `.env.production` - Production environment
- `.env.staging` - Staging environment (ถ้ามี)

## ⚠️ ข้อควรระวัง

### Security
1. **ห้าม commit ไฟล์ .env** ที่มีข้อมูลจริง
2. ใช้ **strong passwords และ secrets**
3. เปลี่ยน **JWT secrets** ในทุก environment
4. ใช้ **HTTPS** ใน production

### Best Practices
1. ใช้ **environment-specific files**
2. **Validate environment variables** ตอน startup
3. ใช้ **default values** ที่เหมาะสม
4. **Document ทุก variable** ที่จำเป็น

## 🧪 การทดสอบ

```bash
# ทดสอบว่า environment variables โหลดถูกต้อง
npm run dev

# ตรวจสอบ console ว่ามี error หรือไม่
# ดู message "✅ Environment validation passed"
```

## 🆘 Troubleshooting

### ปัญหาที่พบบ่อย

1. **API ติดต่อไม่ได้**
   - ตรวจสอบ `VITE_API_BASE_URL`
   - ตรวจสอบว่า Backend รันอยู่หรือไม่

2. **Authentication ไม่ทำงาน**
   - ตรวจสอบ `JWT_SECRET`
   - ตรวจสอบ token expiry settings

3. **File upload ไม่ได้**
   - ตรวจสอบ `VITE_MAX_FILE_SIZE`
   - ตรวจสอบ `UPLOAD_DIR` permissions

4. **Email ไม่ส่ง**
   - ตรวจสอบ SMTP settings
   - ตรวจสอบ app password (Gmail)

### Log Messages
- `✅ Environment validation passed` - ทุกอย่างโอเค
- `❌ Environment validation failed` - มีค่าที่ไม่ถูกต้อง
