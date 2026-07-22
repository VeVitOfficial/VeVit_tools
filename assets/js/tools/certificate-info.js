// SSL certifikát info — volá serverový endpoint api/ssl-check.php.
(function () {
  'use strict';
  var domain = ToolUI.el('ci-domain'), run = ToolUI.el('ci-run'), err = ToolUI.el('ci-error');
  var prog = ToolUI.el('ci-prog'), progLabel = ToolUI.el('ci-prog-label');
  var result = ToolUI.el('ci-result');

  function fail(m) { err.textContent = m; err.classList.remove('hidden'); }
  function clearErr() { err.classList.add('hidden'); err.textContent = ''; }
  function set(id, v) { var el = ToolUI.el(id); el.textContent = v == null ? '—' : String(v); }

  run.addEventListener('click', function () {
    clearErr();
    var d = domain.value.trim();
    if (!d) return fail('Zadejte doménu.');
    result.classList.add('hidden');
    prog.classList.remove('hidden'); progLabel.classList.remove('hidden');
    ToolUI.setProgress(prog, 30, 'Připojuji se k ' + d + ':443…');
    fetch('/api/ssl-check.php?domain=' + encodeURIComponent(d), { headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        return r.json().then(function (body) { return { ok: r.ok, status: r.status, body: body }; });
      }).then(function (res) {
        prog.classList.add('hidden'); progLabel.classList.add('hidden');
        if (!res.ok) return fail(res.body && res.body.message ? res.body.message : ('Chyba ' + res.status));
        var b = res.body;
        ToolUI.setProgress(prog, 100, 'Hotovo');
        var st = ToolUI.el('ci-status');
        if (b.expired) { st.textContent = '⚠ Certifikát EXPIROVAL'; st.style.color = '#ef4444'; }
        else if (b.daysLeft !== null && b.daysLeft < 14) { st.textContent = '⚠ Platnost brzy vyprší'; st.style.color = '#f59e0b'; }
        else { st.textContent = '✓ Certifikát je platný'; st.style.color = '#22c55e'; }
        set('ci-issuer', (b.issuer.O && b.issuer.O !== '—' ? b.issuer.O : b.issuer.CN) + (b.issuer.CN && b.issuer.O && b.issuer.CN !== b.issuer.O ? ' (' + b.issuer.CN + ')' : ''));
        set('ci-subject', (b.subject.O && b.subject.O !== '—' ? b.subject.O + ' — ' : '') + b.subject.CN);
        set('ci-from', b.validFrom); set('ci-to', b.validTo);
        set('ci-days', b.daysLeft == null ? '—' : (b.daysLeft + ' dní'));
        set('ci-serial', b.serialNumber);
        set('ci-sig', b.signatureType);
        set('ci-san', (b.san && b.san.length) ? b.san.join(', ') : '—');
        set('ci-chain', b.chainLength);
        result.classList.remove('hidden');
        if (window.toast) toast.success('Certifikát načten');
      }).catch(function (e) {
        prog.classList.add('hidden'); progLabel.classList.add('hidden');
        fail(e && e.message ? e.message : 'Spojení se nezdařilo.');
      });
  });
  domain.addEventListener('keydown', function (e) { if (e.key === 'Enter') run.click(); });
})();