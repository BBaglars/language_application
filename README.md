# Dil Öğrenme Uygulaması

Kapsamlı backend ve test altyapısıyla geliştirilen bu uygulama, kullanıcıların yabancı dil öğrenme süreçlerini kolaylaştırmak için tasarlanmıştır. RESTful API mimarisiyle, kelime, kategori, çeviri ve kullanıcı yönetimi gibi temel işlevleri sunar. Proje, modern yazılım geliştirme standartlarına uygun olarak birim ve entegrasyon testleriyle güvence altına alınmıştır.

## Özellikler

- **Kelime Yönetimi:** Kelime ekleme, güncelleme, silme, kategoriye ekleme ve çeviri işlemleri.
- **Kategori Yönetimi:** Kategoriler oluşturma, güncelleme, silme ve kelimelerle ilişkilendirme.
- **Çeviri Sistemi:** Kelimeler arası çeviri ekleme ve kaldırma.
- **RESTful API:** Tüm işlemler için açık ve standartlara uygun uç noktalar.
- **Test Altyapısı:** Birim ve entegrasyon testleriyle güvenli geliştirme.
- **Gelişmiş Hata Yönetimi:** Anlaşılır ve tutarlı hata mesajları.

## API Kullanımı

Tüm uç noktalar `/api` ile başlar. Örnekler:
- `GET /api/words` — Kelimeleri listeler
- `POST /api/words` — Yeni kelime ekler
- `POST /api/words/:id/categories/:categoryId` — Kelimeyi kategoriye ekler
- `POST /api/words/:id/translations` — Kelimeye çeviri ekler

Daha fazla detay için [API dokümantasyonuna](http://localhost:3000/api-docs) bakabilirsiniz.

## Testler

Proje, **birim** ve **entegrasyon** testleriyle kapsamlı şekilde test edilmiştir.

- **Birim Testleri:** Controller ve model fonksiyonlarının izole testleri (`tests/unit/`).
- **Entegrasyon Testleri:** Gerçek veritabanı ve API üzerinden uçtan uca testler (`tests/integration/`).

Testleri çalıştırmak için:
```bash
npm test
```

Testler Jest ile yazılmıştır ve kodun büyük bir kısmı otomatik olarak kontrol edilmektedir. Testler, hata yönetimi ve uç durumlar dahil olmak üzere tüm ana işlevleri kapsamaktadır.

## Katkı ve Geliştirme

Pull request'ler ve katkılar memnuniyetle karşılanır. Lütfen kodunuzu göndermeden önce testlerinizi çalıştırmayı unutmayın.

## Lisans

MIT 

![image](https://github.com/user-attachments/assets/f30c1314-a3c3-47b2-a95c-b66baddc0e6b)
