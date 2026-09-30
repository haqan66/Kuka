/* İade kayıtlarını Excel (ExcelJS) ve fotoğraf ZIP'i (JSZip) olarak dışa aktarır */
(function (root) {
  'use strict';

  var STATUS_LABEL = { satilabilir: 'Yeniden Satılabilir', imha: 'İmha', '': 'Seçilmedi', gelmedi: 'Gelmedi' };
  var STATUS_FILL = { satilabilir: 'FFD9F2E0', imha: 'FFF9D6D5', '': 'FFFFF2CC', gelmedi: 'FFE7E7E7' };

  function round2(n) { return Math.round(n * 100) / 100; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function safe(s) {
    return String(s || '').replace(/[^0-9A-Za-zÇĞİÖŞÜçğıöşü_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'x';
  }

  // Fotoğraf id → ZIP içindeki dosya adı
  function photoNames(rec) {
    var map = {};
    var base = safe(rec.order.siparisNo || rec.order.kargoKodu);
    (rec.genelFotolar || []).forEach(function (pid, i) {
      map[pid] = 'fotograflar/' + base + '/' + base + '_genel_' + (i + 1) + '.jpg';
    });
    rec.lines.forEach(function (line) {
      var n = 0;
      line.entries.forEach(function (e) {
        (e.photos || []).forEach(function (pid) {
          n++;
          map[pid] = 'fotograflar/' + base + '/' + base + '_urun' + (line.itemIdx + 1) + '_' + n + '.jpg';
        });
      });
    });
    return map;
  }

  // Bir iade kaydını rapor satırlarına çevirir (ön izleme ve Excel ortak kullanır)
  function rowsForRecord(rec) {
    var o = rec.order;
    var rows = [];
    o.items.forEach(function (it) {
      var line = rec.lines.find(function (l) { return l.itemIdx === it.idx; }) || { entries: [] };
      var entries = line.entries.filter(function (e) { return e.qty > 0; });
      var got = entries.reduce(function (s, e) { return s + e.qty; }, 0);
      var common = {
        rec: rec, item: it,
        urun: it.ad, platformAd: it.platformAd, barkod: it.barkod, stokKodu: it.stokKodu,
        siparisAdet: it.adet, birim: it.birimFiyat, kdv: it.kdv, birimKdvDahil: it.birimKdvDahil,
      };
      entries.forEach(function (e) {
        rows.push(Object.assign({}, common, {
          entry: e, iadeAdet: e.qty, durum: e.status || '', photos: e.photos || [],
          tutar: it.birimKdvDahil != null ? round2(it.birimKdvDahil * e.qty) : null,
          tutarHaric: it.birimFiyat != null ? round2(it.birimFiyat * e.qty) : null,
          eksik: 0,
        }));
      });
      if (got < it.adet) {
        rows.push(Object.assign({}, common, {
          entry: null, iadeAdet: 0, durum: 'gelmedi', photos: [], tutar: null, tutarHaric: null, eksik: it.adet - got,
        }));
      }
    });
    return rows;
  }

  var COLUMNS = [
    { header: 'İade Tarihi', key: 'iadeTarihi', width: 17 },
    { header: 'Personel', key: 'personel', width: 14 },
    { header: 'Sipariş No', key: 'siparisNo', width: 16 },
    { header: 'İsim Soyisim', key: 'musteri', width: 22 },
    { header: 'Kargo Takip No', key: 'kargoKodu', width: 20 },
    { header: 'Kargo Firması', key: 'kargoFirma', width: 18 },
    { header: 'Kanal / Mağaza', key: 'kanal', width: 20 },
    { header: 'Fatura No', key: 'faturaNo', width: 19 },
    { header: 'Fatura Tarihi', key: 'faturaTarihi', width: 12 },
    { header: 'Ürün', key: 'urun', width: 42 },
    { header: 'Barkod', key: 'barkod', width: 16 },
    { header: 'Sipariş Adedi', key: 'siparisAdet', width: 9 },
    { header: 'İade Adedi', key: 'iadeAdet', width: 9 },
    { header: 'Gelmeyen Adet', key: 'eksik', width: 10 },
    { header: 'Durum', key: 'durum', width: 19 },
    { header: 'Birim Fatura Fiyatı (KDV Hariç)', key: 'birim', width: 14 },
    { header: 'KDV %', key: 'kdv', width: 7 },
    { header: 'Birim Fatura Fiyatı (KDV Dahil)', key: 'birimKdvDahil', width: 14 },
    { header: 'Toplam Fatura Tutarı (KDV Dahil)', key: 'tutar', width: 15 },
    { header: 'Fotoğraf Dosyaları', key: 'fotoDosya', width: 34 },
    { header: 'Fotoğraf', key: 'foto', width: 46 },
    { header: 'Not', key: 'not', width: 24 },
  ];

  function buildExcel(records, opts) {
    opts = opts || {};
    var wb = new root.ExcelJS.Workbook();
    wb.creator = 'İade Kabul Programı';
    wb.created = new Date();
    var ws = wb.addWorksheet('İadeler', { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = COLUMNS;
    var head = ws.getRow(1);
    head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    head.alignment = { vertical: 'middle', wrapText: true };
    head.height = 32;
    head.eachCell(function (c) { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } }; });

    var fotoCol = COLUMNS.findIndex(function (c) { return c.key === 'foto'; });
    var jobs = [];
    var totals = { satilabilir: { adet: 0, tutar: 0 }, imha: { adet: 0, tutar: 0 }, '': { adet: 0, tutar: 0 }, gelmedi: { adet: 0, tutar: 0 } };

    records.forEach(function (rec) {
      var o = rec.order;
      var names = photoNames(rec);
      rowsForRecord(rec).forEach(function (r) {
        var row = ws.addRow({
          iadeTarihi: fmtDate(rec.tamamlanma),
          personel: rec.personel || '',
          siparisNo: o.siparisNo,
          musteri: o.musteri,
          kargoKodu: o.kargoKodu,
          kargoFirma: o.kargoFirma,
          kanal: [o.kanal, o.magaza].filter(Boolean).join(' / '),
          faturaNo: o.faturaNo,
          faturaTarihi: (o.faturaTarihi || '').slice(0, 10),
          urun: r.urun,
          barkod: r.barkod,
          siparisAdet: r.siparisAdet,
          iadeAdet: r.iadeAdet,
          eksik: r.eksik || null,
          durum: STATUS_LABEL[r.durum] || r.durum,
          birim: r.birim,
          kdv: r.kdv,
          birimKdvDahil: r.birimKdvDahil,
          tutar: r.tutar,
          fotoDosya: r.photos.map(function (p) { return names[p]; }).join('\n'),
          not: rec.not || '',
        });
        var t = totals[r.durum] || totals[''];
        t.adet += r.durum === 'gelmedi' ? r.eksik : r.iadeAdet;
        t.tutar += r.tutar || 0;
        row.alignment = { vertical: 'middle', wrapText: true };
        row.getCell('durum').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_FILL[r.durum] || STATUS_FILL[''] } };
        row.getCell('durum').font = { bold: true };
        ['birim', 'birimKdvDahil', 'tutar'].forEach(function (k) { row.getCell(k).numFmt = '#,##0.00 "₺"'; });
        ['siparisNo', 'kargoKodu', 'barkod', 'faturaNo'].forEach(function (k) { row.getCell(k).numFmt = '@'; });
        if (opts.embedPhotos && r.photos.length) {
          row.height = 62;
          jobs.push({ rowNum: row.number, photos: r.photos.slice(0, 3) });
        }
      });
    });

    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

    var sum = wb.addWorksheet('Özet');
    sum.columns = [{ header: 'Durum', key: 'd', width: 24 }, { header: 'Adet', key: 'a', width: 10 }, { header: 'Tutar (KDV Dahil)', key: 't', width: 18 }];
    sum.getRow(1).font = { bold: true };
    ['satilabilir', 'imha', '', 'gelmedi'].forEach(function (k) {
      if (k === '' && !totals[''].adet) return;
      var r = sum.addRow({ d: STATUS_LABEL[k], a: totals[k].adet, t: k === 'gelmedi' ? null : round2(totals[k].tutar) });
      r.getCell('t').numFmt = '#,##0.00 "₺"';
      r.getCell('d').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_FILL[k] } };
    });
    sum.addRow({});
    sum.addRow({ d: 'İade kaydı (paket) sayısı', a: records.length });
    sum.addRow({ d: 'Rapor tarihi', a: fmtDate(new Date().toISOString()) });

    // Fotoğraf küçük resimlerini göm
    var chain = Promise.resolve();
    jobs.forEach(function (job) {
      job.photos.forEach(function (pid, k) {
        chain = chain.then(function () { return opts.getPhoto(pid); }).then(function (p) {
          if (!p || !p.blob) return null;
          return root.IadeCamera.thumbnail(p.blob, 240).then(function (th) {
            var imgId = wb.addImage({ base64: th.base64, extension: 'jpeg' });
            var h = 78, w = Math.round(h * th.width / th.height);
            ws.addImage(imgId, { tl: { col: fotoCol + k * 0.33, row: job.rowNum - 1 + 0.03 }, ext: { width: Math.min(w, 110), height: h } });
          });
        }).catch(function () { /* fotoğraf okunamazsa atla */ });
      });
    });

    return chain.then(function () { return wb.xlsx.writeBuffer(); }).then(function (buf) {
      return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    });
  }

  function buildZip(records, getPhoto, excelBlob, excelName) {
    var zip = new root.JSZip();
    var chain = Promise.resolve();
    records.forEach(function (rec) {
      var names = photoNames(rec);
      Object.keys(names).forEach(function (pid) {
        chain = chain.then(function () { return getPhoto(pid); }).then(function (p) {
          if (p && p.blob) zip.file(names[pid], p.blob);
        });
      });
    });
    if (excelBlob) zip.file(excelName, excelBlob);
    return chain.then(function () { return zip.generateAsync({ type: 'blob' }); });
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  root.IadeExport = {
    STATUS_LABEL: STATUS_LABEL,
    rowsForRecord: rowsForRecord,
    photoNames: photoNames,
    buildExcel: buildExcel,
    buildZip: buildZip,
    download: download,
    fmtDate: fmtDate,
  };
})(this);
