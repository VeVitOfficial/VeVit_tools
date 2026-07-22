// Hub: vyhledávání, scroll-spy aktivní kategorie, přepínání sekce/výsledky.
(function () {
  var search = document.getElementById('hub-search');
  if (!search) return;

  var sectionsView = document.getElementById('sections-view');
  var resultsSection = document.getElementById('search-results');
  var resultsGrid = document.getElementById('results-grid');
  var resultsTitle = document.getElementById('results-title');
  var resultsEmpty = document.getElementById('results-empty');
  var catNav = document.getElementById('cat-nav');

  // Seznam všech karet (data atributy + reference pro klonování uzlem, ne HTML).
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tool-card')).map(function (c) {
    return {
      el: c,
      name: c.getAttribute('data-name') || '',
      desc: c.getAttribute('data-desc') || '',
      slug: c.getAttribute('data-slug') || '',
    };
  });

  function clearResults() {
    while (resultsGrid.firstChild) resultsGrid.removeChild(resultsGrid.firstChild);
  }

  function runSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) {
      sectionsView.classList.remove('hidden');
      catNav && catNav.classList.remove('hidden');
      resultsSection.classList.add('hidden');
      clearResults();
      return;
    }
    sectionsView.classList.add('hidden');
    catNav && catNav.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    var matches = cards.filter(function (c) {
      return c.name.indexOf(q) !== -1 || c.desc.indexOf(q) !== -1 || c.slug.indexOf(q) !== -1;
    });

    clearResults();
    // Klonujeme existující uzly karet (bez parsování HTML — bezpečnější vůči XSS).
    matches.forEach(function (c) {
      resultsGrid.appendChild(c.el.cloneNode(true));
    });

    resultsEmpty.classList.toggle('hidden', matches.length > 0);
    resultsGrid.classList.toggle('hidden', matches.length === 0);
    resultsTitle.textContent = matches.length > 0
      ? matches.length + ' výsledků pro „' + q + '“'
      : 'Žádné výsledky';
  }

  var debounce;
  search.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { runSearch(search.value); }, 120);
  });

  // Scroll-spy – zvýrazní aktivní kategorii v rychlé navigaci.
  var chips = Array.prototype.slice.call(document.querySelectorAll('.cat-nav .chip'));
  function setActive(id) {
    chips.forEach(function (ch) { ch.classList.toggle('active', ch.getAttribute('data-target') === id); });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-96px 0px -55% 0px', threshold: [0, 0.25, 0.5] });
    Array.prototype.forEach.call(document.querySelectorAll('#sections-view section[id]'), function (s) {
      io.observe(s);
    });
  }
})();