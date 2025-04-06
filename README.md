# Dil Öğrenme Uygulaması

Bu proje, kullanıcıların yeni bir dil öğrenmelerine yardımcı olan interaktif bir web uygulamasıdır.

## Özellikler

- Kullanıcı kaydı ve girişi (Firebase Authentication)
- Kelime öğrenme ve pratik yapma
- Kategori bazlı kelime grupları
- Oyunlaştırılmış öğrenme deneyimi
- AI destekli metin üretimi ve analizi
- İlerleme takibi ve istatistikler
- Bildirim sistemi
- Admin paneli

## Teknolojiler

- Node.js
- Express.js
- MySQL
- Redis
- Firebase
- OpenAI API
- JWT
- Jest (Test)


## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış yapma
- `POST /api/auth/forgot-password` - Şifre sıfırlama isteği
- `POST /api/auth/reset-password` - Şifre sıfırlama

### Kelimeler
- `GET /api/words` - Kelime listesi
- `POST /api/words` - Yeni kelime ekleme (Admin)
- `GET /api/words/:id` - Kelime detayları
- `PUT /api/words/:id` - Kelime güncelleme (Admin)
- `DELETE /api/words/:id` - Kelime silme (Admin)

### Kategoriler
- `GET /api/categories` - Kategori listesi
- `POST /api/categories` - Yeni kategori ekleme (Admin)
- `GET /api/categories/:id` - Kategori detayları
- `PUT /api/categories/:id` - Kategori güncelleme (Admin)
- `DELETE /api/categories/:id` - Kategori silme (Admin)

### Oyunlar
- `POST /api/games/sessions` - Oyun oturumu başlatma
- `POST /api/games/sessions/:sessionId/answers` - Cevap gönderme
- `POST /api/games/sessions/:sessionId/complete` - Oyun oturumunu tamamlama
- `GET /api/games/stats` - Oyun istatistikleri

### Kullanıcı
- `GET /api/users/profile` - Kullanıcı profili
- `PUT /api/users/profile` - Profil güncelleme
- `GET /api/users/stats` - Kullanıcı istatistikleri
- `GET /api/users/achievements` - Başarılar
- `GET /api/users/progress` - İlerleme durumu

### AI
- `POST /api/ai/generate` - Metin üretme
- `POST /api/ai/check-grammar` - Dilbilgisi kontrolü
- `POST /api/ai/analyze` - Metin analizi
- `POST /api/ai/translate` - Metin çevirisi

### Admin
- `GET /api/admin/logs` - Admin logları
- `GET /api/admin/stats` - Sistem istatistikleri
- `POST /api/admin/backup` - Yedekleme
- `GET /api/admin/settings` - Sistem ayarları

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- Website: [www.example.com](http://www.example.com)
- Email: info@example.com
- Twitter: [@example](https://twitter.com/example) 