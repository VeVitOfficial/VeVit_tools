// Sdílený lazy-loaded wrapper pro ffmpeg.wasm.
// Jediný načtený ~25MB WASM balíček napříč všemi nástroji kategorie Média (Dávka 11).
//
// Vendoorované soubory (task #12):
//   /assets/js/lib/ffmpeg/ffmpeg.js        — @ffmpeg/ffmpeg UMD (window.FFmpegWASM)
//   /assets/js/lib/ffmpeg/ffmpeg-core.js   — @ffmpeg/core
//   /assets/js/lib/ffmpeg/ffmpeg-core.wasm  — jádro
//   /assets/js/lib/ffmpeg/ffmpeg-core.wasm.mem — worker asset (podle verze)
//
// Použití:
//   FFmpegWrapper.ready().then(function(ffmpeg){ ... FFmpegWrapper.run(ffmpeg, [...]) ... })
//
// Bezpečnost: wrapper nepřijímá žádný vstup do shellu mimo explicitní argumenty,
// které předáváme jako pole (žádné spojování řetězců do jednoho příkazu).
(function () {
  'use strict';
  if (window.FFmpegWrapper) return; // načteno jednou

  var BASE = '/assets/js/lib/ffmpeg/';
  var loadPromise = null;
  var instance = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { res(); }; s.onerror = function () { rej(new Error('Nelze načíst ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ready() {
    if (loadPromise) return loadPromise;
    loadPromise = loadScript(BASE + 'ffmpeg.js').then(function () {
      var FF = window.FFmpegWASM || (window.FFmpeg && window.FFmpeg.FFmpeg);
      if (!FF) throw new Error('ffmpeg.wasm se nepodařilo inicializovat (chybí globál FFmpegWASM).');
      instance = new FF();
      return instance.load({
        coreURL: BASE + 'ffmpeg-core.js',
        wasmURL: BASE + 'ffmpeg-core.wasm'
      }).then(function () { return instance; });
    });
    return loadPromise;
  }

  // Zapíše soubory do virtuální FS, spustí ffmpeg s args, vrátí pole výstupních jmen.
  function transcode(ffmpeg, inputs, args, outputs) {
    // inputs: [{name, data: Uint8Array}], outputs: [name]
    var chain = Promise.resolve();
    inputs.forEach(function (inp) {
      chain = chain.then(function () { return ffmpeg.writeFile(inp.name, inp.data); });
    });
    chain = chain.then(function () { return ffmpeg.exec(args); });
    outputs.forEach(function (out) {
      chain = chain.then(function () { return ffmpeg.readFile(out); });
    });
    return chain;
  }

  function readFile(ffmpeg, name) { return ffmpeg.readFile(name); }
  function writeFile(ffmpeg, name, data) { return ffmpeg.writeFile(name, data); }
  function deleteFile(ffmpeg, name) { try { return ffmpeg.deleteFile(name); } catch (e) { return Promise.resolve(); } }

  window.FFmpegWrapper = {
    ready: ready,
    transcode: transcode,
    readFile: readFile,
    writeFile: writeFile,
    deleteFile: deleteFile,
    // UI hláška pro uživatele při prvním načítání
    LOADING_NOTE: 'Poprvé se načítá ffmpeg.wasm (~25 MB) — může trvat několik sekund. Další nástroje už balíček sdílejí.'
  };
})();