/*
 * Sentos sipariş Excel çıktısını okuyup sipariş nesnelerine çevirir.
 * Tarayıcıda window.IadeParser, Node'da module.exports olarak kullanılır.
 */
(function (root) {
  'use strict';

  // Excel başlıkları → iç alan adları. Farklı çıktılar için alternatif başlıklar eklenebilir.
  var ALIASES = {
    tarih: ['Tarih', 'Sipariş Tarihi'],
    siparisId: ['Sipariş ID'],
    siparisKodu: ['Sipariş Kodu'],
    cari: ['Sipariş Veren Cari'],
    urunler: ['Sipariş Verilen Ürün(ler)'],
    kanal: ['Kanal'],
    magaza: ['Mağaza'],
    durum: ['Sipariş Durumu'],
    toplam: ['Toplam Tutar'],
    platformIsim: ['Ürün Platform İsmi'],
    adet: ['Adet'],
    birimFiyat: ['Birim Fiyat'],
    faturaNo: ['E-Fatura No', 'Fatura No', 'Fatura Numarası'],
    faturaTarihi: ['Fatura Tarihi'],
    faturaAd: ['Fatura Ad/Soyad'],
    aliciAd: ['Alıcı Ad/Soyad'],
    adres: ['Alıcı Adres'],
    sehir: ['Şehir/Semt/PK'],
    telefon: ['Ev/Cep Telefonu'],
    siparisNo: ['Sipariş Numarası', 'Sipariş No'],
    odeme: ['Ödeme Tipi'],
    kargoKodu: ['Kampanya Kodu', 'Kargo Kodu', 'Kargo Takip No', 'Kargo Barkodu'],
    kargoFirma: ['Kargo Firması'],
    mail: ['Sipariş Veren Cari Mail'],
    kargoYazdirma: ['Kargo Bilgisi Yazdırılma Tarihi'],
    kargoSonTeslim: ['Kargo Son Teslim Tarihi'],
  };
  var KDV_ORANLARI = [0, 1, 8, 10, 18, 20];

  function normHeader(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR');
  }

  function cellStr(v) {
    if (v == null) return '';
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return String(v);
      return String(v);
    }
    if (v instanceof Date) return formatDate(v);
    return String(v).replace(/ /g, ' ').trim();
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function formatDate(d) {
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // "1.234,56" / "1234.56" / "271.53 TL" → sayı
  function parseNum(v) {
    if (typeof v === 'number') return v;
    var s = String(v == null ? '' : v).replace(/[^\d.,-]/g, '');
    if (!s) return null;
    var lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc > -1 && ld > -1) {
      s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (lc > -1) {
      s = s.replace(',', '.');
    }
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  // "1, 1, 2" veya 1 → [1,1,2]
  function parseList(v) {
    if (v == null || v === '') return [];
    if (typeof v === 'number') return [v];
    return String(v).split(/,\s+/).map(parseNum);
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  // Barkod karşılaştırması için normalizasyon: boşluk/tire at, büyük harf, baştaki sıfırları at (UPC/EAN farkı).
  function normCode(s) {
    var t = String(s == null ? '' : s).toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (/^\d+$/.test(t)) t = t.replace(/^0+/, '');
    return t;
  }

  var WARNING_RE = /Önemli Uyarı:[\s\S]*?">/g;
  // [stok kodu / ]ürün adı xN Adet[Barkod: XXX Desi: N]
  var ITEM_RE = /\s*(?:(\d{3,})\s\/\s)?([\s\S]+?) x(\d+) Adet(?:Barkod:\s*(\S*?)\s*Desi:\s*(\d+?(?:[.,]\d+)?)(?=\d{3,}\s\/\s|\s|$))?/g;

  function parseItemsText(text) {
    var t = String(text || '').replace(/ /g, ' ').replace(WARNING_RE, '\n');
    var out = [], m;
    ITEM_RE.lastIndex = 0;
    while ((m = ITEM_RE.exec(t)) !== null) {
      out.push({
        stokKodu: m[1] || '',
        ad: m[2].replace(/\s+/g, ' ').trim(),
        adet: parseInt(m[3], 10),
        barkod: (m[4] || '').trim(),
      });
    }
    return out;
  }

  // Platform isimlerini " / " ile böl; "Beden: Tek Ebat" gibi varyant parçalarını önceki isme geri ekle.
  function splitPlatformNames(text, n) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    if (!s) return [];
    if (n <= 1) return [s];
    var parts = s.split(' / ');
    var merged = [];
    parts.forEach(function (p) {
      if (merged.length && /^[A-Za-zÇĞİÖŞÜçğıöşü ]{2,20}:\s/.test(p)) merged[merged.length - 1] += ' / ' + p;
      else merged.push(p);
    });
    return merged.length === n ? merged : [];
  }

  function extractCodes(text) {
    var codes = [];
    var s = String(text || '');
    var m, re = /\b\d{8,14}\b/g;
    while ((m = re.exec(s)) !== null) codes.push(m[0]);
    // Platform isminin sonundaki model kodu (ör. TYC8GS6OON17169...)
    var last = s.trim().split(/\s+/).pop();
    if (last && last.length >= 6 && /\d/.test(last) && /^[0-9A-Za-z-]+$/.test(last)) codes.push(last);
    return codes;
  }

  // Her ürünün KDV oranını, satır toplamlarını KDV matrahlarıyla eşleştirerek bul.
  function assignKdv(items, buckets) {
    if (!buckets.length) return items.map(function () { return null; });
    if (buckets.length === 1) return items.map(function () { return buckets[0].oran; });
    var n = items.length, k = buckets.length;
    if (Math.pow(k, n) > 200000) return items.map(function () { return null; });
    var best = null, bestErr = Infinity, combo = new Array(n).fill(0);
    var total = Math.pow(k, n);
    for (var c = 0; c < total; c++) {
      var x = c;
      for (var i = 0; i < n; i++) { combo[i] = x % k; x = Math.floor(x / k); }
      var sums = new Array(k).fill(0);
      for (var j = 0; j < n; j++) sums[combo[j]] += (items[j].birimFiyat || 0) * items[j].adet;
      var err = 0;
      for (var b = 0; b < k; b++) err += Math.abs(sums[b] - buckets[b].matrah);
      if (err < bestErr) { bestErr = err; best = combo.slice(); }
    }
    return best.map(function (bi) { return buckets[bi].oran; });
  }

  function parseDurum(text) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    var m = s.match(/^([A-ZÇĞİÖŞÜ]+(?: [A-ZÇĞİÖŞÜ]+(?=\s|\d|$))*)/);
    var d = s.match(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}(?::\d{2})?/);
    return { etiket: m ? m[1] : s.slice(0, 40), tarih: d ? d[0] : '' };
  }

  function buildColumnIndex(header) {
    var idx = {};
    var norm = header.map(normHeader);
    Object.keys(ALIASES).forEach(function (key) {
      for (var i = 0; i < ALIASES[key].length; i++) {
        var p = norm.indexOf(normHeader(ALIASES[key][i]));
        if (p > -1) { idx[key] = p; break; }
      }
    });
    KDV_ORANLARI.forEach(function (o) {
      var p = norm.indexOf(normHeader('%' + o + ' KDV Matrahı'));
      if (p > -1) idx['matrah' + o] = p;
    });
    return idx;
  }

  function findHeaderRow(rows) {
    for (var r = 0; r < Math.min(rows.length, 15); r++) {
      var norm = rows[r].map(normHeader);
      var hits = 0;
      ['kampanya kodu', 'sipariş numarası', 'sipariş verilen ürün(ler)', 'sipariş kodu', 'kargo takip no'].forEach(function (h) {
        if (norm.indexOf(h) > -1) hits++;
      });
      if (hits >= 2) return r;
    }
    return -1;
  }

  function rowToOrder(row, idx) {
    function g(key) { return idx[key] == null ? '' : cellStr(row[idx[key]]); }
    function raw(key) { return idx[key] == null ? '' : row[idx[key]]; }

    var parsed = parseItemsText(g('urunler'));
    var adetList = parseList(raw('adet'));
    var fiyatList = parseList(raw('birimFiyat'));
    var n = parsed.length || adetList.length;
    var platformNames = splitPlatformNames(g('platformIsim'), n);

    // Ürün metni çözülemezse platform isimlerinden kalem üret.
    if (!parsed.length && n) {
      var pn = splitPlatformNames(g('platformIsim'), n);
      for (var z = 0; z < n; z++) parsed.push({ stokKodu: '', ad: pn[z] || g('platformIsim'), adet: adetList[z] || 1, barkod: '' });
    }

    var items = parsed.map(function (it, i) {
      var platformAd = platformNames[i] || '';
      var adet = it.adet || adetList[i] || 1;
      var birim = fiyatList.length === parsed.length ? fiyatList[i] : null;
      var codes = [];
      if (it.barkod) codes.push(it.barkod);
      codes = codes.concat(extractCodes(it.ad), extractCodes(platformAd));
      if (it.stokKodu) codes.push(it.stokKodu);
      var seen = {};
      var barkodlar = codes.filter(function (c) {
        var k = normCode(c);
        if (!k || seen[k]) return false;
        seen[k] = 1; return true;
      });
      return {
        idx: i,
        stokKodu: it.stokKodu,
        ad: it.ad,
        platformAd: platformAd,
        barkod: it.barkod || barkodlar[0] || '',
        barkodlar: barkodlar,
        adet: adet,
        birimFiyat: birim,
      };
    });

    var buckets = [];
    KDV_ORANLARI.forEach(function (o) {
      var v = parseNum(raw('matrah' + o));
      if (v != null && idx['matrah' + o] != null && String(raw('matrah' + o)).trim() !== '') buckets.push({ oran: o, matrah: v });
    });
    var kdvler = assignKdv(items, buckets);
    items.forEach(function (it, i) {
      it.kdv = kdvler[i];
      it.birimKdvDahil = it.birimFiyat != null && it.kdv != null ? round2(it.birimFiyat * (1 + it.kdv / 100)) : null;
    });

    var durum = parseDurum(g('durum'));
    var siparisNo = g('siparisNo') || g('siparisKodu');
    var o = {
      kargoKodu: g('kargoKodu'),
      siparisNo: siparisNo,
      siparisKodu: g('siparisKodu'),
      siparisId: g('siparisId'),
      tarih: g('tarih'),
      kanal: g('kanal'),
      magaza: g('magaza'),
      musteri: g('aliciAd') || g('faturaAd') || g('cari'),
      faturaAd: g('faturaAd'),
      aliciAd: g('aliciAd'),
      adres: g('adres'),
      sehir: g('sehir'),
      telefon: g('telefon'),
      mail: g('mail'),
      faturaNo: g('faturaNo'),
      faturaTarihi: g('faturaTarihi'),
      kargoFirma: g('kargoFirma'),
      kargoYazdirma: g('kargoYazdirma'),
      kargoSonTeslim: g('kargoSonTeslim'),
      odeme: g('odeme'),
      durum: durum.etiket,
      durumTarihi: durum.tarih,
      items: items,
    };
    o.uid = (o.kanal || 'X') + ':' + (o.siparisNo || o.siparisId || o.kargoKodu);
    return o;
  }

  // rows: sheet_to_json(header:1) çıktısı
  function parseRows(rows) {
    var h = findHeaderRow(rows);
    if (h < 0) throw new Error('Başlık satırı bulunamadı. "Kampanya Kodu" ve "Sipariş Numarası" sütunları olan Sentos sipariş çıktısını yükleyin.');
    var idx = buildColumnIndex(rows[h]);
    var orders = [];
    for (var r = h + 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || !row.some(function (c) { return String(c == null ? '' : c).trim() !== ''; })) continue;
      var o = rowToOrder(row, idx);
      if (!o.siparisNo && !o.kargoKodu) continue;
      orders.push(o);
    }
    return orders;
  }

  // Sipariş arama indeksi: kargo kodu, sipariş no, sipariş kodu, sipariş ID
  function buildIndex(orders) {
    var map = new Map();
    orders.forEach(function (o) {
      [o.kargoKodu, o.siparisNo, o.siparisKodu, o.siparisId].forEach(function (c) {
        var k = normCode(c);
        if (!k) return;
        var arr = map.get(k);
        if (!arr) map.set(k, (arr = []));
        if (arr.indexOf(o) < 0) arr.push(o);
      });
    });
    return map;
  }

  function findOrders(orders, index, query) {
    var q = normCode(query);
    if (!q) return [];
    var exact = index.get(q);
    if (exact) return exact.slice();
    var res = [];
    if (q.length >= 8) {
      // Kargo barkodu ön/son ek içerebilir: kısmi eşleşme
      index.forEach(function (arr, k) {
        if (k.length >= 8 && (q.indexOf(k) > -1 || k.indexOf(q) > -1)) {
          arr.forEach(function (o) { if (res.indexOf(o) < 0) res.push(o); });
        }
      });
    }
    if (!res.length && /[a-zçğıöşü]{2,}/i.test(String(query))) {
      var t = String(query).toLocaleLowerCase('tr-TR').trim();
      orders.forEach(function (o) {
        var hay = (o.musteri + ' ' + o.faturaAd + ' ' + o.aliciAd).toLocaleLowerCase('tr-TR');
        if (hay.indexOf(t) > -1) res.push(o);
      });
    }
    return res;
  }

  // Bazı Sentos çıktılarında <is xmlns="..."> satır içi metinler SheetJS tarafından okunamıyor;
  // dosyayı okumadan önce bu öznitelikleri temizle. JSZip ve XLSX global olarak verilmeli.
  function readWorkbook(arrayBuffer, JSZip, XLSX) {
    return JSZip.loadAsync(arrayBuffer).then(function (zip) {
      var names = Object.keys(zip.files).filter(function (n) {
        return /^xl\/(worksheets\/[^/]+|sharedStrings)\.xml$/.test(n);
      });
      return Promise.all(names.map(function (n) {
        return zip.file(n).async('string').then(function (t) {
          zip.file(n, t.replace(/<is\s+xmlns="[^"]*"\s*>/g, '<is>'));
        });
      })).then(function () { return zip.generateAsync({ type: 'uint8array' }); });
    }).catch(function () {
      return new Uint8Array(arrayBuffer); // zip değilse (xls/csv) olduğu gibi oku
    }).then(function (data) {
      var wb = XLSX.read(data, { type: 'array', cellDates: false });
      var rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      return parseRows(rows);
    });
  }

  var api = {
    readWorkbook: readWorkbook,
    parseRows: parseRows,
    parseItemsText: parseItemsText,
    parseNum: parseNum,
    normCode: normCode,
    buildIndex: buildIndex,
    findOrders: findOrders,
    round2: round2,
    formatDate: formatDate,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IadeParser = api;
})(this);
