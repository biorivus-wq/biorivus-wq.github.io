'use strict';
(() => {
  const explorer = document.querySelector('.river-explorer');
  if (!explorer) return;
  const points = [...explorer.querySelectorAll('[data-river]')];
  const readout = explorer.querySelector('.river-readout');
  const metric = readout.querySelector('.river-metric');
  const value = readout.querySelector('.river-value');
  const description = readout.querySelector('.river-description');
  const initial = { metric: metric.textContent, value: value.textContent, description: description.textContent };
  // Illustrative values only. Species name: https://siedliska.gios.gov.pl/monitoring-siedlisk-5?id=237&view=article
  const examples = {
    ph: { metric: 'ODCZYN WODY · pH', value: '7,4', description: 'Jeden z parametrów fizykochemicznych wody.' },
    ec: { metric: 'KONDUKTYWNOŚĆ · EC', value: '420 µS/cm', description: 'Przewodność elektryczna, odniesiona do 25 °C.' },
    temp: { metric: 'TEMPERATURA WODY', value: '16,8 °C', description: 'Wynik odczytywany w miejscu pomiaru.' },
    species: { metric: 'ROŚLINNOŚĆ WODNA', value: 'Zdrojek pospolity', description: 'Fontinalis antipyretica — przykład gatunku.' }
  };
  let active = null;
  function show(key) {
    if (key === active) return;
    const example = examples[key] || initial;
    active = examples[key] ? key : null;
    metric.textContent = example.metric;
    value.textContent = example.value;
    description.textContent = example.description;
    readout.dataset.kind = active || 'intro';
    points.forEach(point => point.setAttribute('aria-pressed', String(point.dataset.river === active)));
  }
  points.forEach(point => {
    point.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') show(point.dataset.river);
    });
    point.addEventListener('focus', () => show(point.dataset.river));
    point.addEventListener('click', () => show(point.dataset.river));
  });
  explorer.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      show(null);
      event.stopPropagation();
    }
  });
})();
