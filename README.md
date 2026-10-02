# İade Kabul Programı

Kargo ile geri gelen iadeleri barkod okutarak kabul etmek, fotoğraflamak, durumunu (Yeniden Satılabilir / İmha)
belirlemek ve sonunda Excel raporu almak için tarayıcıda çalışan program. Kurulum veya sunucu gerekmez; veriler
yalnızca kullanılan bilgisayarın tarayıcısında saklanır.

## Çalıştırma

| Sürüm | Nasıl açılır | Canlı kamera |
|---|---|---|
| **Bilgisayar sürümü** (önerilen) | İndirilen `iade-kabul.html` dosyasını Chrome/Edge ile çift tıklayarak açın. İnternet gerekmez. | Var |
| Claude sayfası | claude.ai Artifact bağlantısından açılır. Kamera alanındaki **Bilgisayar sürümünü indir** ile bilgisayar sürümü indirilir. | Yok (platform engeli); fotoğraf dosyadan/telefon kamerasından eklenir |
| Geliştirme | Depodaki `index.html` dosyasını açın. | Var |

İlk açılışta kamera izni sorulunca **İzin ver** deyin, sonra sağ üstten **Excel Yükle** ile Sentos sipariş Excel'ini
yükleyin. Yeni sipariş dosyası geldiğinde tekrar yükleyip "Mevcut listeye ekle" diyebilirsiniz. Barkod okuyucu klavye
gibi çalışır; ek ayar gerekmez.

## İş akışı

1. **Kargo barkodu okutulur.** Kampanya Kodu (kargo kodu), Sipariş Numarası, Sipariş Kodu veya Sipariş ID ile eşleşir;
   barkod okunmazsa sipariş no ya da müşteri adı yazılabilir. Sipariş no, isim soyisim, kargo takip no, kargo firması,
   fatura no/tarihi, sipariş/kargo tarihleri, sipariş durumu ve teslim/iptal tarihi gösterilir.
2. **Ürün barkodu okutulur** ya da "Gelen adet" yazılıp **Onayla** denir. Eşleştirme Sentos barkodu, ürün/platform
   adındaki barkodlar, model kodu ve stok kodu ile yapılır. Siparişte olmayan barkod hangi ürüne ait olduğu seçilerek
   öğretilebilir.
