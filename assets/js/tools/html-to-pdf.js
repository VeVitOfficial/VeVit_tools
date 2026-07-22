// HTML → PDF přes html2canvas + jsPDF, čistě client-side.
(function () {
  'use strict';
  var html = ToolUI.el('hp-html'), size = ToolUI.el('hp-size'), orient = ToolUI.el('hp-orient');
  var scale = ToolUI.el('hp-scale'), run = ToolUI.el('hp-run'), err = ToolUI.el('hp-error');
  var prog = ToolUI.el('hp-prog'), progLabel = ToolUI.el('hp-prog-label');

  function fail(m) { err.textContent = m; err.classList.remove('hidden'); }
  function clearErr() { err.classList.add('hidden'); err.textContent = ''; }
  function jsPDFClass() { return (window.jspdf && window.jspdf.jsPDF) || window.jsPDF; }

  run.addEventListener('click', function () {
    clearErr();
    if (!html.value.trim()) return fail('Vložte HTML kód.');
    var J = jsPDFClass();
    if (!J) {
      ToolUI.loadScript('/assets/js/lib/jspdf.umd.min.js').then(function () {
        if (!jsPDFClass()) return fail('Knihovnu jsPDF se nepodařilo načíst.');
        go();
      });
    } else go();
  });

  function go() {
    if (!window.html2canvas) {
      ToolUI.loadScript('/assets/js/lib/html2canvas.min.js').then(function () {
        if (!window.html2canvas) return fail('Knihovnu html2canvas se nepodařilo načíst.');
        render();
      });
    } else render();
  }

  function render() {
    prog.classList.remove('hidden'); progLabel.classList.remove('hidden');
    ToolUI.setProgress(prog, 10, 'Připravuji kontejner…');
    // kontejner mimo obrazovku s bílým pozadím
    var holder = document.createElement('div');
    holder.style.position = 'fixed'; holder.style.left = '-99999px'; holder.style.top = '0';
    holder.style.background = '#ffffff'; holder.style.width = '794px'; // ~A4 při 96dpi
    holder.style.padding = '24px'; holder.style.color = '#111'; holder.style.fontFamily = 'sans-serif';
    holder.innerHTML = html.value; // uživatelský vstup — vykreslí se do izolovaného kontejneru (ne do stránky), výstup je obrázek
    document.body.appendChild(holder);
    var s = parseFloat(scale.value) || 2;
    ToolUI.setProgress(prog, 25, 'Renderuji přes html2canvas…');
    window.html2canvas(holder, { scale: s, backgroundColor: '#ffffff', useCORS: true }).then(function (canvas) {
      ToolUI.setProgress(prog, 70, 'Sestavuji PDF…');
      document.body.removeChild(holder);
      var J = jsPDFClass();
      var fmt = size.value, o = orient.value;
      var pdf = new J({ orientation: o, unit: 'pt', format: fmt });
      var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      var imgW = pw, imgH = canvas.height * (imgW / canvas.width);
      var dataURL = canvas.toDataURL('image/jpeg', 0.92);
      var remaining = imgH, pos = 0;
      // první stránka
      pdf.addImage(dataURL, 'JPEG', 0, pos, imgW, imgH);
      remaining -= ph; pos -= ph;
      while (remaining > 0) { pdf.addPage(); pdf.addImage(dataURL, 'JPEG', 0, pos, imgW, imgH); remaining -= ph; pos -= ph; }
      ToolUI.setProgress(prog, 100, 'Hotovo');
      prog.classList.add('hidden'); progLabel.classList.add('hidden');
      pdf.save('html-dokument.pdf');
      if (window.toast) toast.success('PDF vygenerováno');
    }).catch(function (e) {
      if (holder.parentNode) document.body.removeChild(holder);
      prog.classList.add('hidden'); progLabel.classList.add('hidden');
      fail(e && e.message ? e.message : 'Generování PDF selhalo.');
    });
  }
})();