# Kuka Kazan

Panayır temalı top atma / kuka devirme oyunu (HTML5 Canvas).

## Çalıştırma

Derleme adımı yok. Klasörü herhangi bir web sunucusuna kopyalayıp açın:

- XAMPP: klasörü `C:\xampp\htdocs\kuka` içine kopyalayın, `http://localhost/kuka/` adresini açın.
- `index.html` dosyasına çift tıklayarak açmayın; tarayıcı modül dosyasını `file://` üzerinden yüklemez.

## Yapı

- `index.html` – sayfa ve kanvas
- `src/kuka-kazan.js` – oyunun tüm kodu
- `sprites/` – görseller (3D modellerden üretilen kuka ve toplar dahil)

## Not: kurtarılmış kod

Asıl TypeScript kaynağı bulut ortamı sıfırlanınca kayboldu (GitHub'a o dönem gönderilemiyordu).
Bu depodaki kod, yayındaki derlenmiş oyundan geri çıkarıldı ve okunabilir biçime getirildi:
oyun birebir aynı çalışır, ancak özgün açıklamalar ve tür bilgileri yoktur, yerel değişken adlarının
çoğu kısaltılmıştır (sınıf ve metot adları korunmuştur). Asıl kaynak (`kuka-kaynak.zip`) bulunursa
ona geri dönülebilir.
