/* ═══════════════════════════════════════════════════════════════
   México Rojo · interacciones del artículo «plantas nativas»
   · barra de progreso de lectura
   · índice lateral con seguimiento de scroll
   · comparador antes / después
   · contador animado del 70 %
   · botones de copiar cita
   Requiere un contenedor con id="mrp" en la página.
   Si no lo encuentra, no hace nada.
   ═══════════════════════════════════════════════════════════════ */

function mrpInit(){
  var root = document.getElementById('mrp');
  if(!root || root.dataset.ready) return;
  root.dataset.ready = '1';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── barra de progreso + botón subir ── */
  var art = document.getElementById('mrpArt');
  var bar = document.getElementById('mrpBar');
  var top = document.getElementById('mrpTop');
  function onScroll(){
    var r = art.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var done  = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
    bar.style.width = (done*100).toFixed(2) + '%';
    top.classList.toggle('on', window.scrollY > 900);
    spy();
  }
  top.addEventListener('click', function(){
    window.scrollTo({ top: art.offsetTop - 40, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ── índice con seguimiento ── */
  var links = Array.prototype.slice.call(root.querySelectorAll('.toc a'));
  var heads = links.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
  function spy(){
    var best = 0;
    for(var i=0;i<heads.length;i++){
      if(heads[i] && heads[i].getBoundingClientRect().top < window.innerHeight*0.35) best = i;
    }
    links.forEach(function(a,i){ a.classList.toggle('on', i===best); });
  }
  links.forEach(function(a){
    a.addEventListener('click', function(e){
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if(!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70,
                        behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ── aparición al entrar en pantalla · sólo si el JS corre ── */
  if('IntersectionObserver' in window && !reduce){
    root.classList.add('jsr');
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    root.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
  } else {
    root.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
  }

  /* ── contador del 70 % ── */
  var stat = document.getElementById('mrpStat');
  var num  = document.getElementById('mrpNum');
  var gau  = document.getElementById('mrpGauge');
  function runStat(){
    if(reduce){ num.textContent = '70'; gau.style.width = '70%'; return; }
    num.textContent = '0'; gau.style.width = '0%';
    var t0 = null;
    function step(ts){
      if(!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1400);
      var e = 1 - Math.pow(1 - k, 3);
      num.textContent = Math.round(70 * e);
      if(k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function(){ gau.style.width = '70%'; }, 120);
  }
  if('IntersectionObserver' in window && stat){
    var io2 = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ runStat(); io2.disconnect(); } });
    }, {threshold:.45});
    io2.observe(stat);
  } else { runStat(); }

  /* ── comparador antes / después ── */
  var cmp = document.getElementById('mrpCmp');
  if(cmp){
    var after = cmp.querySelector('.after');
    var hnd   = cmp.querySelector('.hnd');
    var img   = after.querySelector('img');
    function sizeAfter(){ img.style.width = cmp.offsetWidth + 'px'; img.style.height = 'auto'; }
    function setPos(x){
      var r = cmp.getBoundingClientRect();
      var p = Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100));
      after.style.width = p + '%';
      hnd.style.left = p + '%';
    }
    var drag = false;
    cmp.addEventListener('pointerdown', function(e){ drag = true; cmp.setPointerCapture(e.pointerId); setPos(e.clientX); });
    cmp.addEventListener('pointermove', function(e){ if(drag) setPos(e.clientX); });
    cmp.addEventListener('pointerup',   function(){ drag = false; });
    cmp.addEventListener('pointercancel', function(){ drag = false; });
    window.addEventListener('resize', sizeAfter);
    if(img.complete) sizeAfter(); else img.addEventListener('load', sizeAfter);
    setTimeout(sizeAfter, 400);
  }

  /* ── copiar cita ── */
  root.addEventListener('click', function(e){
    var b = e.target.closest('.copy');
    if(!b) return;
    e.preventDefault();
    var txt = b.getAttribute('data-cite') || '';
    function done(){ var o = b.textContent; b.textContent = 'Copiada'; b.classList.add('ok');
                     setTimeout(function(){ b.textContent = o; b.classList.remove('ok'); }, 1800); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, function(){});
    } else {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); done(); }catch(err){}
      document.body.removeChild(ta);
    }
  });
}

/* arranque · sirve tanto si el script carga antes como después del HTML */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mrpInit);
} else {
  mrpInit();
}
