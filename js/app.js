/* İade Kabul – ana uygulama */
(function () {
  'use strict';
  var P = window.IadeParser, DB = window.IadeDB, CAM = window.IadeCamera, EX = window.IadeExport;

  var S = {
    orders: [],
    index: new Map(),
    meta: null,
    returns: [],
    draft: null,
    defaultStatus: '',
    lastEntry: null,
    learned: {},
    unknownCode: null,
    results: [],
    photoMode: 'paket', // paket | urun | kapali
    photoDelay: 2,
    voice: true,
  };
  var pendingShots = [];
  var queue = Promise.resolve();
  var urlCache = new Map();
  var pendingEntryPhoto = null;

  // ---------- yardımcılar ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function nowISO() { return new Date().toISOString(); }
  function tl(n) {
    if (n == null || isNaN(n)) return '—';
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }
  function lsGet(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* yoksay */ } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function dash(s) { return s ? esc(s) : '<span class="muted">—</span>'; }

  var audioCtx = null;
  function beep(type) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var seq = type === 'ok' ? [[1046, 0.09]] : type === 'warn' ? [[660, 0.12], [520, 0.12]] : [[220, 0.18], [180, 0.25]];
      var t = audioCtx.currentTime;
      seq.forEach(function (s) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type === 'ok' ? 'sine' : 'square';
        o.frequency.value = s[0];
        g.gain.value = 0.08;
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t); o.stop(t + s[1]); t += s[1] + 0.03;
      });
    } catch (e) { /* ses yok */ }
  }

  // Sesli uyarı (tarayıcının Türkçe sesi varsa onu kullanır)
  function say(text) {
    if (!S.voice || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR';
      var v = window.speechSynthesis.getVoices().find(function (x) { return /^tr/i.test(x.lang); });
      if (v) u.voice = v;
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ses yok */ }
  }

  var msgTimer = null;
  function setMsg(text, type) {
    var m = $('msg');
    m.textContent = text || '';
    m.className = 'msg ' + (type || '');
    clearTimeout(msgTimer);
    if (type === 'ok') msgTimer = setTimeout(function () { if (m.textContent === text) m.textContent = ''; }, 6000);
  }

  function focusScan() {
    if (!$('dialog').hidden) return;
    if (!$('tab-iade').classList.contains('active')) return;
    $('scanInput').focus();
  }

  // ---------- diyalog ----------
  var dialogResolve = null;
  var dialogOpenedAt = 0;
  function dialog(opts) {
    return new Promise(function (resolve) {
      if (dialogResolve) dialogResolve(null);
      dialogResolve = resolve;
      $('dialogTitle').textContent = opts.title || '';
      $('dialogBody').innerHTML = opts.html || '';
      var foot = $('dialogFoot');
      foot.innerHTML = '';
      (opts.buttons || [{ label: 'Tamam', value: true, primary: true }]).forEach(function (b) {
        var el = document.createElement('button');
        el.className = 'btn ' + (b.primary ? 'primary' : '') + ' ' + (b.cls || '');
        el.textContent = b.label;
        if (b.primary) el.dataset.primary = '1';
        if (b.id) el.id = b.id;
        el.addEventListener('click', function () { closeDialog(b.value); });
        foot.appendChild(el);
      });
      $('dialog').querySelector('.dialog').classList.toggle('narrow', !!opts.narrow);
      $('dialog').hidden = false;
      dialogOpenedAt = Date.now();
      hydrateThumbs($('dialogBody'));
      if (opts.onOpen) opts.onOpen($('dialogBody'));
      // Odağı butona değil pencereye ver: okuyucudan gelen Enter bir butona basmasın
      $('dialog').querySelector('.dialog').focus();
    });
  }
  function closeDialog(value) {
    $('dialog').hidden = true;
    var r = dialogResolve;
    dialogResolve = null;
    if (r) r(value);
    setTimeout(focusScan, 0);
  }

  // ---------- fotoğraf ----------
  function photoURL(pid) {
    if (urlCache.has(pid)) return Promise.resolve(urlCache.get(pid));
    return DB.getPhoto(pid).then(function (p) {
      if (!p || !p.blob) return null;
      var u = URL.createObjectURL(p.blob);
      urlCache.set(pid, u);
      return u;
    });
  }
  function thumbHTML(pid, ctx) {
    return '<img class="thumb" alt="Fotoğraf" data-pid="' + esc(pid) + '"' + (ctx ? ' data-ctx="' + esc(ctx) + '"' : '') + '>';
  }
  function hydrateThumbs(root) {
    root.querySelectorAll('img[data-pid]').forEach(function (img) {
      if (img.src) return;
      photoURL(img.dataset.pid).then(function (u) { if (u) img.src = u; });
    });
  }
  function flash() {
    var f = $('flash');
    f.classList.add('on');
    setTimeout(function () { f.classList.remove('on'); }, 60);
  }
  function overlayLines(extra) {
    var d = S.draft;
    var who = ($('personel').value || '').trim();
    var lines = [new Date().toLocaleString('tr-TR') + (who ? ' · ' + who : '')];
    if (d) lines.push('Sipariş: ' + d.order.siparisNo + ' · Kargo: ' + d.order.kargoKodu + ' · ' + d.order.musteri);
    if (extra) lines.push(extra);
    return lines;
  }
  function storePhoto(blob) {
    if (!blob) return Promise.resolve(null);
    var id = 'f_' + uid();
    return DB.putPhoto({ id: id, blob: blob, at: nowISO(), orderUid: S.draft ? S.draft.order.uid : '' }).then(function () {
      urlCache.set(id, URL.createObjectURL(blob));
      return id;
    });
  }
  var countdownTimer = null;
  function showCountdown(sec) {
    var el = $('countdown');
    clearInterval(countdownTimer);
    if (!sec) { el.hidden = true; return; }
    var n = sec;
    el.textContent = n;
    el.hidden = false;
    countdownTimer = setInterval(function () {
      n--;
      if (n <= 0) { clearInterval(countdownTimer); el.hidden = true; } else el.textContent = n;
    }, 1000);
  }

  // Ayarlı gecikmeden sonra çek. null: kamera yok, undefined: bu sırada başka siparişe geçildi.
  function scheduleCapture(extra) {
    if (!CAM.isReady()) return Promise.resolve(null);
    var draftRef = S.draft;
    showCountdown(S.photoDelay);
    var p = new Promise(function (r) { setTimeout(r, S.photoDelay * 1000); }).then(function () {
      if (S.draft !== draftRef) return undefined;
      return captureFromCamera(extra);
    });
    pendingShots.push(p);
    p.then(function () { pendingShots = pendingShots.filter(function (x) { return x !== p; }); });
    return p;
  }

  function captureFromCamera(extra) {
    if (!CAM.isReady()) return Promise.resolve(null);
    return CAM.capture(overlayLines(extra)).then(function (blob) {
      flash();
      return storePhoto(blob);
    });
  }

  // ---------- sipariş listesi ----------
  function setOrders(orders) {
    S.orders = orders;
    S.index = P.buildIndex(orders);
    updateDataStatus();
  }
  function updateDataStatus() {
    var t = S.orders.length ? S.orders.length + ' sipariş yüklü' : 'Sipariş listesi yüklenmedi';
    if (S.meta && S.meta.updatedAt) t += ' · ' + EX.fmtDate(S.meta.updatedAt);
    $('veriDurum').textContent = t;
  }

  function loadExcel(file) {
    setMsg('Excel okunuyor: ' + file.name + ' …', 'warn');
    return file.arrayBuffer().then(function (buf) {
      return P.readWorkbook(buf, window.JSZip, window.XLSX);
    }).then(function (orders) {
      if (!orders.length) throw new Error('Dosyada sipariş bulunamadı.');
      if (!S.orders.length) return { orders: orders, mode: 'replace' };
      return dialog({
        title: 'Sipariş listesi',
        narrow: true,
        html: '<p><b>' + orders.length + '</b> sipariş okundu. Mevcut listede <b>' + S.orders.length + '</b> sipariş var.</p>' +
          '<p>Yeni dosyayı mevcut listeye eklemek (aynı siparişler güncellenir) mi, yoksa listeyi tamamen değiştirmek mi istersiniz?</p>',
        buttons: [
          { label: 'Vazgeç', value: null },
          { label: 'Listeyi değiştir', value: 'replace' },
          { label: 'Mevcut listeye ekle', value: 'merge', primary: true },
        ],
      }).then(function (mode) { return { orders: orders, mode: mode }; });
    }).then(function (r) {
      if (!r.mode) { setMsg('Yükleme iptal edildi', 'warn'); return; }
      var list = r.orders;
      if (r.mode === 'merge') {
        var map = new Map(S.orders.map(function (o) { return [o.uid, o]; }));
        r.orders.forEach(function (o) { map.set(o.uid, o); });
        list = Array.from(map.values());
      }
      S.meta = { updatedAt: nowISO(), file: file.name };
      setOrders(list);
      renderOrders();
      return Promise.all([DB.set('orders', list), DB.set('meta', S.meta)]).then(function () {
        setMsg('✓ ' + file.name + ' yüklendi: ' + r.orders.length + ' sipariş (toplam ' + list.length + ')', 'ok');
        beep('ok');
      });
    }).catch(function (err) {
      console.error(err);
      setMsg('Excel okunamadı: ' + err.message, 'err');
      beep('err');
    });
  }

  // ---------- okutma ----------
  function sig(item) { return item.stokKodu || P.normCode(item.ad); }
  function itemMatches(item, code) {
    var c = P.normCode(code);
    if (!c) return false;
    if (item.barkodlar.some(function (b) { return P.normCode(b) === c; })) return true;
    return S.learned[c] === sig(item);
  }
  function lineOf(idx) { return S.draft.lines.find(function (l) { return l.itemIdx === idx; }); }
  function received(line) { return line.entries.reduce(function (s, e) { return s + (e.qty || 0); }, 0); }

  function handleScan(raw) {
    var v = String(raw || '').trim();
    if (!v) return Promise.resolve();
    S.results = [];
    renderResults();
    if (!S.orders.length && !S.draft) {
      setMsg('Önce sağ üstten sipariş Excel\'ini yükleyin.', 'err');
      beep('err');
      return Promise.resolve();
    }
    if (S.draft) {
      var items = S.draft.order.items.filter(function (it) { return itemMatches(it, v); });
      if (items.length) {
        var it = items.find(function (x) { return received(lineOf(x.idx)) < x.adet; }) || items[0];
        S.unknownCode = null;
        renderUnknown();
        return addEntry(it.idx, 1, 'okutma');
      }
      var found = P.findOrders(S.orders, S.index, v);
      if (found.length) {
        if (found.some(function (o) { return o.uid === S.draft.order.uid; })) {
          setMsg('Bu sipariş zaten açık. Ürün barkodlarını okutun.', 'warn');
          beep('warn');
          return Promise.resolve();
        }
        if (found.length === 1) return openOrder(found[0]);
        S.results = found;
        renderResults();
        return Promise.resolve();
      }
      S.unknownCode = v;
      renderUnknown();
      setMsg('Barkod bu siparişte bulunamadı: ' + v, 'err');
      beep('err');
      say('Bu ürün siparişte yok');
      return Promise.resolve();
    }
    var res = P.findOrders(S.orders, S.index, v);
    if (!res.length) {
      setMsg('Sipariş bulunamadı: ' + v + ' (kargo kodu, sipariş no veya müşteri adı ile deneyin)', 'err');
      beep('err');
      say('Sipariş bulunamadı');
      return Promise.resolve();
    }
    if (res.length === 1) return openOrder(res[0]);
    S.results = res;
    renderResults();
    setMsg(res.length + ' sipariş bulundu, seçin:', 'warn');
    return Promise.resolve();
  }

  function renderResults() {
    var box = $('searchResults');
    if (!S.results.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="results">' + S.results.slice(0, 30).map(function (o, i) {
      return '<button data-i="' + i + '"><b>' + esc(o.siparisNo) + '</b> · ' + esc(o.musteri) + ' · Kargo: ' + esc(o.kargoKodu) +
        ' · ' + esc(o.tarih.slice(0, 10)) + ' · ' + o.items.length + ' ürün</button>';
    }).join('') + '</div>';
  }

  function draftHasWork(d) {
    // Yalnızca paket fotoğrafı olan taslak "iş" sayılmaz; yanlış poşet okutulursa sormadan geçilir
    return !!d && d.lines.some(function (l) { return l.entries.length > 0; });
  }

  function newDraft(order) {
    return {
      order: clone(order),
      lines: order.items.map(function (it) { return { itemIdx: it.idx, entries: [] }; }),
      genelFotolar: [],
      removedPhotos: [],
      baslangic: nowISO(),
      editingId: null,
      not: '',
    };
  }

  function openOrder(order) {
    if (S.draft && S.draft.order.uid === order.uid) {
      showTab('iade');
      setMsg('Bu sipariş zaten açık: ' + order.siparisNo, 'warn');
      return Promise.resolve();
    }
    var p = Promise.resolve(true);
    if (S.draft && draftHasWork(S.draft) && S.draft.order.uid !== order.uid) {
      beep('warn');
      p = dialog({
        title: 'Açık iade onaylanmadı',
        narrow: true,
        html: '<p><b>' + esc(S.draft.order.siparisNo) + '</b> (' + esc(S.draft.order.musteri) + ') siparişinin iadesi henüz onaylanmadı.</p>' +
          '<p>Yeni siparişe (<b>' + esc(order.siparisNo) + '</b>) geçerseniz açık iadedeki okutmalar ve fotoğraflar silinir.</p>',
        buttons: [
          { label: 'Açık iadeye dön', value: false, primary: true },
          { label: 'Sil ve yeni siparişe geç', value: true, cls: 'danger' },
        ],
      });
    }
    return p.then(function (ok) {
      if (!ok) return;
      return discardDraft().then(function () {
        var prev = S.returns.filter(function (r) { return r.order.uid === order.uid; });
        S.draft = newDraft(order);
        S.draft.oncekiIadeler = prev.map(function (r) { return { id: r.id, tamamlanma: r.tamamlanma, personel: r.personel || '' }; });
        S.lastEntry = null;
        S.unknownCode = null;
        S.results = [];
        renderResults();
        saveDraft();
        renderDraft();
        if (prev.length) {
          beep('err');
          say('Dikkat. Bu sipariş daha önce iade alındı');
          setMsg('⚠ Bu sipariş daha önce iade alındı (' + EX.fmtDate(prev[prev.length - 1].tamamlanma) + '). Yeni iade olarak devam ediliyor; önceki kayıt İade Kayıtları\'ndan düzenlenebilir.', 'err');
        } else {
          beep('ok');
          say('Sipariş bulundu. ' + order.items.length + ' ürün');
          setMsg('✓ Sipariş bulundu: ' + order.siparisNo + ' – ' + order.musteri + '. Şimdi ürün barkodlarını okutun.', 'ok');
        }
        if (S.photoMode === 'paket') takePackagePhoto(true);
      });
    });
  }

  // Paket fotoğrafı: ayarlı gecikmeyle genel fotoğraflara eklenir
  function takePackagePhoto(auto) {
    var d = S.draft;
    if (!d) return Promise.resolve();
    return scheduleCapture('Paket fotoğrafı').then(function (pid) {
      if (pid && S.draft === d) {
        d.genelFotolar.push(pid);
        saveDraft();
        renderGenelFotolar();
        renderDraft();
      } else if (pid === null) {
        setMsg('Canlı kamera yok: paket fotoğrafını seçin veya çekin.', 'warn');
        $('genelFotoFile').click();
      }
    });
  }

  function addEntry(itemIdx, qty, via) {
    var d = S.draft;
    var it = d.order.items[itemIdx];
    var line = lineOf(itemIdx);
    var got = received(line);
    var status = S.defaultStatus;
    var e = line.entries.find(function (x) { return x.status === status; });
    if (!e) {
      e = { id: uid(), qty: 0, status: status, photos: [], at: nowISO(), via: via };
      line.entries.push(e);
    }
    e.qty += qty;
    e.at = nowISO();
    S.lastEntry = { itemIdx: itemIdx, entryId: e.id };
    saveDraft();
    renderDraft(itemIdx);

    var total = got + qty;
    if (total > it.adet) {
      beep('err');
      say('Sipariş adedi aşıldı');
      setMsg('⚠ ' + it.ad + ': siparişte ' + it.adet + ' adet var, iade ' + total + ' oldu. Fazlaysa kalemin adedini düşürün.', 'err');
    } else {
      beep('ok');
      var allDone = d.order.items.every(function (x) { return received(lineOf(x.idx)) >= x.adet; });
      say(allDone ? 'Tamam. Tüm ürünler geldi' : 'Tamam');
      setMsg('✓ ' + it.ad + ' – ' + qty + ' adet onaylandı (' + total + '/' + it.adet + ')', 'ok');
    }

    if (S.photoMode === 'urun') {
      scheduleCapture('Ürün: ' + it.ad + ' · ' + qty + ' adet').then(function (pid) {
        if (pid && S.draft === d) {
          e.photos.push(pid);
          saveDraft();
          renderDraft();
        } else if (pid === null && S.draft === d) {
          // Canlı kamera yok: telefonda kamera uygulamasını, bilgisayarda dosya seçimini aç
          setMsg('Canlı kamera yok, ürün fotoğrafını seçin veya çekin.', 'warn');
          pendingEntryPhoto = { itemIdx: itemIdx, entryId: e.id };
          $('entryFotoFile').click();
        }
      });
    }
    return Promise.resolve();
  }

  function findEntry(itemIdx, entryId) {
    var line = lineOf(itemIdx);
    return line && line.entries.find(function (e) { return e.id === entryId; });
  }

  function setEntryStatus(itemIdx, entryId, status) {
    var e = findEntry(itemIdx, entryId);
    if (!e) return;
    e.status = e.status === status ? '' : status;
    saveDraft();
    renderDraft();
  }

  function saveDraft() {
    if (S.draft) DB.set('draft', S.draft);
    else DB.del('draft');
  }

  function draftPhotoIds(d) {
    var ids = d.genelFotolar.slice();
    d.lines.forEach(function (l) { l.entries.forEach(function (e) { ids = ids.concat(e.photos || []); }); });
    return ids;
  }
  function recordPhotoIds(r) { return draftPhotoIds(r); }

  function deletePhotos(ids) {
    return Promise.all(ids.map(function (id) {
      var u = urlCache.get(id);
      if (u) { URL.revokeObjectURL(u); urlCache.delete(id); }
      return DB.delPhoto(id);
    }));
  }

  // Açık iadeyi kaydetmeden kapat; kayıtlı olmayan fotoğrafları temizle.
  function discardDraft() {
    var d = S.draft;
    if (!d) return Promise.resolve();
    var keep = new Set();
    if (d.editingId) {
      var orig = S.returns.find(function (r) { return r.id === d.editingId; });
      if (orig) recordPhotoIds(orig).forEach(function (id) { keep.add(id); });
    }
    var drop = draftPhotoIds(d).concat(d.removedPhotos || []).filter(function (id) { return !keep.has(id); });
    S.draft = null;
    S.lastEntry = null;
    S.unknownCode = null;
    saveDraft();
    renderDraft();
    return deletePhotos(drop);
  }

  // ---------- çizim: açık iade ----------
  function statusPill(durum) {
    var t = String(durum || '');
    var cls = /TESL/.test(t) ? 'teslim' : /İPTAL|IPTAL|İADE/.test(t) ? 'iptal' : '';
    return '<span class="pill ' + cls + '">' + esc(t || '—') + '</span>';
  }

  function renderDraft(highlightIdx) {
    var d = S.draft;
    $('orderPanel').hidden = !d;
    $('emptyState').hidden = !!d;
    $('genelFoto').disabled = !d;
    $('scanLabel').textContent = d ? '2) Ürün barkodunu okutun (yeni poşet için kargo barkodu okutabilirsiniz)' : '1) Kargo poşetindeki barkodu okutun';
    renderGenelFotolar();
    if (!d) { $('items').innerHTML = ''; $('orderCard').innerHTML = ''; renderUnknown(); return; }
    var o = d.order;
    var durumTarihLabel = /TESL/.test(o.durum) ? 'Teslim Tarihi' : /İPTAL/.test(o.durum) ? 'İptal / İade Tarihi' : 'Durum Tarihi';
    function f(label, val, cls) { return '<div class="f ' + (cls || '') + '"><small>' + label + '</small><span>' + dash(val) + '</span></div>'; }
    var html = '';
    if (d.editingId) html += '<div class="alert">Kayıtlı bir iade düzenleniyor. Değişiklikler "Ön İzleme ve Onay" ile kaydedilir.</div>';
    var once = (d.oncekiIadeler || []).filter(function (r) { return r.id !== d.editingId && S.returns.some(function (x) { return x.id === r.id; }); });
    if (once.length) {
      var last = once[once.length - 1];
      html += '<div class="alert err"><span>⚠ Bu sipariş daha önce iade alındı: ' + esc(EX.fmtDate(last.tamamlanma)) +
        (last.personel ? ' · ' + esc(last.personel) : '') + '</span>' +
        '<button class="btn small" data-edit-prev="' + esc(last.id) + '">Önceki kaydı düzenle</button></div>';
    }
    html += f('Sipariş No', o.siparisNo, 'big') + f('İsim Soyisim', o.musteri, 'big') + f('Kargo Takip No (Kampanya Kodu)', o.kargoKodu, 'big') +
      f('Fatura No', o.faturaNo || 'Faturası kesilmemiş / yok') + f('Fatura Tarihi', (o.faturaTarihi || '').slice(0, 10)) +
      f('Kargo Firması', o.kargoFirma) + f('Kanal / Mağaza', [o.kanal, o.magaza].filter(Boolean).join(' / ')) +
      f('Sipariş Tarihi', o.tarih) + f('Kargoya Verilme (etiket yazdırma)', o.kargoYazdirma) +
      f('Kargoya Son Teslim Tarihi', o.kargoSonTeslim) +
      '<div class="f"><small>Sipariş Durumu</small><span>' + statusPill(o.durum) + '</span></div>' +
      f(durumTarihLabel, o.durumTarihi) +
      f('Adres', [o.adres, o.sehir].filter(Boolean).join(' – '), 'wide');
    $('orderCard').innerHTML = html;

    $('items').innerHTML = o.items.map(function (it) {
      var line = lineOf(it.idx);
      var got = received(line);
      var cls = got === 0 ? '' : got < it.adet ? 'partial' : got === it.adet ? 'done' : 'over';
      var price = it.birimFiyat != null
        ? tl(it.birimFiyat) + (it.kdv != null ? ' + %' + it.kdv + ' KDV = <b>' + tl(it.birimKdvDahil) + '</b>' : ' (KDV hariç)')
        : '—';
      var sub = [];
      if (it.platformAd && it.platformAd !== it.ad) sub.push(esc(it.platformAd));
      sub.push('Barkod: <b>' + esc(it.barkod || '—') + '</b>' + (it.stokKodu ? ' · Stok: ' + esc(it.stokKodu) : ''));
      var remaining = Math.max(it.adet - got, 1);
      var entries = line.entries.map(function (e) {
        return '<div class="entry ' + (e.status ? '' : 'nostatus') + '" data-item="' + it.idx + '" data-entry="' + e.id + '">' +
          '<label>Adet <input class="qty" type="number" min="1" value="' + e.qty + '" data-act="qty"></label>' +
          '<div class="seg">' +
          '<button class="ok ' + (e.status === 'satilabilir' ? 'on' : '') + '" data-act="st" data-v="satilabilir">Yeniden Satılabilir</button>' +
          '<button class="bad ' + (e.status === 'imha' ? 'on' : '') + '" data-act="st" data-v="imha">İmha</button>' +
          '</div>' +
          (e.status ? '' : '<span class="nophoto">Durum seçin!</span>') +
          '<div class="thumbs">' + (e.photos || []).map(function (pid) { return thumbHTML(pid, 'entry'); }).join('') + '</div>' +
          ((e.photos || []).length || d.genelFotolar.length ? '' : '<span class="nophoto">Fotoğraf yok</span>') +
          '<span class="grow"></span>' +
          '<span class="time">' + new Date(e.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
          '<button class="btn small" data-act="photo" title="Bu kaleme fotoğraf ekle">📷 Foto</button>' +
          (e.qty > 1 ? '<button class="btn small" data-act="split" title="1 adedi ayrı kalem yap (farklı durum için)">1 adet ayır</button>' : '') +
          '<button class="btn small danger ghost" data-act="del" title="Kalemi sil">Sil</button>' +
          '</div>';
      }).join('');
      return '<div class="item ' + cls + (highlightIdx === it.idx ? ' hl' : '') + '" id="item-' + it.idx + '">' +
        '<div class="item-top"><div class="item-no">#' + (it.idx + 1) + '</div>' +
        '<div class="item-info"><div class="item-name">' + esc(it.ad) + '</div>' +
        '<div class="item-sub">' + sub.join('<br>') + '</div>' +
        '<div class="item-sub">Fatura birim fiyatı: ' + price + '</div></div>' +
        '<div class="item-count"><span class="n">' + got + '</span> / ' + it.adet + '<small>iade / sipariş</small>' + (got > it.adet ? '<span class="over-txt">Fazla: ' + (got - it.adet) + ' adet</span>' : '') + '</div></div>' +
        '<div class="item-ctrl" data-item="' + it.idx + '">' +
        '<label>Gelen adet <input type="number" min="1" value="' + remaining + '" data-act="mqty"></label>' +
        '<button class="btn primary" data-act="confirm">✓ Onayla' + (S.photoMode === 'urun' ? ' + Fotoğraf' : '') + '</button>' +
        '</div>' +
        (entries ? '<div class="entries">' + entries + '</div>' : '') +
        '</div>';
    }).join('');
    hydrateThumbs($('items'));
    renderUnknown();
    if (highlightIdx != null) {
      var el = $('item-' + highlightIdx);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        setTimeout(function () { el.classList.remove('hl'); }, 1500);
      }
    }
  }

  function renderGenelFotolar() {
    var d = S.draft;
    $('genelFotolar').innerHTML = d ? d.genelFotolar.map(function (pid) { return thumbHTML(pid, 'genel'); }).join('') : '';
    hydrateThumbs($('genelFotolar'));
  }

  function renderUnknown() {
    var box = $('unknownBox');
    if (!S.draft || !S.unknownCode) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="unknown"><b>Okutulan barkod bu siparişte yok: ' + esc(S.unknownCode) + '</b>' +
      '<div class="muted">Ürün doğruysa hangi kaleme ait olduğunu seçin; barkod hatırlanır ve sonraki okutmalarda otomatik eşleşir.</div>' +
      '<div class="row">' + S.draft.order.items.map(function (it) {
        return '<button class="btn small" data-learn="' + it.idx + '">#' + (it.idx + 1) + ' ' + esc(it.ad.slice(0, 50)) + '</button>';
      }).join('') + '<button class="btn small ghost" data-learn="x">Kapat</button></div></div>';
  }

  // ---------- ön izleme ve onay ----------
  function draftAsRecord() {
    var d = S.draft;
    return {
      id: d.editingId || 'r_' + uid(),
      order: d.order,
      lines: d.lines,
      genelFotolar: d.genelFotolar,
      personel: ($('personel').value || '').trim(),
      not: d.not || '',
      baslangic: d.baslangic,
      tamamlanma: nowISO(),
    };
  }

  function previewHTML(rec, readonly) {
    var o = rec.order;
    var rows = EX.rowsForRecord(rec);
    var errors = [], warns = [];
    var totalQty = rows.reduce(function (s, r) { return s + r.iadeAdet; }, 0);
    if (!totalQty) errors.push('Hiç ürün onaylanmadı.');
    rows.forEach(function (r) {
      if (r.entry && !r.durum) errors.push('Durum seçilmedi: ' + r.urun + ' (' + r.iadeAdet + ' adet)');
      if (r.entry && !r.photos.length && !(rec.genelFotolar || []).length) warns.push('Fotoğraf yok: ' + r.urun);
      if (r.durum === 'gelmedi') warns.push('Eksik geldi: ' + r.urun + ' – ' + r.eksik + ' adet gelmedi');
    });
    o.items.forEach(function (it) {
      var line = rec.lines.find(function (l) { return l.itemIdx === it.idx; });
      var got = line ? received(line) : 0;
      if (got > it.adet) warns.push('Sipariş adedinden fazla: ' + it.ad + ' (' + got + '/' + it.adet + ')');
    });
    var sum = { satilabilir: 0, imha: 0, tutar: 0 };
    rows.forEach(function (r) {
      if (r.durum === 'satilabilir' || r.durum === 'imha') sum[r.durum] += r.iadeAdet;
      sum.tutar += r.tutar || 0;
    });
    var html = '';
    if (!readonly && errors.length) html += '<ul class="warnlist err">' + errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
    if (warns.length) html += '<ul class="warnlist warn">' + warns.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
    function i(label, v) { return '<div><small>' + label + '</small><b>' + dash(v) + '</b></div>'; }
    html += '<div class="pv-info">' + i('Sipariş No', o.siparisNo) + i('İsim Soyisim', o.musteri) + i('Kargo Takip No', o.kargoKodu) +
      i('Fatura No', o.faturaNo) + i('Kargo Firması', o.kargoFirma) + i('Kanal / Mağaza', [o.kanal, o.magaza].filter(Boolean).join(' / ')) +
      i('İade Tarihi', EX.fmtDate(rec.tamamlanma)) + i('Personel', rec.personel) + '</div>';
    html += '<div class="table-wrap"><table class="grid"><thead><tr><th>Ürün</th><th>Barkod</th><th class="num">Sipariş</th><th class="num">İade</th>' +
      '<th>Durum</th><th class="num">Birim (KDV dahil)</th><th class="num">Tutar</th><th>Fotoğraf</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var st = r.durum || 'none';
        return '<tr><td>' + esc(r.urun) + '</td><td>' + esc(r.barkod) + '</td><td class="num">' + r.siparisAdet + '</td>' +
          '<td class="num">' + (r.durum === 'gelmedi' ? '0 <small class="muted">(' + r.eksik + ' eksik)</small>' : r.iadeAdet) + '</td>' +
          '<td><span class="st ' + st + '">' + esc(EX.STATUS_LABEL[r.durum] || r.durum) + '</span></td>' +
          '<td class="num">' + tl(r.birimKdvDahil) + '</td><td class="num">' + (r.tutar != null ? tl(r.tutar) : '—') + '</td>' +
          '<td><div class="thumbs">' + r.photos.map(function (p) { return thumbHTML(p, 'view'); }).join('') + '</div></td></tr>';
      }).join('') + '</tbody></table></div>';
    if ((rec.genelFotolar || []).length) {
      html += '<p><b>Paket fotoğrafları</b></p><div class="thumbs">' + rec.genelFotolar.map(function (p) { return thumbHTML(p, 'view'); }).join('') + '</div>';
    }
    html += '<div class="pv-total">Yeniden satılabilir: <b>' + sum.satilabilir + '</b> adet · İmha: <b>' + sum.imha + '</b> adet · Toplam fatura tutarı: <b>' + tl(sum.tutar) + '</b></div>';
    if (readonly) {
      if (rec.not) html += '<p><b>Not:</b> ' + esc(rec.not) + '</p>';
    } else {
      html += '<p><label><b>Not</b> (isteğe bağlı)<textarea id="pvNot">' + esc(rec.not) + '</textarea></label></p>' +
        '<label class="check"><input type="checkbox" id="pvCheck"> Ürünleri, adetleri, durumları ve fotoğrafları kontrol ettim.</label>';
    }
    return { html: html, errors: errors };
  }

  function openPreview() {
    if (!S.draft) return;
    if (pendingShots.length) {
      setMsg('Fotoğraf çekiliyor, bekleyin…', 'warn');
      Promise.all(pendingShots).then(openPreview);
      return;
    }
    var rec = draftAsRecord();
    var eksik = EX.rowsForRecord(rec).reduce(function (n, r) { return n + (r.durum === 'gelmedi' ? r.eksik : 0); }, 0);
    if (eksik) say(eksik === 1 ? 'Eksik bir ürün' : 'Eksik ' + eksik + ' ürün');
    var pv = previewHTML(rec, false);
    dialog({
      title: 'Ön İzleme – İade Onayı',
      html: pv.html,
      buttons: [{ label: 'Geri dön ve düzelt', value: false }, { label: 'Onayla ve Kaydet', value: true, primary: true, id: 'pvOk' }],
      onOpen: function (body) {
        var ok = $('pvOk'), chk = body.querySelector('#pvCheck');
        function upd() { ok.disabled = pv.errors.length > 0 || !chk.checked; }
        chk.addEventListener('change', upd);
        upd();
        body.querySelector('#pvNot').addEventListener('input', function (e) { S.draft.not = e.target.value; saveDraft(); });
        setTimeout(function () { chk.focus(); }, 0);
      },
    }).then(function (ok) {
      if (ok) return saveRecord();
    });
  }

  function saveRecord() {
    var d = S.draft;
    var rec = draftAsRecord();
    var old = d.editingId ? S.returns.find(function (r) { return r.id === d.editingId; }) : null;
    if (old) { rec.tamamlanma = old.tamamlanma; rec.duzenlenme = nowISO(); }
    rec.lines = rec.lines.map(function (l) {
      return { itemIdx: l.itemIdx, entries: l.entries.filter(function (e) { return e.qty > 0; }) };
    });
    var keep = new Set(recordPhotoIds(rec));
    var candidates = (d.removedPhotos || []).concat(old ? recordPhotoIds(old) : []).concat(draftPhotoIds(d));
    var drop = candidates.filter(function (id, i, a) { return !keep.has(id) && a.indexOf(id) === i; });
    return DB.putReturn(rec).then(function () {
      S.returns = S.returns.filter(function (r) { return r.id !== rec.id; }).concat([rec]);
      S.draft = null;
      S.lastEntry = null;
      S.unknownCode = null;
      saveDraft();
      renderDraft();
      renderRecords();
      renderOrders();
      beep('ok');
      say('Kaydedildi');
      setMsg('✓ İade kaydedildi: ' + rec.order.siparisNo + ' – ' + rec.order.musteri + '. Sıradaki kargo barkodunu okutun.', 'ok');
      return deletePhotos(drop);
    }).catch(function (err) {
      setMsg('Kaydedilemedi: ' + err.message, 'err');
      beep('err');
    });
  }

  function editRecord(id) {
    var rec = S.returns.find(function (r) { return r.id === id; });
    if (!rec) return Promise.resolve();
    var go = S.draft && draftHasWork(S.draft) ? dialog({
      title: 'Açık iade var', narrow: true,
      html: '<p>Açık iade onaylanmadı. Kaydı düzenlemek için açık iade silinecek.</p>',
      buttons: [{ label: 'Vazgeç', value: false, primary: true }, { label: 'Sil ve devam et', value: true, cls: 'danger' }],
    }) : Promise.resolve(true);
    return go.then(function (ok) {
      if (!ok) return;
      return discardDraft().then(function () {
        var d = newDraft(rec.order);
        d.lines = d.lines.map(function (l) {
          var saved = rec.lines.find(function (x) { return x.itemIdx === l.itemIdx; });
          return saved ? clone(saved) : l;
        });
        d.genelFotolar = (rec.genelFotolar || []).slice();
        d.editingId = rec.id;
        d.not = rec.not || '';
        d.baslangic = rec.baslangic || rec.tamamlanma;
        S.draft = d;
        saveDraft();
        showTab('iade');
        renderDraft();
        setMsg('Kayıt düzenleniyor: ' + rec.order.siparisNo, 'warn');
      });
    });
  }

  // Dosya kaydet: claude.ai Artifact içinde "downloads" yeteneği, normal tarayıcıda indirme bağlantısı
  var downloadsCap = null;
  function saveFile(blob, name) {
    var c = window.claude;
    var get = c && typeof c.use === 'function'
      ? (downloadsCap ? Promise.resolve(downloadsCap) : c.use('downloads').then(function (d) { downloadsCap = d; return d; }))
      : Promise.resolve(null);
    return get.then(function (d) {
      if (!d) { EX.download(blob, name); return; }
      return d.save({ filename: name, data: blob }).then(function () {
        setMsg('✓ ' + name + ' kaydedildi', 'ok');
      }, function (err) {
        if (err && err.code === 'declined') setMsg('Kaydetme iptal edildi', 'warn');
        else if (err && err.code === 'rate_limited') setMsg('Önceki kaydetme onayı hâlâ açık, onu tamamlayın.', 'warn');
        else throw new Error('Dosya kaydedilemedi (' + ((err && err.code) || 'bilinmeyen hata') + ')');
      });
    });
  }

  // ---------- kayıtlar sekmesi ----------
  function filteredRecords() {
    var q = ($('kayitAra').value || '').toLocaleLowerCase('tr-TR').trim();
    var bas = $('kayitBas').value, bit = $('kayitBit').value;
    return S.returns.filter(function (r) {
      var day = new Date(r.tamamlanma);
      var key = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
      if (bas && key < bas) return false;
      if (bit && key > bit) return false;
      if (!q) return true;
      var o = r.order;
      return [o.siparisNo, o.musteri, o.kargoKodu, o.faturaNo, r.personel].join(' ').toLocaleLowerCase('tr-TR').indexOf(q) > -1;
    }).sort(function (a, b) { return a.tamamlanma < b.tamamlanma ? 1 : -1; });
  }

  function recWarnings(rec) {
    var w = [];
    var s = recStats(rec);
    if (s.gelmedi) w.push({ t: 'Eksik ' + s.gelmedi, cls: '' });
    var fazla = rec.order.items.some(function (it) {
      var l = rec.lines.find(function (x) { return x.itemIdx === it.idx; });
      return l && received(l) > it.adet;
    });
    if (fazla) w.push({ t: 'Fazla', cls: '' });
    if (S.returns.filter(function (r) { return r.order.uid === rec.order.uid; }).length > 1) w.push({ t: 'Tekrar iade', cls: '' });
    if (!s.foto) w.push({ t: 'Fotoğrafsız', cls: 'w' });
    return w;
  }

  function recStats(rec) {
    var s = { satilabilir: 0, imha: 0, gelmedi: 0, tutar: 0, foto: (rec.genelFotolar || []).length };
    EX.rowsForRecord(rec).forEach(function (r) {
      if (r.durum === 'gelmedi') s.gelmedi += r.eksik;
      else if (s[r.durum] != null) s[r.durum] += r.iadeAdet;
      s.tutar += r.tutar || 0;
      s.foto += r.photos.length;
    });
    return s;
  }

  function renderRecords() {
    $('kayitSayi').textContent = S.returns.length;
    var list = filteredRecords();
    var warnMap = new Map(list.map(function (r) { return [r.id, recWarnings(r)]; }));
    var uyariSayi = list.filter(function (r) { return warnMap.get(r.id).length; }).length;
    if ($('sadeceUyari').checked) list = list.filter(function (r) { return warnMap.get(r.id).length; });
    var tot = { satilabilir: 0, imha: 0, gelmedi: 0, tutar: 0 };
    var rows = list.map(function (r) {
      var s = recStats(r);
      tot.satilabilir += s.satilabilir; tot.imha += s.imha; tot.gelmedi += s.gelmedi; tot.tutar += s.tutar;
      var o = r.order;
      var w = warnMap.get(r.id);
      return '<tr class="' + (w.length ? 'warnrow' : '') + '"><td>' + esc(EX.fmtDate(r.tamamlanma)) + '</td><td><b>' + esc(o.siparisNo) + '</b></td><td>' + esc(o.musteri) + '</td>' +
        '<td>' + (w.map(function (x) { return '<span class="wp ' + x.cls + '">' + esc(x.t) + '</span>'; }).join('') || '<span class="muted">—</span>') + '</td>' +
        '<td>' + esc(o.kargoKodu) + '</td><td>' + dash(o.faturaNo) + '</td>' +
        '<td class="num">' + s.satilabilir + '</td><td class="num">' + s.imha + '</td><td class="num">' + (s.gelmedi || '') + '</td>' +
        '<td class="num">' + tl(s.tutar) + '</td><td class="num">' + s.foto + '</td><td>' + dash(r.personel) + '</td>' +
        '<td class="actions"><button class="btn small" data-view="' + r.id + '">Görüntüle</button> ' +
        '<button class="btn small" data-edit="' + r.id + '">Düzenle</button> ' +
        '<button class="btn small danger ghost" data-del="' + r.id + '">Sil</button></td></tr>';
    });
    $('kayitOzet').innerHTML =
      '<div class="stat"><small>İade paketi</small><b>' + list.length + '</b></div>' +
      '<div class="stat ok"><small>Yeniden satılabilir</small><b>' + tot.satilabilir + ' adet</b></div>' +
      '<div class="stat bad"><small>İmha</small><b>' + tot.imha + ' adet</b></div>' +
      '<div class="stat"><small>Eksik gelen</small><b>' + tot.gelmedi + ' adet</b></div>' +
      '<div class="stat"><small>Uyarılı kayıt</small><b>' + uyariSayi + '</b></div>' +
      '<div class="stat"><small>Toplam fatura tutarı</small><b>' + tl(tot.tutar) + '</b></div>';
    $('kayitTable').innerHTML = '<thead><tr><th>İade Tarihi</th><th>Sipariş No</th><th>İsim Soyisim</th><th>Uyarı</th><th>Kargo Takip No</th><th>Fatura No</th>' +
      '<th class="num">Satılabilir</th><th class="num">İmha</th><th class="num">Eksik</th><th class="num">Tutar</th><th class="num">Foto</th><th>Personel</th><th></th></tr></thead>' +
      '<tbody>' + (rows.join('') || '<tr><td colspan="13" class="muted">Kayıt yok</td></tr>') + '</tbody>';
  }

  function exportExcel(withZip) {
    var list = filteredRecords().reverse();
    if (!list.length) { dialog({ title: 'Kayıt yok', narrow: true, html: '<p>Dışa aktarılacak iade kaydı yok.</p>' }); return; }
    var btns = [$('btnExcel'), $('btnZip')];
    btns.forEach(function (b) { b.disabled = true; });
    var d = new Date();
    var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '_' +
      String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
    var name = 'Iade_Raporu_' + stamp + '.xlsx';
    EX.buildExcel(list, { embedPhotos: $('embedPhotos').checked, getPhoto: DB.getPhoto }).then(function (blob) {
      if (!withZip) return saveFile(blob, name);
      return EX.buildZip(list, DB.getPhoto, blob, name).then(function (zip) { return saveFile(zip, 'Iade_Raporu_' + stamp + '.zip'); });
    }).catch(function (err) {
      console.error(err);
      dialog({ title: 'Dışa aktarma hatası', narrow: true, html: '<p>' + esc(err.message) + '</p>' });
    }).then(function () { btns.forEach(function (b) { b.disabled = false; }); });
  }

  // ---------- sipariş listesi sekmesi ----------
  function renderOrders() {
    var q = ($('siparisAra').value || '').toLocaleLowerCase('tr-TR').trim();
    var returned = new Set(S.returns.map(function (r) { return r.order.uid; }));
    var list = !q ? S.orders : S.orders.filter(function (o) {
      return [o.kargoKodu, o.siparisNo, o.siparisId, o.musteri, o.faturaNo, o.items.map(function (i) { return i.ad + ' ' + i.barkod; }).join(' ')]
        .join(' ').toLocaleLowerCase('tr-TR').indexOf(q) > -1;
    });
    $('siparisSayi').textContent = list.length + ' sipariş' + (list.length > 300 ? ' (ilk 300 gösteriliyor)' : '');
    $('siparisTable').innerHTML = '<thead><tr><th>Sipariş Tarihi</th><th>Sipariş No</th><th>Kargo Takip No</th><th>İsim Soyisim</th><th>Ürünler</th>' +
      '<th>Kanal</th><th>Durum</th><th>Fatura No</th><th>İade</th><th></th></tr></thead><tbody>' +
      (list.slice(0, 300).map(function (o, i) {
        return '<tr><td>' + esc(o.tarih) + '</td><td><b>' + esc(o.siparisNo) + '</b></td><td>' + esc(o.kargoKodu) + '</td><td>' + esc(o.musteri) + '</td>' +
          '<td>' + o.items.map(function (it) { return esc(it.ad) + ' <b>x' + it.adet + '</b>'; }).join('<br>') + '</td>' +
          '<td>' + esc(o.kanal) + '</td><td>' + statusPill(o.durum) + '</td><td>' + dash(o.faturaNo) + '</td>' +
          '<td>' + (returned.has(o.uid) ? '<span class="st satilabilir">Alındı</span>' : '') + '</td>' +
          '<td><button class="btn small primary" data-open="' + esc(o.uid) + '">İade Al</button></td></tr>';
      }).join('') || '<tr><td colspan="10" class="muted">Sipariş yok. Sağ üstten Excel yükleyin.</td></tr>') + '</tbody>';
  }

  function showTab(name) {
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.id === 'tab-' + name); });
    if (name === 'kayitlar') renderRecords();
    if (name === 'siparisler') renderOrders();
    if (name === 'iade') setTimeout(focusScan, 0);
  }

  // ---------- kamera ----------
  function startCamera(deviceId) {
    $('camOffText').textContent = 'Kamera açılıyor…';
    return CAM.start(deviceId).then(function () {
      $('camOff').hidden = true;
      return CAM.listDevices();
    }).then(function (devs) {
      var sel = $('camSelect');
      var cur = CAM.currentDeviceId();
      sel.innerHTML = devs.map(function (d, i) {
        return '<option value="' + esc(d.deviceId) + '"' + (d.deviceId === cur ? ' selected' : '') + '>' + esc(d.label || 'Kamera ' + (i + 1)) + '</option>';
      }).join('');
    }).catch(function (err) {
      lastCamError = err;
      $('camOff').hidden = false;
      $('camOffText').textContent = cameraHelp(err);
    });
  }

  var lastCamError = null;
  function inFrame() { try { return window.self !== window.top; } catch (e) { return true; } }

  // Kamera neden açılmıyor: ortamı tek ekranda göster
  function cameraDiagnose() {
    var perm = navigator.permissions && navigator.permissions.query
      ? navigator.permissions.query({ name: 'camera' }).then(function (r) { return r.state; }, function () { return 'bilinmiyor'; })
      : Promise.resolve('bilinmiyor');
    var devs = CAM.listDevices().then(function (d) { return d.length; }, function () { return '?'; });
    return Promise.all([perm, devs]).then(function (r) {
      var permTr = { granted: 'İzin verilmiş', denied: 'ENGELLİ', prompt: 'Henüz sorulmadı' }[r[0]] || r[0];
      var err = lastCamError;
      var rows = [
        ['Adres', location.protocol + '//' + location.host + location.pathname.slice(-40)],
        ['Güvenli bağlam', window.isSecureContext ? 'Evet' : 'HAYIR'],
        ['Başka sayfanın içinde (önizleme)', inFrame() ? 'EVET' : 'Hayır'],
        ['Claude sayfası', inArtifact() ? 'EVET' : 'Hayır'],
        ['Kamera izni', permTr],
        ['Bulunan kamera sayısı', String(r[1])],
        ['Kamera çalışıyor', CAM.isReady() ? 'Evet' : 'Hayır'],
        ['Son hata', err ? (err.name || '') + ' – ' + (err.message || '') : '—'],
        ['Tarayıcı', (navigator.userAgent.match(/(Edg|Chrome|Firefox|Safari)\/[\d.]+/) || [navigator.userAgent])[0]],
      ];
      var advice;
      if (CAM.isReady()) advice = 'Kamera çalışıyor.';
      else if (inArtifact() || inFrame() || location.protocol === 'blob:' || location.protocol === 'data:') {
        advice = 'Sayfa bir önizleme/Claude sayfası içinde açılmış; burada kamera engellenir. Dosyayı bilgisayara indirin ve ' +
          'Dosya Gezgini\'nden çift tıklayarak açın. Adres çubuğu file:/// ile başlamalı.';
      } else if (!window.isSecureContext) {
        advice = 'Adres güvenli değil (http). Dosyayı çift tıklayarak (file:///) açın.';
      } else if (r[0] === 'denied' || (err && err.name === 'NotAllowedError')) {
        advice = 'İzin engelli. Adres çubuğunun solundaki simge → Kamera → İzin ver → sayfayı yenileyin. ' +
          'Orada seçenek yoksa Chrome\'da chrome://settings/content/camera adresini açıp engellenenler listesinden silin. ' +
          'Yine olmuyorsa Windows Ayarlar → Gizlilik ve güvenlik → Kamera → "Masaüstü uygulamalarının kameraya erişmesine izin ver" açık olmalı ' +
          '(Mac: Sistem Ayarları → Gizlilik ve Güvenlik → Kamera → Google Chrome açık).';
      } else if (r[1] === 0) {
        advice = 'Tarayıcı hiç kamera görmüyor. USB kamerayı başka porta takın; Windows Kamera uygulamasında görüntü geliyor mu bakın.';
      } else if (err && /NotReadable|TrackStart|Abort/.test(err.name)) {
        advice = 'Kamera başka bir programda açık. Teams/Zoom/WhatsApp/Kamera uygulamasını kapatıp "Kamerayı Aç"a basın.';
      } else advice = '"Kamerayı Aç"a basın; izin sorulursa İzin ver deyin.';
      return dialog({
        title: 'Kamera tanılama',
        narrow: true,
        html: '<table class="grid">' + rows.map(function (x) { return '<tr><th>' + esc(x[0]) + '</th><td>' + esc(x[1]) + '</td></tr>'; }).join('') +
          '</table><p><b>Öneri:</b> ' + esc(advice) + '</p><p class="muted">Sorun sürerse bu ekranın fotoğrafını gönderin.</p>',
        buttons: [{ label: 'Kamerayı yeniden dene', value: 'retry' }, { label: 'Kapat', value: null, primary: true }],
      });
    }).then(function (v) { if (v === 'retry') startCamera(CAM.savedDeviceId()); });
  }

  // claude.ai Artifact içinde mi çalışıyoruz? (orada canlı kamera tarayıcı tarafından engellenir)
  function inArtifact() { return !!(window.claude && typeof window.claude.use === 'function'); }

  function cameraHelp(err) {
    var name = err && err.name;
    var tail = ' Kamera açılana kadar fotoğraflar dosyadan/telefon kamerasından eklenir.' +
      (name ? ' [' + name + ']' : '');
    if (inArtifact()) {
      return 'Claude sayfasında canlı kamera kullanılamaz (izin istenmeden engellenir). Canlı kamera için ' +
        'programın bilgisayar sürümünü (iade-kabul.html) Chrome veya Edge ile açın.' + tail;
    }
    if (inFrame()) {
      return 'Sayfa bir önizleme içinde açılmış; kamera burada engellenir. Dosyayı bilgisayara indirip çift tıklayarak açın ' +
        '(adres çubuğu file:/// ile başlamalı).' + tail;
    }
    if (!window.isSecureContext || !navigator.mediaDevices) {
      return 'Sayfa güvenli olmayan bir adresten açıldı; tarayıcı kamerayı kapatıyor. Dosyayı çift tıklayarak ' +
        '(file://) ya da https adresinden açın.' + tail;
    }
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'Kamera izni engelli. Adres çubuğunun solundaki simgeye tıklayıp Kamera → İzin ver seçin ve sayfayı yenileyin. ' +
        'Sorun sürerse Windows Ayarlar → Gizlilik ve güvenlik → Kamera bölümünde "Kamera erişimi" ve ' +
        '"Masaüstü uygulamalarının kameraya erişmesine izin ver" açık olmalı.' + tail;
    }
    if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
      return 'Kamera başka bir programda açık olabilir (Teams, Zoom, WhatsApp, Kamera uygulaması). O programı kapatıp ' +
        '"Kamerayı Aç"a basın. USB kamerayı çıkarıp takmak da işe yarar.' + tail;
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return 'Kamera bulunamadı. USB kablosunu kontrol edip "Kamerayı Aç"a basın.' + tail;
    }
    return 'Kamera açılamadı (' + (name || '') + ' ' + ((err && err.message) || '') + ').' + tail;
  }

  function viewPhoto(pid, ctx, owner) {
    photoURL(pid).then(function (u) {
      var btns = [{ label: 'Kapat', value: null, primary: true }];
      if (ctx === 'entry' || ctx === 'genel') btns.unshift({ label: 'Fotoğrafı sil', value: 'del', cls: 'danger' });
      return dialog({ title: 'Fotoğraf', html: u ? '<img class="big" src="' + u + '" alt="Fotoğraf">' : '<p>Fotoğraf bulunamadı.</p>', buttons: btns });
    }).then(function (v) {
      if (v !== 'del' || !S.draft) return;
      if (ctx === 'genel') {
        S.draft.genelFotolar = S.draft.genelFotolar.filter(function (x) { return x !== pid; });
      } else if (owner) {
        var e = findEntry(owner.item, owner.entry);
        if (e) e.photos = e.photos.filter(function (x) { return x !== pid; });
      }
      S.draft.removedPhotos.push(pid);
      saveDraft();
      renderDraft();
    });
  }

  // ---------- olaylar ----------
  function bind() {
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.dataset.tab); });
    });

    $('excelInput').addEventListener('change', function (e) {
      var f = e.target.files[0];
      e.target.value = '';
      if (f) loadExcel(f);
    });

    $('personel').value = lsGet('iade.personel', '');
    $('personel').addEventListener('change', function (e) { lsSet('iade.personel', e.target.value.trim()); });

    $('scanInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation(); // aynı Enter açılan diyaloğu onaylamasın
        var v = e.target.value;
        e.target.value = '';
        queue = queue.then(function () { return handleScan(v); }).catch(function (err) { console.error(err); setMsg(err.message, 'err'); });
      }
    });
    $('scanBtn').addEventListener('click', function () {
      var v = $('scanInput').value;
      $('scanInput').value = '';
      queue = queue.then(function () { return handleScan(v); });
      focusScan();
    });

    $('searchResults').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var o = S.results[+b.dataset.i];
      S.results = [];
      renderResults();
      if (o) openOrder(o);
    });

    // Kalemler
    $('items').addEventListener('click', function (e) {
      var img = e.target.closest('img[data-pid]');
      if (img) {
        var en = img.closest('.entry');
        viewPhoto(img.dataset.pid, 'entry', en ? { item: +en.dataset.item, entry: en.dataset.entry } : null);
        return;
      }
      var b = e.target.closest('button[data-act]');
      if (!b) return;
      var act = b.dataset.act;
      if (act === 'confirm') {
        var ctrl = b.closest('.item-ctrl');
        var q = parseInt(ctrl.querySelector('[data-act=mqty]').value, 10);
        if (!(q > 0)) { setMsg('Geçerli bir adet girin', 'err'); return; }
        var idx = +ctrl.dataset.item;
        queue = queue.then(function () { return addEntry(idx, q, 'elle'); }).then(focusScan);
        return;
      }
      var entryEl = b.closest('.entry');
      if (!entryEl) return;
      var itemIdx = +entryEl.dataset.item, entryId = entryEl.dataset.entry;
      var entry = findEntry(itemIdx, entryId);
      if (!entry) return;
      if (act === 'st') { setEntryStatus(itemIdx, entryId, b.dataset.v); S.lastEntry = { itemIdx: itemIdx, entryId: entryId }; focusScan(); }
      else if (act === 'photo') {
        if (CAM.isReady()) {
          captureFromCamera('Ürün: ' + S.draft.order.items[itemIdx].ad).then(function (pid) {
            if (pid) entry.photos.push(pid);
            saveDraft(); renderDraft(); focusScan();
          });
        } else {
          pendingEntryPhoto = { itemIdx: itemIdx, entryId: entryId };
          $('entryFotoFile').click();
        }
      } else if (act === 'split') {
        entry.qty -= 1;
        var ne = { id: uid(), qty: 1, status: '', photos: entry.photos.length > 1 ? [entry.photos.pop()] : [], at: nowISO(), via: 'ayır' };
        lineOf(itemIdx).entries.push(ne);
        S.lastEntry = { itemIdx: itemIdx, entryId: ne.id };
        saveDraft(); renderDraft(); focusScan();
      } else if (act === 'del') {
        dialog({
          title: 'Kalemi sil', narrow: true,
          html: '<p>' + esc(S.draft.order.items[itemIdx].ad) + ' – ' + entry.qty + ' adet ve fotoğrafları silinsin mi?</p>',
          buttons: [{ label: 'Vazgeç', value: false, primary: true }, { label: 'Sil', value: true, cls: 'danger' }],
        }).then(function (ok) {
          if (!ok) return;
          var line = lineOf(itemIdx);
          line.entries = line.entries.filter(function (x) { return x.id !== entryId; });
          S.draft.removedPhotos = S.draft.removedPhotos.concat(entry.photos || []);
          saveDraft(); renderDraft();
        });
      }
    });
    $('items').addEventListener('change', function (e) {
      if (e.target.dataset.act !== 'qty') return;
      var en = e.target.closest('.entry');
      var entry = findEntry(+en.dataset.item, en.dataset.entry);
      var q = parseInt(e.target.value, 10);
      if (entry && q > 0) { entry.qty = q; saveDraft(); renderDraft(); }
      else e.target.value = entry ? entry.qty : 1;
    });
    $('items').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.dataset.act === 'mqty') {
        e.preventDefault();
        e.target.closest('.item-ctrl').querySelector('[data-act=confirm]').click();
      }
    });

    $('entryFotoFile').addEventListener('change', function (e) {
      var f = e.target.files[0];
      e.target.value = '';
      var target = pendingEntryPhoto;
      pendingEntryPhoto = null;
      if (!f || !target || !S.draft) return;
      var it = S.draft.order.items[target.itemIdx];
      CAM.fromFile(f, overlayLines('Ürün: ' + it.ad)).then(storePhoto).then(function (pid) {
        var entry = findEntry(target.itemIdx, target.entryId);
        if (pid && entry) entry.photos.push(pid);
        saveDraft(); renderDraft();
      });
    });

    $('unknownBox').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-learn]');
      if (!b) return;
      var code = S.unknownCode;
      S.unknownCode = null;
      if (b.dataset.learn === 'x' || !S.draft) { renderUnknown(); focusScan(); return; }
      var it = S.draft.order.items[+b.dataset.learn];
      S.learned[P.normCode(code)] = sig(it);
      lsSet('iade.ogrenilenBarkodlar', S.learned);
      queue = queue.then(function () { return addEntry(it.idx, 1, 'okutma'); }).then(focusScan);
    });

    $('genelFotolar').addEventListener('click', function (e) {
      var img = e.target.closest('img[data-pid]');
      if (img) viewPhoto(img.dataset.pid, 'genel');
    });
    $('genelFoto').addEventListener('click', function () {
      if (!S.draft) return;
      if (!CAM.isReady()) { $('genelFotoFile').click(); return; }
      takePackagePhoto(false).then(focusScan);
    });
    $('genelFotoFile').addEventListener('change', function (e) {
      var f = e.target.files[0];
      e.target.value = '';
      if (!f || !S.draft) { if (!S.draft) setMsg('Önce bir sipariş açın', 'warn'); return; }
      CAM.fromFile(f, overlayLines('Paket / genel fotoğraf')).then(storePhoto).then(function (pid) {
        if (pid) S.draft.genelFotolar.push(pid);
        saveDraft(); renderGenelFotolar();
      });
    });

    $('camStart').addEventListener('click', function () { startCamera(CAM.savedDeviceId()); });
    $('camDiag').addEventListener('click', cameraDiagnose);
    $('camSelect').addEventListener('change', function (e) { startCamera(e.target.value).then(focusScan); });
    S.photoMode = lsGet('iade.fotoModu', 'paket');
    S.photoDelay = lsGet('iade.fotoGecikme', 2);
    S.voice = lsGet('iade.sesli', true);
    $('voiceOn').checked = S.voice;
    $('voiceOn').addEventListener('change', function (e) { S.voice = e.target.checked; lsSet('iade.sesli', S.voice); if (S.voice) say('Sesli uyarı açık'); focusScan(); });
    var MODE_HINT = {
      paket: 'Sipariş açılınca paketin tek fotoğrafı çekilir. Ürünü masaya/pakete yerleştirmek için gecikme süresini kullanın.',
      urun: 'Her ürün okutulduğunda ya da onaylandığında ayrı fotoğraf çekilir.',
      kapali: 'Otomatik fotoğraf çekilmez; "Paket fotoğrafı çek" veya kalemdeki "Foto" ile elle çekilir.',
    };
    function paintPhotoSettings() {
      document.querySelectorAll('#photoMode button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === S.photoMode); });
      document.querySelectorAll('#photoDelay button').forEach(function (b) { b.classList.toggle('on', +b.dataset.v === S.photoDelay); });
      $('photoModeHint').textContent = MODE_HINT[S.photoMode] || '';
    }
    paintPhotoSettings();
    $('photoMode').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      S.photoMode = b.dataset.v;
      lsSet('iade.fotoModu', S.photoMode);
      paintPhotoSettings(); renderDraft(); focusScan();
    });
    $('photoDelay').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      S.photoDelay = +b.dataset.v;
      lsSet('iade.fotoGecikme', S.photoDelay);
      paintPhotoSettings(); focusScan();
    });
    $('orderCard').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-edit-prev]');
      if (b) editRecord(b.dataset.editPrev);
    });

    S.defaultStatus = lsGet('iade.varsayilanDurum', '');
    function paintDefault() {
      document.querySelectorAll('#defaultStatus button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === S.defaultStatus); });
    }
    paintDefault();
    $('defaultStatus').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      S.defaultStatus = b.dataset.v;
      lsSet('iade.varsayilanDurum', S.defaultStatus);
      paintDefault();
      focusScan();
    });

    $('btnPreview').addEventListener('click', openPreview);
    $('btnCancel').addEventListener('click', function () {
      if (!S.draft) return;
      var p = draftHasWork(S.draft) ? dialog({
        title: 'İadeden vazgeç', narrow: true,
        html: '<p>Bu siparişte yapılan okutmalar ve çekilen fotoğraflar silinecek' + (S.draft.editingId ? ' (kayıtlı iade değişmeden kalır)' : '') + '.</p>',
        buttons: [{ label: 'Geri dön', value: false, primary: true }, { label: 'Vazgeç ve sil', value: true, cls: 'danger' }],
      }) : Promise.resolve(true);
      p.then(function (ok) {
        if (ok) discardDraft().then(function () { setMsg('İade iptal edildi', 'warn'); focusScan(); });
      });
    });

    // Kayıtlar
    ['kayitAra', 'kayitBas', 'kayitBit'].forEach(function (id) { $(id).addEventListener('input', renderRecords); });
    $('sadeceUyari').addEventListener('change', renderRecords);
    $('btnExcel').addEventListener('click', function () { exportExcel(false); });
    $('btnZip').addEventListener('click', function () { exportExcel(true); });
    $('kayitTable').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.view) {
        var rec = S.returns.find(function (r) { return r.id === b.dataset.view; });
        if (rec) dialog({ title: 'İade Kaydı – ' + rec.order.siparisNo, html: previewHTML(rec, true).html, buttons: [{ label: 'Kapat', value: null, primary: true }] });
      } else if (b.dataset.edit) {
        editRecord(b.dataset.edit);
      } else if (b.dataset.del) {
        var r = S.returns.find(function (x) { return x.id === b.dataset.del; });
        if (!r) return;
        dialog({
          title: 'Kaydı sil', narrow: true,
          html: '<p><b>' + esc(r.order.siparisNo) + '</b> – ' + esc(r.order.musteri) + ' iade kaydı ve fotoğrafları kalıcı olarak silinsin mi?</p>',
          buttons: [{ label: 'Vazgeç', value: false, primary: true }, { label: 'Sil', value: true, cls: 'danger' }],
        }).then(function (ok) {
          if (!ok) return;
          var inDraft = S.draft ? new Set(draftPhotoIds(S.draft)) : new Set();
          return DB.delReturn(r.id).then(function () {
            S.returns = S.returns.filter(function (x) { return x.id !== r.id; });
            if (S.draft && S.draft.editingId === r.id) S.draft.editingId = null;
            renderRecords(); renderOrders(); saveDraft(); renderDraft();
            return deletePhotos(recordPhotoIds(r).filter(function (id) { return !inDraft.has(id); }));
          });
        });
      }
    });
    $('btnClearAll').addEventListener('click', function () {
      dialog({
        title: 'Tüm iade kayıtlarını sil', narrow: true,
        html: '<p><b>' + S.returns.length + '</b> iade kaydı ve tüm fotoğraflar kalıcı olarak silinecek. Önce Excel/ZIP aldığınızdan emin olun.</p>',
        buttons: [{ label: 'Vazgeç', value: false, primary: true }, { label: 'Hepsini sil', value: true, cls: 'danger' }],
      }).then(function (ok) {
        if (!ok) return;
        var keep = S.draft ? draftPhotoIds(S.draft) : [];
        return DB.clearReturns().then(function () {
          var drop = [];
          S.returns.forEach(function (r) { drop = drop.concat(recordPhotoIds(r)); });
          S.returns = [];
          if (S.draft) { S.draft.editingId = null; saveDraft(); renderDraft(); }
          renderRecords(); renderOrders();
          return deletePhotos(drop.filter(function (id) { return keep.indexOf(id) < 0; }));
        });
      });
    });

    // Siparişler
    $('siparisAra').addEventListener('input', renderOrders);
    $('siparisTable').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-open]');
      if (!b) return;
      var o = S.orders.find(function (x) { return x.uid === b.dataset.open; });
      if (!o) return;
      showTab('iade');
      openOrder(o);
    });
    $('btnClearOrders').addEventListener('click', function () {
      dialog({
        title: 'Sipariş listesini temizle', narrow: true,
        html: '<p>Yüklü ' + S.orders.length + ' sipariş silinecek (iade kayıtları etkilenmez).</p>',
        buttons: [{ label: 'Vazgeç', value: false, primary: true }, { label: 'Temizle', value: true, cls: 'danger' }],
      }).then(function (ok) {
        if (!ok) return;
        S.meta = null;
        setOrders([]);
        renderOrders();
        return Promise.all([DB.del('orders'), DB.del('meta')]);
      });
    });

    // Diyalog
    $('dialogClose').addEventListener('click', function () { closeDialog(null); });
    $('dialog').addEventListener('click', function (e) { if (e.target === $('dialog')) closeDialog(null); });
    $('dialogBody').addEventListener('click', function (e) {
      var img = e.target.closest('img[data-pid][data-ctx=view]');
      if (img) img.classList.toggle('zoom');
    });

    // Kısayollar
    document.addEventListener('keydown', function (e) {
      var dlgOpen = !$('dialog').hidden;
      if (dlgOpen) {
        if (e.key === 'Escape') { e.preventDefault(); closeDialog(null); }
        // Barkod okuyucunun sondaki Enter'ı yeni açılan diyaloğu onaylamasın
        else if (e.key === 'Enter' && !/TEXTAREA|BUTTON/.test(e.target.tagName) && Date.now() - dialogOpenedAt > 400) {
          var pb = $('dialogFoot').querySelector('[data-primary]');
          if (pb && !pb.disabled) { e.preventDefault(); pb.click(); }
        }
        return;
      }
      if (e.key === 'F2') { e.preventDefault(); openPreview(); return; }
      if ((e.key === 'F6' || e.key === 'F7') && S.draft && S.lastEntry) {
        e.preventDefault();
        var en = findEntry(S.lastEntry.itemIdx, S.lastEntry.entryId);
        if (en) { en.status = e.key === 'F6' ? 'satilabilir' : 'imha'; saveDraft(); renderDraft(S.lastEntry.itemIdx); beep('ok'); }
        return;
      }
      // Odak bir alanda değilse barkod okuyucu girdisini okutma kutusuna yönlendir
      var tag = e.target.tagName;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !/INPUT|TEXTAREA|SELECT/.test(tag) &&
        $('tab-iade').classList.contains('active')) {
        $('scanInput').focus();
      }
    });

    window.addEventListener('beforeunload', function () { CAM.stop(); });
  }

  function init() {
    CAM.init($('video'));
    S.learned = lsGet('iade.ogrenilenBarkodlar', {});
    bind();
    Promise.all([DB.get('orders'), DB.get('meta'), DB.allReturns(), DB.get('draft')]).then(function (r) {
      S.meta = r[1] || null;
      setOrders(r[0] || []);
      S.returns = r[2] || [];
      S.draft = r[3] || null;
      if (S.draft && !S.draft.removedPhotos) S.draft.removedPhotos = [];
      renderDraft();
      renderRecords();
      renderOrders();
      if (S.draft) setMsg('Yarım kalan iade geri yüklendi: ' + S.draft.order.siparisNo, 'warn');
      focusScan();
    }).catch(function (err) {
      setMsg('Veritabanı açılamadı: ' + err.message, 'err');
    });
    startCamera(CAM.savedDeviceId());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
