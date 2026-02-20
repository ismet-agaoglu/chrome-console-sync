# Chrome Console Sync Extension

Bu proje, Chrome tarayıcısındaki konsol loglarını yakalayıp yerel bir sunucudaki SQLite veritabanına senkronize eden bir sistemdir.

## Özellikler
- **Popup UI:** Uzantıyı aktif/pasif hale getiren bir toggle.
- **Floating Button:** Sayfanın solunda beliren, özel script'i tetikleyen buton.
- **Console Interceptor:** `console.log` çıktılarını gerçek zamanlı yakalar.
- **Backend API:** Gelen logları SQLite veritabanına kaydeder.

## Yol Haritası (Milestones)
- [ ] 1. Temel Chrome Extension Yapısı (Manifest v3)
- [ ] 2. Popup UI ve Durum Yönetimi (Storage API)
- [ ] 3. Content Script: Floating Button Enjeksiyonu
- [ ] 4. Console.log Hooking Mekanizması
- [ ] 5. Backend: Node.js/Express API ve SQLite Entegrasyonu
- [ ] 6. Veri İletimi: Extension -> Backend Sync

## Geliştirme Notları
- Uzantı, güvenliği sağlamak için sadece belirlenen domainlerde veya manuel tetikleme ile çalışacaktır.
- Performans için loglar toplu (batch) veya anlık gönderilebilir.
