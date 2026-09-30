# İade Kabul Programı

Kargo ile geri gelen iadeleri barkod okutarak kabul etmek, fotoğraflamak, durumunu (Yeniden Satılabilir / İmha)
belirlemek ve sonunda Excel raporu almak için tarayıcıda çalışan program. Kurulum veya sunucu gerekmez;
veriler yalnızca kullanılan bilgisayarın tarayıcısında (IndexedDB) saklanır.

## Çalıştırma

1. Depoyu indirin ve `index.html` dosyasını **Google Chrome** veya **Microsoft Edge** ile açın.
2. Tarayıcı kamera izni isterse **İzin ver** deyin.
3. Sağ üstten **Excel Yükle** ile Sentos'tan alınan sipariş Excel'ini yükleyin. Liste tarayıcıda saklanır;
   yeni sipariş dosyası geldiğinde tekrar yükleyip "Mevcut listeye ekle" diyebilirsiniz.

### claude.ai üzerinde (Artifact)

`python3 tools/build_single.py iade-kabul.html` uygulamayı tek bir HTML dosyasına paketler (kütüphaneler cdnjs'den
yüklenir). Bu dosya claude.ai'de Artifact olarak yayınlanabilir. Artifact içinde canlı kamera açılmaz: onay anında
fotoğraf seçme penceresi açılır (telefonda doğrudan kamera uygulaması açılır). Excel/ZIP indirmeleri kaydetme onayı ile
yapılır.

> Barkod okuyucu klavye gibi çalışır (okutunca sonuna Enter ekler). Ek bir ayar gerekmez.

### Tek dosya bilgisayar sürümü (önerilen, canlı kamera için)

`python3 tools/build_single.py --offline iade-kabul.html` bütün kütüphaneleri içine gömülü tek bir `iade-kabul.html`
üretir. Dosyayı depo bilgisayarına kopyalayıp **Chrome/Edge ile çift tıklayarak** açın; internet gerekmez ve canlı
kamera çalışır.

### Kamera açılmıyorsa

- **Claude sayfasında** canlı kamera hiç açılmaz; izin bile sorulmaz (platform engeli). Kamera alanındaki
  **Bilgisayar sürümünü indir** düğmesiyle tek dosya sürümü indirip çift tıklayarak açın. Artifact yayınlanırken
  çevrimdışı dosya `iade-kabul-bilgisayar.html` adıyla sayfanın yanına eklenmelidir.
- Kamera alanındaki **Kamera tanılama** düğmesi nedeni ve önerilen çözümü gösterir.
- **İzin engelli:** adres çubuğunun solundaki simge → Kamera → *İzin ver*, sonra sayfayı yenileyin.
- **Windows:** Ayarlar → Gizlilik ve güvenlik → Kamera → *Kamera erişimi* ve *Masaüstü uygulamalarının kameraya
  erişmesine izin ver* açık olmalı.
- **Kamera meşgul:** Teams, Zoom, WhatsApp veya Kamera uygulamasını kapatıp **Kamerayı Aç**'a basın.
- Program hatanın nedenini kamera alanında yazar.

## İş akışı

| Adım | Yapılan |
|---|---|
| 1 | Kargo poşetindeki barkod okutulur. Program **Kampanya Kodu** (kargo kodu), **Sipariş Numarası**, **Sipariş Kodu** veya **Sipariş ID** ile eşleştirir. Barkod okunmazsa sipariş no ya da müşteri adı yazılabilir. Sipariş No, isim soyisim, kargo takip no, kargo firması, fatura no/tarihi, sipariş tarihi, kargoya son teslim tarihi, sipariş durumu ve teslim/iptal tarihi gösterilir. |
| 2 | Ürün barkodu okutulur **veya** "Gelen adet" kutusuna adet yazılıp **Onayla** denir. Eşleştirme Sentos barkodu, ürün/platform adındaki barkodlar, model kodu ve stok kodu ile yapılır (UPC/EAN baştaki 0 farkı tolere edilir). Siparişte olmayan barkod okutulursa hangi ürüne ait olduğu seçilebilir; barkod hatırlanır. |
| 2-1 | **Otomatik fotoğraf** (sağ panel): *Paket* modunda sipariş açılınca paketin tek fotoğrafı, *Her ürün* modunda her okutma/onayda ürün fotoğrafı çekilir; *Kapalı* modunda elle çekilir. **Çekim gecikmesi** (0–3 sn) boyunca kamerada geri sayım görünür, ürünü/paketi yerleştirmeye zaman kalır. Fotoğrafın altına tarih/saat, personel, sipariş no, kargo no ve ürün adı basılır. Kamera yoksa dosyadan fotoğraf eklenir. |
| 3 | Her kalem için durum seçilir: **Yeniden Satılabilir** veya **İmha**. Sağ paneldeki "Okutulan ürünün durumu" seçimi okutulan ürünlere otomatik uygulanır. Aynı üründen farklı durumlar için "1 adet ayır" kullanılır. |
| 4 | **Ön İzleme ve Onay (F2)**: tüm kalemler, adetler, durumlar, fotoğraflar ve tutarlar gösterilir. Durumu seçilmemiş kalem varsa onay verilemez; eksik gelen ürünler ve fotoğrafsız kalemler uyarı olarak listelenir. "Kontrol ettim" işaretlenip kaydedilir. |
| 5 | **İade Kayıtları** sekmesinden **Excel İndir** veya **Excel + Fotoğraflar (ZIP)**. |

