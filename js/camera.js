/* Kamera: canlı önizleme, cihaz seçimi ve üzerine tarih/sipariş bilgisi basılmış fotoğraf çekimi */
(function (root) {
  'use strict';
  var video, stream = null, currentId = null;
  var LS_KEY = 'iade.kamera';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* yoksay */ } }

  function stop() {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
  }

  function start(deviceId) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error('Tarayıcı kamerayı desteklemiyor'));
    }
    stop();
    var constraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
    };
    return navigator.mediaDevices.getUserMedia(constraints).catch(function (err) {
      // İzin reddi dışındaki hatalarda (kayıtlı kamera çıkarılmış, çözünürlük desteklenmiyor,
      // kamera meşgul) en sade istekle bir kez daha dene
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) throw err;
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }).then(function (s) {
      stream = s;
      video.srcObject = s;
      var track = s.getVideoTracks()[0];
      currentId = track && track.getSettings ? track.getSettings().deviceId : deviceId;
      if (currentId) lsSet(LS_KEY, currentId);
      return video.play().catch(function () { /* otomatik oynatma engeli */ });
    });
  }

  function listDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return Promise.resolve([]);
    return navigator.mediaDevices.enumerateDevices().then(function (list) {
      return list.filter(function (d) { return d.kind === 'videoinput'; });
    });
  }

  function isReady() { return !!(stream && video && video.videoWidth); }

  function drawOverlay(ctx, w, h, lines) {
    if (!lines || !lines.length) return;
    var fs = Math.max(14, Math.round(w / 55));
    var pad = Math.round(fs * 0.6);
    var boxH = lines.length * (fs + 6) + pad * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, h - boxH, w, boxH);
    ctx.fillStyle = '#fff';
    ctx.font = '600 ' + fs + 'px system-ui, Segoe UI, Arial, sans-serif';
    ctx.textBaseline = 'top';
    lines.forEach(function (l, i) {
      ctx.fillText(String(l).slice(0, 140), pad, h - boxH + pad + i * (fs + 6));
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', 0.85); });
  }

  // Kameradan çek; hazır değilse null döner.
  function capture(lines) {
    if (!isReady()) return Promise.resolve(null);
    var w = video.videoWidth, h = video.videoHeight;
    var scale = Math.min(1, 1600 / w);
    var c = document.createElement('canvas');
    c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    var ctx = c.getContext('2d');
    ctx.drawImage(video, 0, 0, c.width, c.height);
    drawOverlay(ctx, c.width, c.height, lines);
    return canvasToBlob(c);
  }

  // Dosyadan/telefon kamerasından gelen görsele de aynı bilgi bandını bas.
  function fromFile(file, lines) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 1600 / img.naturalWidth);
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, c.width, c.height);
        drawOverlay(ctx, c.width, c.height, lines);
        URL.revokeObjectURL(url);
        canvasToBlob(c).then(resolve);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Görsel okunamadı')); };
      img.src = url;
    });
  }

  // Excel'e gömmek için küçük önizleme (base64 JPEG)
  function thumbnail(blob, maxW) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxW / img.naturalWidth);
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ base64: c.toDataURL('image/jpeg', 0.7).split(',')[1], width: c.width, height: c.height });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Görsel okunamadı')); };
      img.src = url;
    });
  }

  root.IadeCamera = {
    init: function (videoEl) { video = videoEl; },
    start: start,
    stop: stop,
    listDevices: listDevices,
    isReady: isReady,
    capture: capture,
    fromFile: fromFile,
    thumbnail: thumbnail,
    savedDeviceId: function () { return lsGet(LS_KEY); },
    currentDeviceId: function () { return currentId; },
  };
})(this);
