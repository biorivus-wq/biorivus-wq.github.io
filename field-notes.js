'use strict';
// This widget is loaded only in the desktop layout; the measurements remain ordinary HTML.
(function initResearchStation() {
  const element = document.getElementById('station-map');
  if (!element) return;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const station = [52.37244358899235, 16.857199634939064];
  let map, pending = false, nearViewport = false;
  const shell = element.closest('.station-map-shell');
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = 'assets/vendor/leaflet-1.9.4.css';
      document.head.append(style);
      const script = document.createElement('script');
      script.src = 'assets/vendor/leaflet-1.9.4.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  async function revealMap() {
    if (!desktop.matches || !nearViewport) return;
    if (map) { map.invalidateSize({pan:false}); return; }
    if (pending) return;
    pending = true;
    try {
      await loadLeaflet();
      if (!desktop.matches) { pending = false; return; }
      element.replaceChildren();
      map = L.map(element, {zoomControl:false,scrollWheelZoom:false,attributionControl:false,
        dragging:true,keyboard:true,tap:false,minZoom:14,maxZoom:18}).setView(station,16);
      L.control.zoom({position:'topright',zoomInTitle:'Przybliż mapę',zoomOutTitle:'Oddal mapę'}).addTo(map);
      L.control.attribution({prefix:false,position:'bottomright'}).addTo(map);
      L.tileLayer(element.dataset.tileUrl, {
        maxZoom:19,keepBuffer:0,
        attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      }).addTo(map);
      L.control.scale({imperial:false,maxWidth:70,position:'bottomleft'}).addTo(map);
      const icon = L.divIcon({className:'station-marker',html:'<span class="station-pin"><span></span></span>',iconSize:[32,32],iconAnchor:[16,16]});
      L.marker(station,{icon,keyboard:true,title:'Strumień Junikowski — stanowisko ul. Wykopy',alt:'Stanowisko pomiarowe: ul. Wykopy'}).addTo(map)
        .bindTooltip('ul. Wykopy',{permanent:true,direction:'top',offset:[0,-15],className:'station-pin-label'});
      const center = shell.querySelector('.station-recenter');
      center.hidden = false;
      center.addEventListener('click',()=>map.setView(station,16,{animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches}));
      new ResizeObserver(()=>{if(desktop.matches) map.invalidateSize({pan:false});}).observe(element);
      element.dataset.ready = 'true';
    } catch (error) {
      element.innerHTML = '<span class="station-map-placeholder">52.372444° N · 16.857200° E<br>Otwórz stanowisko w Google Maps poniżej.</span>';
      element.dataset.ready = 'unavailable';
    }
  }
  const observer = new IntersectionObserver(entries=>{
    nearViewport = entries.some(entry=>entry.isIntersecting);
    revealMap();
  },{rootMargin:'180px'});
  observer.observe(shell);
  desktop.addEventListener('change',revealMap);
})();