## Excel çıktısı

"İadeler" sayfasında her ürün kalemi bir satırdır:

İade Tarihi · Personel · Sipariş No · İsim Soyisim · Kargo Takip No · Kargo Firması · Kanal/Mağaza · Fatura No ·
Fatura Tarihi · Ürün · Barkod · Sipariş Adedi · İade Adedi · Gelmeyen Adet · **Durum** (Yeniden Satılabilir / İmha /
Gelmedi) · Birim Fatura Fiyatı (KDV Hariç) · KDV % · Birim Fatura Fiyatı (KDV Dahil) · Toplam Fatura Tutarı (KDV Dahil) ·
Fotoğraf Dosyaları · Fotoğraf (küçük resim) · Not

"Özet" sayfasında durum bazında adet ve tutar toplamları bulunur. ZIP içinde Excel ile birlikte fotoğraflar
`fotograflar/<SiparişNo>/` klasörlerinde, Excel'deki dosya adlarıyla yer alır.

**Fiyat notu:** Sentos çıktısındaki "Birim Fiyat" KDV hariç tutardır (KDV matrahlarıyla birebir tutuyor). Ürünün KDV
oranı, siparişteki %1/%10/%20 KDV matrahları ile eşleştirilerek bulunur ve KDV dahil fiyat buna göre hesaplanır.

## Uyarılar (pencere açılmaz)

Akışı durdurmamak için sorunlar pencere yerine ekranda kırmızı uyarı, hata sesi ve **sesli uyarı** ile bildirilir:

- "Sipariş bulundu. 3 ürün", "Tamam", "Tamam. Tüm ürünler geldi", "Kaydedildi"
- "Sipariş adedi aşıldı" – ürün yine eklenir, kalemde **Fazla** yazar
- "Dikkat. Bu sipariş daha önce iade alındı" – yeni iade olarak devam edilir; üstte **Önceki kaydı düzenle** düğmesi çıkar
- "Bu ürün siparişte yok", "Sipariş bulunamadı", ön izlemede "Eksik bir ürün"

**İade Kayıtları** sekmesinde uyarılı kayıtlar sarı satır ve *Eksik / Fazla / Tekrar iade / Fotoğrafsız* etiketleriyle
gösterilir; "Sadece uyarılı kayıtlar" ile süzülüp **Düzenle** ile düzeltilebilir. Sesli uyarı sağ panelden kapatılabilir
(Windows'ta Türkçe ses paketi yüklüyse Türkçe okunur).

## Kısayollar

- `F2` – Ön izleme ve onay
- `F6` / `F7` – Son eklenen kalemi Yeniden Satılabilir / İmha yap
- Odak başka yerdeyken okutulan barkod otomatik olarak okutma kutusuna gider.

## Veriler ve yedek

- Sipariş listesi, iade kayıtları ve fotoğraflar tarayıcının yerel veritabanında tutulur; sayfa kapansa da kaybolmaz,
  yarım kalan iade de geri yüklenir.
- Tarayıcı verilerini temizlemek kayıtları siler. Düzenli olarak **Excel + Fotoğraflar (ZIP)** alın.
- Müşteri bilgisi içeren sipariş Excel'lerini bu depoya eklemeyin (`.gitignore` `*.xlsx` dosyalarını hariç tutar).

## Dosyalar

- `index.html`, `css/app.css` – arayüz
- `js/parser.js` – Sentos Excel çözümleyici (ürün, barkod, adet, fiyat, KDV)
- `js/app.js` – okutma, onay, ön izleme ve kayıt akışı
- `js/camera.js` – kamera ve fotoğraf
- `js/export.js` – Excel ve ZIP çıktısı
- `js/db.js` – yerel veritabanı
- `vendor/` – SheetJS (okuma), ExcelJS (yazma), JSZip
