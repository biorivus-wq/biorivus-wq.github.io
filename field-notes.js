'use strict';
// Reuse the same map and milestones in the appropriate layout: one source of data.
(function placeResponsiveWidgets() {
  const desktop = window.matchMedia('(min-width: 1024px)');
  const station = document.querySelector('.research-station');
  const river = document.querySelector('.career-river');
  const stationHome = station.parentElement;
  const careerHome = river.parentElement;
  const mobileStation = document.getElementById('mobile-station-slot');
  const mobileCareer = document.getElementById('mobile-career-slot');
  function place() {
    if (desktop.matches) { stationHome.prepend(station); careerHome.prepend(river); }
    else { mobileStation.append(station); mobileCareer.append(river); }
    river.querySelector('.career-hint').textContent = desktop.matches ? 'Najedź na punkt i poznaj historię.' : 'Dotknij etapu, aby rozwinąć jego opis.';
    document.dispatchEvent(new Event('biorivus:layoutchange'));
  }
  desktop.addEventListener('change', place);
  place();
  const accents = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting)));
  document.querySelectorAll('.mobile-disclosure').forEach(element => accents.observe(element));
})();

// Load the map near the desktop viewport or only after an explicit mobile expansion.
(function initResearchStation() {
  const element = document.getElementById('station-map');
  if (!element) return;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const station = [52.37244358899235, 16.857199634939064];
  const disclosure = document.getElementById('mobile-measurements');
  const available = () => desktop.matches || disclosure.open;
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
    if (!available() || (!nearViewport && desktop.matches)) return;
    if (map) { map.invalidateSize({pan:false}); if(desktop.matches) { map.dragging.enable(); map.touchZoom.enable(); } else { map.dragging.disable(); map.touchZoom.disable(); } return; }
    if (pending) return;
    pending = true;
    try {
      await loadLeaflet();
      if (!available()) { pending = false; return; }
      element.replaceChildren();
      map = L.map(element, {zoomControl:false,scrollWheelZoom:false,attributionControl:false,
        dragging:desktop.matches,touchZoom:desktop.matches,keyboard:true,tap:false,minZoom:14,maxZoom:18}).setView(station,16);
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
      new ResizeObserver(()=>{if(available()) map.invalidateSize({pan:false});}).observe(element);
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
  disclosure.addEventListener('toggle',revealMap);
  document.addEventListener('biorivus:layoutchange',revealMap);
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
    "year": "2016–2026",
    "label": "Praca w PPNT",
    "date": "2016–2026",
    "title": "Nauka w praktyce",
    "place": "Poznański Park Naukowo-Technologiczny",
    "description": "Popularyzacja nauki, programy edukacyjne i współpraca z biznesem, m.in. przy kalkulatorze CREDIT4CE.",
    "meaning": "Przekładanie wiedzy na zrozumiałe treści i użyteczne narzędzia."
  },
  {
    "id": "wwf",
    "year": "2026",
    "label": "Współpraca z WWF",
    "date": "Od 2026 roku",
    "title": "Współpraca z WWF",
    "place": "Fundacja WWF Polska",
    "description": "Koordynacja regionalna, współpraca z wolontariuszami, działania terenowe na rzecz ochrony rzek i wsparcie merytoryczne.",
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
  const svg = river.querySelector('.career-waterway');
  const path = river.querySelector('#career-current-path');
  const waterPaths = Array.from(svg.querySelectorAll('.career-bank,.career-water,.career-flow'));
  const desktopPath = path.getAttribute('d');
  const desktop = window.matchMedia('(min-width: 1024px)');
  const disclosure = document.getElementById('mobile-career');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = null, leaveTimer, frame;
  function positionTooltip(point) {
    const bounds=canvas.getBoundingClientRect();
    const labelEdge=Math.max(...points.map(item=>item.getBoundingClientRect().right));
    const left=Math.min(labelEdge-bounds.left+12,window.innerWidth-bounds.left-tooltip.offsetWidth-16);
    const top=Math.max(0,Math.min(point.offsetTop-32,canvas.clientHeight-tooltip.offsetHeight));
    tooltip.style.left=left+'px';
    tooltip.style.top=top+'px';
    tooltip.style.setProperty('--career-arrow-top',Math.max(18,Math.min(point.offsetTop-top-6,tooltip.offsetHeight-26))+'px');
  }
  function drawRiver() {
    if (desktop.matches) {
      svg.setAttribute('viewBox','0 0 300 420');
      waterPaths.forEach(line=>line.setAttribute('d',desktopPath));
      points.forEach((point,index)=>{
        const position = path.getPointAtLength(path.getTotalLength()*((index+.5)/points.length));
        point.style.left = (position.x/300*100)+'%';
        point.style.top = (position.y/420*100)+'%';
      });
      if(active&&!tooltip.hidden)positionTooltip(points.find(point=>point.dataset.milestone===active));
    } else if (disclosure.open) {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      svg.setAttribute('viewBox','0 0 '+bounds.width+' '+bounds.height);
      const positions = points.map(point=>{
        const stone = point.querySelector('.career-stone').getBoundingClientRect();
        return {x:stone.left+stone.width/2-bounds.left,y:stone.top+stone.height/2-bounds.top};
      });
      let d = 'M'+positions[0].x+' 0L'+positions[0].x+' '+positions[0].y;
      positions.slice(1).forEach((position,index)=>{
        const before=positions[index], middle=(before.y+position.y)/2;
        d+='C'+before.x+' '+middle+' '+position.x+' '+middle+' '+position.x+' '+position.y;
      });
      d+='L'+positions[positions.length-1].x+' '+bounds.height;
      waterPaths.forEach(line=>line.setAttribute('d',d));
    }
  }
  function scheduleDraw() { cancelAnimationFrame(frame); frame=requestAnimationFrame(drawRiver); }
  function close() {
    clearTimeout(leaveTimer);
    tooltip.hidden = true;
    active = null;
    points.forEach(point=>{point.classList.remove('is-active');point.setAttribute('aria-expanded','false');});
    scheduleDraw();
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
    if(desktop.matches) canvas.append(tooltip);
    else point.parentElement.append(tooltip);
    tooltip.hidden = false;
    points.forEach(item=>{const current=item===point;item.classList.toggle('is-active',current);item.setAttribute('aria-expanded',String(current));});
    if (desktop.matches) {
      positionTooltip(point);
    } else {
      tooltip.style.removeProperty('top');
      tooltip.style.removeProperty('left');
      tooltip.style.removeProperty('--career-arrow-top');
    }
    if (changed && !reducedMotion.matches) tooltip.animate([{opacity:0,transform:desktop.matches?'translateX(-8px)':'translateY(-5px)'},{opacity:1,transform:'translate(0)'}],{duration:200,easing:'ease-out'});
    scheduleDraw();
  }
  points.forEach(point=>{
    point.addEventListener('pointerenter',event=>{if(desktop.matches&&event.pointerType!=='touch')show(point);});
    point.addEventListener('focus',()=>{if(desktop.matches)show(point);});
    point.addEventListener('click',()=>{if(!desktop.matches&&active===point.dataset.milestone)close();else show(point);});
    point.addEventListener('keydown',event=>{
      const index=points.indexOf(point); let next;
      if(event.key==='ArrowDown'||event.key==='ArrowRight') next=points[(index+1)%points.length];
      if(event.key==='ArrowUp'||event.key==='ArrowLeft') next=points[(index+points.length-1)%points.length];
      if(next){event.preventDefault();next.focus();if(!desktop.matches)show(next);}
    });
  });
  river.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  river.addEventListener('pointerleave',()=>{if(desktop.matches)leaveTimer=setTimeout(close,180);});
  river.addEventListener('focusout',event=>{if(desktop.matches&&!river.contains(event.relatedTarget))close();});
  function dismissWithFocus() { const point=points.find(item=>item.dataset.milestone===active);if(point)point.focus();close(); }
  river.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dismissWithFocus();}});
  tooltip.querySelector('.career-tooltip-close').addEventListener('click',dismissWithFocus);
  disclosure.addEventListener('toggle',()=>{if(!disclosure.open)close();scheduleDraw();});
  document.addEventListener('biorivus:layoutchange',()=>{close();canvas.append(tooltip);scheduleDraw();});
  new ResizeObserver(scheduleDraw).observe(canvas);
  new IntersectionObserver(entries=>river.classList.toggle('is-in-view',entries.some(entry=>entry.isIntersecting))).observe(river);
  scheduleDraw();
})();
