/* ============================================================
   A SAGA DE PETER PARKER — Lógica dos slides
   Cada linha está comentada explicando o que faz.
   ============================================================ */

(function () {                                                        // Cria uma função anônima e executa ela imediatamente (IIFE) — isso protege as variáveis daqui de vazarem para o escopo global da página
  'use strict';                                                       // Ativa o "modo estrito" do JavaScript: proíbe erros silenciosos, como usar variável sem declarar

  /* ---------- Captura dos elementos da página ---------- */

  const slides = Array.from(document.querySelectorAll('.slide'));     // Busca TODOS os elementos com a classe .slide e converte a lista em um array de verdade (para poder usar .map, .forEach etc.)
  const prevBtn = document.getElementById('prevBtn');                 // Guarda a referência do botão de "slide anterior" (a seta da esquerda)
  const nextBtn = document.getElementById('nextBtn');                 // Guarda a referência do botão de "próximo slide" (a seta da direita)
  const dotsNav = document.getElementById('dots');                    // Guarda a referência do container onde as bolinhas indicadoras serão criadas
  const startBtn = document.getElementById('startBtn');               // Guarda a referência do botão "Começar a Aventura" da capa
  const finaleBtn = document.getElementById('finaleBtn');             // Guarda a referência do botão "Estou pronta para o cinema!" do último slide

  /* ---------- Variáveis de estado ---------- */

  let current = 0;                                                    // Índice do slide que está visível agora (0 = primeiro slide, a capa)
  let isAnimating = false;                                            // Trava que impede trocar de slide no meio de uma animação (evita bugs de clique rápido)

  /* ---------- Criação das bolinhas indicadoras ---------- */

  const dots = slides.map((_, index) => {                             // Para cada slide existente, cria uma bolinha correspondente; o "_" ignora o slide em si, só o número (index) importa
    const dot = document.createElement('button');                     // Cria um elemento <button> novo na memória (ainda fora da página)
    dot.type = 'button';                                              // Define o tipo como "button" para ele não se comportar como botão de formulário
    dot.className = 'dots__dot';                                      // Aplica a classe CSS que dá o formato de bolinha
    dot.setAttribute('aria-label', 'Ir para o slide ' + (index + 1)); // Adiciona um rótulo acessível para leitores de tela ("Ir para o slide 1", "Ir para o slide 2"...)
    dot.addEventListener('click', () => goTo(index));                 // Quando a bolinha for clicada, chama goTo() pulando direto para o slide dela
    dotsNav.appendChild(dot);                                         // Insere a bolinha dentro do container de navegação na página
    return dot;                                                       // Devolve a bolinha para o array "dots", que guarda todas elas na ordem
  });                                                                 // Fim do loop de criação das bolinhas

  /* ---------- Controle de vídeo ----------
     Os iframes usam data-src: o vídeo só é carregado quando o
     slide fica ativo, e é descarregado ao sair (pausa garantida). */

  function loadVideos(slide) {                                        // Função que LIGA os vídeos de um slide
    slide.querySelectorAll('iframe[data-src]').forEach((frame) => {   // Procura dentro do slide todos os iframes que têm o atributo data-src (nosso "endereço guardado" do vídeo)
      if (!frame.src) frame.src = frame.dataset.src;                  // Se o iframe ainda não tem src (vídeo descarregado), copia o endereço do data-src — isso faz o YouTube carregar o vídeo agora
    });                                                               // Fim do loop pelos iframes
  }                                                                   // Fim da função loadVideos

  function unloadVideos(slide) {                                      // Função que DESLIGA os vídeos de um slide (garante que o som pare ao trocar de slide)
    slide.querySelectorAll('iframe[data-src]').forEach((frame) => {   // Procura os mesmos iframes de vídeo dentro do slide
      frame.removeAttribute('src');                                   // Remove o src do iframe — sem endereço, o player do YouTube é destruído e o vídeo para na hora
    });                                                               // Fim do loop pelos iframes
  }                                                                   // Fim da função unloadVideos

  /* ---------- Transição de slides ---------- */

  function goTo(index) {                                              // Função principal: leva a apresentação para o slide de número "index"
    if (isAnimating || index === current || index < 0 || index >= slides.length) { // Bloqueia a troca se: já há animação rodando, OU o destino é o slide atual, OU o destino não existe (antes do primeiro / depois do último)
      return;                                                         // Sai da função sem fazer nada em qualquer um desses casos
    }                                                                 // Fim da verificação de segurança

    const leaving = slides[current];                                  // Guarda o slide que está saindo de cena (o atual)
    const entering = slides[index];                                   // Guarda o slide que vai entrar em cena (o destino)
    const goingForward = index > current;                             // Descobre a direção: true se estamos avançando, false se estamos voltando

    isAnimating = true;                                               // Liga a trava de animação — nenhuma outra troca acontece até esta terminar

    leaving.classList.toggle('is-leaving-left', goingForward);        // Se estamos avançando, o slide atual ganha a classe que o faz sair pela ESQUERDA; se voltando, sai pela direita (comportamento padrão)
    leaving.classList.remove('is-active');                            // Remove a classe "ativo" do slide atual — o CSS faz ele desaparecer suavemente
    unloadVideos(leaving);                                            // Desliga qualquer vídeo que estava tocando no slide que saiu

    entering.classList.add('is-active');                              // Adiciona a classe "ativo" no slide destino — o CSS faz ele aparecer com a animação de entrada
    loadVideos(entering);                                             // Liga os vídeos do slide que acabou de entrar (se houver)

    current = index;                                                  // Atualiza a variável de estado: o slide destino agora é o atual
    updateControls();                                                 // Atualiza os botões e as bolinhas para refletirem a nova posição

    setTimeout(() => {                                                // Agenda um código para rodar daqui a 700 milissegundos (a mesma duração da transição no CSS)
      leaving.classList.remove('is-leaving-left');                    // Limpa a classe de direção do slide que saiu, deixando-o pronto para a próxima entrada
      isAnimating = false;                                            // Desliga a trava — novas trocas de slide já podem acontecer
    }, 700);                                                          // Os 700ms que o navegador espera antes de rodar o código acima
  }                                                                   // Fim da função goTo

  function next() {                                                   // Função de atalho para AVANÇAR
    goTo(current + 1);                                                // Chama goTo pedindo o slide seguinte ao atual
  }                                                                   // Fim da função next

  function prev() {                                                   // Função de atalho para VOLTAR
    goTo(current - 1);                                                // Chama goTo pedindo o slide anterior ao atual
  }                                                                   // Fim da função prev

  function updateControls() {                                         // Função que sincroniza a interface de navegação com o slide atual
    prevBtn.disabled = current === 0;                                 // Desabilita a seta esquerda quando estamos no primeiro slide (não dá para voltar)
    nextBtn.disabled = current === slides.length - 1;                 // Desabilita a seta direita quando estamos no último slide (não dá para avançar)
    dots.forEach((dot, index) => {                                    // Percorre todas as bolinhas indicadoras
      dot.classList.toggle('is-active', index === current);           // Acende (classe is-active) somente a bolinha do slide atual; apaga todas as outras
    });                                                               // Fim do loop pelas bolinhas
  }                                                                   // Fim da função updateControls

  /* ---------- Eventos (interações do usuário) ---------- */

  prevBtn.addEventListener('click', prev);                            // Clique na seta esquerda → volta um slide
  nextBtn.addEventListener('click', next);                            // Clique na seta direita → avança um slide

  document.addEventListener('keydown', (event) => {                   // Escuta QUALQUER tecla pressionada na página
    if (event.key === 'ArrowRight') next();                           // Se a tecla foi a seta direita do teclado, avança um slide
    if (event.key === 'ArrowLeft') prev();                            // Se a tecla foi a seta esquerda do teclado, volta um slide
  });                                                                 // Fim do ouvinte de teclado

  let touchStartX = 0;                                                // Variável que guarda a posição horizontal onde o dedo TOCOU a tela (para o swipe no celular)

  document.addEventListener('touchstart', (event) => {                // Escuta o momento em que o dedo encosta na tela
    touchStartX = event.changedTouches[0].clientX;                    // Salva a coordenada X (horizontal) do primeiro toque
  }, { passive: true });                                              // "passive: true" avisa o navegador que não vamos travar a rolagem — melhora a performance do toque

  document.addEventListener('touchend', (event) => {                  // Escuta o momento em que o dedo SOLTA a tela
    const deltaX = event.changedTouches[0].clientX - touchStartX;     // Calcula a distância horizontal percorrida: posição final menos posição inicial
    if (Math.abs(deltaX) < 60) return;                                // Se o movimento foi menor que 60 pixels, ignora (foi só um toque, não um arrastão)
    if (deltaX < 0) next();                                           // Arrastou para a ESQUERDA (delta negativo) → avança para o próximo slide
    else prev();                                                      // Arrastou para a DIREITA (delta positivo) → volta para o slide anterior
  }, { passive: true });                                              // Mesmo aviso de performance do touchstart

  startBtn.addEventListener('click', next);                           // Clique no botão "Começar a Aventura" da capa → vai para o primeiro filme

  finaleBtn.addEventListener('click', () => {                         // Clique no botão final "Estou pronta para o cinema!"
    finaleBtn.textContent = 'Te amo 3000! ❤️🕷️';                      // Troca o texto do botão pela surpresinha romântica
    finaleBtn.classList.remove('btn--pulse');                         // Remove a animação de pulsar — o botão "se aquieta" depois do clique
  });                                                                 // Fim do ouvinte do botão final

  /* ---------- Estado inicial (roda uma vez ao abrir a página) ---------- */

  updateControls();                                                   // Ajusta botões e bolinhas para o estado inicial (seta esquerda desabilitada, primeira bolinha acesa)
  loadVideos(slides[current]);                                        // Se o primeiro slide tiver vídeo, já carrega ele
})();                                                                 // Fecha e EXECUTA imediatamente a função anônima aberta na primeira linha