(function initCareerRiver() {
  const river = document.querySelector('.career-river');
  if (!river) return;
  const milestones = [
  {
    "id": "doctorate",
    "year": "2008",
    "label": "Doktorat",
    "date": "22 października 2008",
    "title": "Obrona pracy doktorskiej",
    "place": "Uniwersytet Przyrodniczy w Poznaniu",
    "description": "„Wpływ użytkowania zlewni na stan ekologiczny rzek oceniany metodami makrofitowymi”.",
    "meaning": "Naukowy fundament łączenia oceny rzek z analizą ich zlewni."
  },
  {
    "id": "mmor",
    "year": "2010",
    "label": "Bioindykacja · MMOR",
    "date": "2006–2010",
    "title": "Od badań do metody oceny",
    "place": "Uniwersytet Przyrodniczy w Poznaniu",
    "description": "Udział w pracach nad MMOR i współautorstwo podręcznika metodycznego z 2010 r.",
    "meaning": "Metoda wykorzystująca rośliny wodne w Państwowym Monitoringu Środowiska."
  },
  {
    "id": "ppnt",
    "year": "2016",
    "label": "Praca w PPNT",
    "date": "Od 2016 roku",
    "title": "Nauka w praktyce",
    "place": "Poznański Park Naukowo-Technologiczny",
    "description": "Popularyzacja nauki, programy edukacyjne i współpraca z biznesem, m.in. przy kalkulatorze CREDIT4CE.",
    "meaning": "Przekładanie wiedzy na zrozumiałe treści i użyteczne narzędzia."
  },
  {
    "id": "wwf",
    "year": "WWF",
    "label": "Koordynacja regionalna",
    "date": "Strażnicy Rzek WWF",
    "title": "Współpraca na rzecz rzek",
    "place": "Fundacja WWF Polska",
    "description": "Koordynacja regionalna, wsparcie wolontariuszy i terenowych działań na rzecz ochrony rzek.",
    "meaning": "Łączenie wiedzy przyrodniczej z lokalnym zaangażowaniem."
  },
  {
    "id": "biorivus",
    "year": "2026",
    "label": "Powstaje BioRivus",
    "date": "11 czerwca 2026",
    "title": "Własna działalność",
    "place": "BioRivus Tomasz Zgoła · Poznań",
    "description": "Ekspertyzy przyrodnicze i środowiskowe, opracowania dla biznesu oraz edukacja.",
    "meaning": "Wspólna przestrzeń dla doświadczeń z nauki, terenu i pracy z ludźmi."
  }
];
  const canvas = river.querySelector('.career-canvas');
  const tooltip = river.querySelector('.career-tooltip');
  const points = Array.from(river.querySelectorAll('.career-point'));
  const path = river.querySelector('#career-current-path');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = null, leaveTimer;
  points.forEach((point,index)=>{
    const position = path.getPointAtLength(path.getTotalLength() * ((index+.5)/points.length));
    point.style.left = (position.x/300*100) + '%';
    point.style.top = (position.y/420*100) + '%';
  });
  function close() {
    clearTimeout(leaveTimer);
    tooltip.hidden = true;
    active = null;
    points.forEach(point=>{point.classList.remove('is-active');point.setAttribute('aria-expanded','false');});
  }
  function show(point) {
    clearTimeout(leaveTimer);
    const milestone = milestones.find(item=>item.id===point.dataset.milestone);
    const changed = active !== milestone.id;
    active = milestone.id;
    tooltip.querySelector('.career-date').textContent = milestone.date;
    tooltip.querySelector('h4').textContent = milestone.title;
    tooltip.querySelector('.career-place').textContent = milestone.place;
    tooltip.querySelector('.career-description').textContent = milestone.description;
    tooltip.querySelector('.career-meaning').textContent = milestone.meaning;
    tooltip.hidden = false;
    points.forEach(item=>{const current=item===point;item.classList.toggle('is-active',current);item.setAttribute('aria-expanded',String(current));});
    const targetTop = point.offsetTop - 32;
    tooltip.style.top = Math.max(0,Math.min(targetTop,canvas.clientHeight-tooltip.offsetHeight))+'px';
    if (changed && !reducedMotion.matches) tooltip.animate([{opacity:0,transform:'translateX(-8px)'},{opacity:1,transform:'translateX(0)'}],{duration:200,easing:'ease-out'});
  }
  points.forEach(point=>{
    point.addEventListener('pointerenter',()=>show(point));
    point.addEventListener('focus',()=>show(point));
    point.addEventListener('click',()=>show(point));
    point.addEventListener('keydown',event=>{
      const index = points.indexOf(point);
      if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();points[(index+1)%points.length].focus();}
      if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();points[(index+points.length-1)%points.length].focus();}
    });
  });
  river.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  river.addEventListener('pointerleave',()=>{leaveTimer=setTimeout(close,180);});
  river.addEventListener('focusout',event=>{if(!river.contains(event.relatedTarget))close();});
  river.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  tooltip.querySelector('.career-tooltip-close').addEventListener('click',close);
  new IntersectionObserver(entries=>river.classList.toggle('is-in-view',entries.some(entry=>entry.isIntersecting))).observe(river);
})();
