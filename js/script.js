/* ============================================================
   A SAGA DE PETER PARKER — Lógica dos slides
   - Transição entre slides (botões, teclado e indicadores)
   - Carregamento/pausa automática dos vídeos do YouTube
   ============================================================ */

(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsNav = document.getElementById('dots');
  const startBtn = document.getElementById('startBtn');
  const finaleBtn = document.getElementById('finaleBtn');

  let current = 0;
  let isAnimating = false;

  /* ---------- Indicadores (bolinhas) ---------- */

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dots__dot';
    dot.setAttribute('aria-label', 'Ir para o slide ' + (index + 1));
    dot.addEventListener('click', () => goTo(index));
    dotsNav.appendChild(dot);
    return dot;
  });

  /* ---------- Controle de vídeo ----------
     Os iframes usam data-src: o vídeo só é carregado quando o
     slide fica ativo, e é descarregado ao sair (pausa garantida). */

  function loadVideos(slide) {
    slide.querySelectorAll('iframe[data-src]').forEach((frame) => {
      if (!frame.src) frame.src = frame.dataset.src;
    });
  }

  function unloadVideos(slide) {
    slide.querySelectorAll('iframe[data-src]').forEach((frame) => {
      frame.removeAttribute('src');
    });
  }

  /* ---------- Transição de slides ---------- */

  function goTo(index) {
    if (isAnimating || index === current || index < 0 || index >= slides.length) {
      return;
    }

    const leaving = slides[current];
    const entering = slides[index];
    const goingForward = index > current;

    isAnimating = true;

    // Direção da saída: para trás quando avança, para frente quando volta
    leaving.classList.toggle('is-leaving-left', goingForward);
    leaving.classList.remove('is-active');
    unloadVideos(leaving);

    entering.classList.add('is-active');
    loadVideos(entering);

    current = index;
    updateControls();

    // Libera a próxima transição quando a animação CSS terminar
    setTimeout(() => {
      leaving.classList.remove('is-leaving-left');
      isAnimating = false;
    }, 700);
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function updateControls() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });
  }

  /* ---------- Eventos ---------- */

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Navegação pelas setas do teclado
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') prev();
  });

  // Suporte a swipe no celular
  let touchStartX = 0;

  document.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 60) return; // ignora toques curtos
    if (deltaX < 0) next();
    else prev();
  }, { passive: true });

  // Botão da capa: começa a aventura
  startBtn.addEventListener('click', next);

  // Botão final: comemoração simples 🎉
  finaleBtn.addEventListener('click', () => {
    finaleBtn.textContent = 'Te amo 3000! ❤️🕷️';
    finaleBtn.classList.remove('btn--pulse');
  });

  /* ---------- Estado inicial ---------- */

  updateControls();
  loadVideos(slides[current]);
})();