3. **Fotoğraf** otomatik çekilir. Sağ paneldeki **Otomatik fotoğraf** seçenekleri birlikte seçilebilir: *Paket*
   (sipariş açılınca paket fotoğrafı), *Okutunca* (ürün barkodu okutulunca), *Onaylayınca* ("Onayla" / "Hepsini onayla"
   basılınca). Hiçbiri seçili değilse otomatik çekim kapalıdır. **Çekim gecikmesi** (0–3 sn) boyunca kamerada geri sayım
   görünür. Fotoğrafa tarih/saat, personel, sipariş no, kargo no ve ürün adı basılır.
   - **Hepsini onayla (F4):** gelmeyen tüm ürünleri sipariş adediyle tek seferde onaylar; tek bir toplu fotoğraf çekilir.
   - **Toplu fotoğraf:** ürünler yan yana dizilip tek kare çekilir ve siparişteki tüm onaylı ürünlere eklenir
     (ZIP'te `..._toplu_1.jpg` adıyla).
4. **Durum** seçilir: Yeniden Satılabilir / İmha. "Okutulan ürünün durumu" seçimi okutulan ürünlere otomatik uygulanır;
   aynı üründen farklı durumlar için "1 adet ayır" kullanılır.
5. **Ön İzleme ve Onay (F2):** kalemler, adetler, durumlar, fotoğraflar ve tutarlar kontrol edilip kaydedilir.
   Durumu seçilmemiş kalem varsa kaydedilmez.
6. **İade Kayıtları** sekmesinden **Excel İndir** veya **Excel + Fotoğraflar (ZIP)**.

## Uyarılar

Akış pencerelerle durdurulmaz; sorunlar kırmızı uyarı, hata sesi ve sesli uyarı ile bildirilir ("Tamam", "Tamam. Tüm
ürünler geldi", "Sipariş adedi aşıldı", "Bu ürün siparişte yok", "Dikkat. Bu sipariş daha önce iade alındı", "Eksik bir
ürün", "Kaydedildi"). Fazla okutulan ürün yine eklenir ve "Fazla" diye işaretlenir; daha önce iade alınmış sipariş yeni
iade olarak açılır ve **Önceki kaydı düzenle** düğmesi çıkar.

**İade Kayıtları** sekmesinde sorunlu kayıtlar *Eksik / Fazla / Tekrar iade / Fotoğrafsız* etiketleriyle gösterilir;
"Sadece uyarılı kayıtlar" ile süzülüp **Düzenle** ile düzeltilir. Sesli uyarı sağ panelden kapatılabilir (Türkçe okuma
için bilgisayarda Türkçe ses paketi gerekir).

## Excel çıktısı

"İadeler" sayfasında her ürün kalemi bir satırdır: İade Tarihi · Personel · Sipariş No · İsim Soyisim · Kargo Takip No ·
Kargo Firması · Kanal/Mağaza · Fatura No · Fatura Tarihi · Ürün · Barkod · Sipariş Adedi · İade Adedi · Gelmeyen Adet ·
**Durum** · Birim Fatura Fiyatı (KDV Hariç) · KDV % · Birim Fatura Fiyatı (KDV Dahil) · Toplam Fatura Tutarı · Fotoğraf
Dosyaları · Fotoğraf · Not. "Özet" sayfasında durum bazında toplamlar bulunur. ZIP'te fotoğraflar
`fotograflar/<SiparişNo>/` klasörlerindedir.

Sentos'taki "Birim Fiyat" KDV hariçtir; ürünün KDV oranı siparişin KDV matrahlarıyla eşleştirilerek bulunur.

## Kamera açılmıyorsa

Kamera alanındaki **Kamera tanılama** düğmesi nedeni ve çözümü gösterir. Sık nedenler:

- **Claude sayfasında** canlı kamera hiç açılmaz, izin de sorulmaz → bilgisayar sürümünü kullanın.
- **İzin engelli** → adres çubuğundaki simge → Kamera → İzin ver (veya `chrome://settings/content/camera`), sayfayı yenileyin.
- **Windows** → Ayarlar → Gizlilik ve güvenlik → Kamera → "Masaüstü uygulamalarının kameraya erişmesine izin ver" açık olmalı.
- **Kamera meşgul** → Teams, Zoom, WhatsApp veya Kamera uygulamasını kapatıp **Kamerayı Aç**'a basın.

## Kısayollar

`F2` ön izleme ve onay · `F4` hepsini onayla · `F6` / `F7` son eklenen kalemi Yeniden Satılabilir / İmha yap · Odak başka yerdeyken okutulan
barkod otomatik olarak okutma kutusuna gider.

## Veriler

Sipariş listesi, iade kayıtları ve fotoğraflar tarayıcının yerel veritabanındadır; sayfa kapansa da kaybolmaz, yarım
kalan iade geri yüklenir. Her sürüm (bilgisayar dosyası, Claude sayfası) kendi kayıtlarını tutar. Tarayıcı verilerini
temizlemek kayıtları siler; düzenli olarak **Excel + Fotoğraflar (ZIP)** alın. Müşteri bilgisi içeren Excel dosyaları
depoya eklenmez (`.gitignore`).

## Geliştirme

- `index.html`, `css/app.css` – arayüz
- `js/parser.js` – Sentos Excel çözümleyici (ürün, barkod, adet, fiyat, KDV)
- `js/app.js` – okutma, fotoğraf, onay, ön izleme, kayıtlar
- `js/camera.js` – kamera ve fotoğraf işleme
- `js/export.js` – Excel ve ZIP çıktısı
- `js/db.js` – yerel veritabanı (IndexedDB)
- `vendor/` – SheetJS (okuma), ExcelJS (yazma), JSZip
- `python3 tools/build_single.py` → `dist/iade-kabul-bilgisayar.html` (bilgisayar sürümü; kullanıcıya `iade-kabul.html`
  adıyla verilir) ve `dist/iade-kabul.html` (Artifact) üretir.
