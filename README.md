# Dil Öğrenme Uygulaması

Bu proje, kullanıcıların yabancı dil öğrenmelerine yardımcı olan bir web uygulamasıdır.

## Özellikler

- Kullanıcı yönetimi ve kimlik doğrulama
- Kelime öğrenme ve pratik yapma
- Kategorilere göre kelime grupları
- Oyunlar ve alıştırmalar
- İlerleme takibi
- Başarılar ve rozetler
- Yapay zeka destekli öğrenme

## Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- PostgreSQL
- Firebase Admin SDK
- OpenAI API

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullanici/dil-ogrenme-app.git
cd dil-ogrenme-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin:
```env
# Uygulama
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dil_ogrenme
DB_USER=postgres
DB_PASSWORD=your_password

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# OpenAI
OPENAI_API_KEY=your_api_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

5. Veritabanını oluşturun:
```bash
createdb dil_ogrenme
```

6. Migration'ları çalıştırın:
```bash
npm run migrate:up
```

7. Uygulamayı başlatın:
```bash
npm run dev
```

## API Dokümantasyonu

API dokümantasyonuna erişmek için:
```
http://localhost:3000/api-docs
```

## Test

Testleri çalıştırmak için:
```bash
npm test
```

## Lisans

MIT 