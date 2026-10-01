/* Basit IndexedDB sarmalayıcı: kv (ayarlar/sipariş listesi/taslak), returns (iade kayıtları), photos (fotoğraflar) */
(function (root) {
  'use strict';
  var DB_NAME = 'iadeProgrami';
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('returns')) db.createObjectStore('returns', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function tx(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode);
        var s = t.objectStore(store);
        var result;
        var r = fn(s);
        if (r) r.onsuccess = function () { result = r.result; };
        t.oncomplete = function () { resolve(result); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error || new Error('İşlem iptal edildi')); };
      });
    });
  }

  root.IadeDB = {
    get: function (key) { return tx('kv', 'readonly', function (s) { return s.get(key); }); },
    set: function (key, val) { return tx('kv', 'readwrite', function (s) { return s.put(val, key); }); },
    del: function (key) { return tx('kv', 'readwrite', function (s) { return s.delete(key); }); },

    putReturn: function (rec) { return tx('returns', 'readwrite', function (s) { return s.put(rec); }); },
    allReturns: function () { return tx('returns', 'readonly', function (s) { return s.getAll(); }); },
    delReturn: function (id) { return tx('returns', 'readwrite', function (s) { return s.delete(id); }); },
    clearReturns: function () { return tx('returns', 'readwrite', function (s) { return s.clear(); }); },

    putPhoto: function (p) { return tx('photos', 'readwrite', function (s) { return s.put(p); }); },
    getPhoto: function (id) { return tx('photos', 'readonly', function (s) { return s.get(id); }); },
    delPhoto: function (id) { return tx('photos', 'readwrite', function (s) { return s.delete(id); }); },
  };
})(this);
