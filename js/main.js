// Sistema de temas e popup de sintaxe
const btnModo = document.getElementById('btnModo');
const btnTemas = document.getElementById('btnTemas');

let popupTemas;
let temaOverlay;
let fecharTemas;
let temaBtns;
let resetPosicao;
let titleBar;

let selectedTheme = 'claro';

function applyTheme(nome, save = true) {
  document.body.classList.remove('dark-mode', 'tema-pastel', 'tema-futurista', 'tema-terra');
  if (nome === 'escuro') document.body.classList.add('dark-mode');
  if (nome === 'pastel') document.body.classList.add('tema-pastel');
  if (nome === 'futurista') document.body.classList.add('tema-futurista');
  if (nome === 'terra') document.body.classList.add('tema-terra');
  selectedTheme = nome;
  if (btnModo) btnModo.textContent = nome === 'escuro' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
  if (save) {
    try { localStorage.setItem('theme', nome); } catch (e) { /* ignore */ }
  }
}

function carregarTema() {
  let salvo = null;
  try { salvo = localStorage.getItem('theme'); } catch (e) { salvo = null; }
  applyTheme(salvo || 'claro', false);
}

function abrirPopupTemas() {
  if (!popupTemas) return;
  popupTemas.classList.remove('hidden');
  temaOverlay.classList.remove('hidden');
  popupTemas.classList.add('active');
  temaOverlay.classList.add('active');
  restaurarPosicao();
}

function fecharPopupTemas() {
  if (!popupTemas) return;
  popupTemas.classList.remove('active');
  temaOverlay.classList.remove('active');
  popupTemas.classList.add('hidden');
  temaOverlay.classList.add('hidden');
}


function atualizarMiniaturas() {
  temaBtns.forEach(btn => {
    const tema = btn.dataset.tema;
    const mini = btn.querySelector('.miniatura');
    const dummy = document.createElement('div');
    if (tema === 'escuro') dummy.classList.add('dark-mode');
    else if (tema !== 'claro') dummy.classList.add(`tema-${tema}`);
    document.body.appendChild(dummy);
    const styles = getComputedStyle(dummy);
    mini.style.background = `linear-gradient(135deg, ${styles.getPropertyValue('--primary')}, ${styles.getPropertyValue('--secondary')})`;
    document.body.removeChild(dummy);
  });
}

function criarPopupTemas() {
  temaOverlay = document.createElement('div');
  temaOverlay.id = 'temaOverlay';
  temaOverlay.className = 'overlay hidden';

  popupTemas = document.createElement('div');
  popupTemas.id = 'popupTemas';
  popupTemas.className = 'popup-temas hidden';
  popupTemas.innerHTML = `
    <div class="title-bar">
      <span>🎨 Temas</span>
      <button id="fecharTemas" class="fechar-btn" data-tooltip="Fechar janela">X</button>
    </div>
    <div class="tema-opcoes">
      <button class="tema-btn" data-tema="claro" data-tooltip="Tema Claro"><span class="miniatura"></span> Claro</button>
      <button class="tema-btn" data-tema="escuro" data-tooltip="Tema Escuro"><span class="miniatura"></span> Escuro</button>
      <button class="tema-btn" data-tema="pastel" data-tooltip="Cores suaves e delicadas"><span class="miniatura"></span> Pastel</button>
      <button class="tema-btn" data-tema="futurista" data-tooltip="Tons escuros e neon"><span class="miniatura"></span> Futurista</button>
      <button class="tema-btn" data-tema="terra" data-tooltip="Cores terrosas e naturais"><span class="miniatura"></span> Terra</button>
    </div>
    <button id="resetPosicao" class="reset-posicao" data-tooltip="Voltar para o centro">🔄 Resetar Posição</button>
  `;

  document.body.appendChild(temaOverlay);
  document.body.appendChild(popupTemas);

  fecharTemas = document.getElementById('fecharTemas');
  temaBtns = popupTemas.querySelectorAll('.tema-btn');
  resetPosicao = document.getElementById('resetPosicao');
  titleBar = popupTemas.querySelector('.title-bar');
}

function initTemaPopup() {
  criarPopupTemas();
  carregarTema();
  atualizarMiniaturas();

  if (btnTemas) btnTemas.addEventListener('click', abrirPopupTemas);
  if (fecharTemas) fecharTemas.addEventListener('click', fecharPopupTemas);
  if (temaOverlay) temaOverlay.addEventListener('click', fecharPopupTemas);

  if (btnModo) {
    btnModo.addEventListener('click', () => {
      const novo = selectedTheme === 'escuro' ? 'claro' : 'escuro';
      applyTheme(novo);
    });
  }

  temaBtns.forEach(btn => {
    const tema = btn.dataset.tema;
    btn.addEventListener('mouseenter', () => applyTheme(tema, false));
    btn.addEventListener('mouseleave', () => applyTheme(selectedTheme, false));
    btn.addEventListener('click', () => {
      applyTheme(tema);
      fecharPopupTemas();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTemaPopup);
} else {
  initTemaPopup();
}

// Drag and drop da janela
let arrastando = false;
let offX = 0;
let offY = 0;

function restaurarPosicao() {
  let pos = null;
  try { pos = JSON.parse(localStorage.getItem('popupTemasPos') || 'null'); } catch (e) { pos = null; }
  if (pos) {
    popupTemas.style.left = pos.left;
    popupTemas.style.top = pos.top;
    popupTemas.style.transform = 'translate(0,0)';
  } else {
    popupTemas.style.left = '50%';
    popupTemas.style.top = '50%';
    popupTemas.style.transform = 'translate(-50%, -50%)';
  }
}

function iniciarDrag(e) {
  arrastando = true;
  offX = e.clientX - popupTemas.offsetLeft;
  offY = e.clientY - popupTemas.offsetTop;
  document.addEventListener('mousemove', moverDrag);
  document.addEventListener('mouseup', pararDrag);
}

function moverDrag(e) {
  if (!arrastando) return;
  popupTemas.style.left = `${e.clientX - offX}px`;
  popupTemas.style.top = `${e.clientY - offY}px`;
  popupTemas.style.transform = 'translate(0,0)';
}

function pararDrag() {
  if (!arrastando) return;
  arrastando = false;
  document.removeEventListener('mousemove', moverDrag);
  document.removeEventListener('mouseup', pararDrag);
  try {
    localStorage.setItem('popupTemasPos', JSON.stringify({ left: popupTemas.style.left, top: popupTemas.style.top }));
  } catch (e) {
    /* ignore */
  }
}

if (titleBar) titleBar.addEventListener('mousedown', iniciarDrag);

if (resetPosicao) {
  resetPosicao.addEventListener('click', () => {
    try { localStorage.removeItem('popupTemasPos'); } catch (e) { /* ignore */ }
    restaurarPosicao();
  });
}

// Popup de sintaxe existente
const btnSintaxe = document.getElementById('btnSintaxe');
if (btnSintaxe) {
  btnSintaxe.addEventListener('click', () => {
    document.getElementById('popupSintaxe').classList.remove('hidden');
    document.getElementById('filtroSintaxe').value = 'todos';
    filtrarSintaxe();
  });
}

function fecharPopup() {
  document.getElementById('popupSintaxe').classList.add('hidden');
}

function filtrarSintaxe() {
  const filtro = document.getElementById('filtroSintaxe').value.trim().toLowerCase();
  const itens = document.querySelectorAll('#listaSintaxe li');
  itens.forEach((item) => {
    const tipo = item.getAttribute('data-tipo').toLowerCase();
    item.style.display = filtro === 'todos' || filtro === tipo ? 'list-item' : 'none';
  });
}

function interpretarCodigo() {
  document.getElementById('loading').classList.add('active');
  const codigo = document.getElementById('codigo').value;
  const modo = document.querySelector('input[name="modoResultado"]:checked').value;
  fetch('interpretador.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'codigo=' + encodeURIComponent(codigo) + '&modo=' + modo
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('codigoJava').textContent = data.java;
      document.getElementById('resultadoExecucao').textContent = data.resultado;
      document.getElementById('loading').classList.remove('active');
    })
    .catch(error => {
      document.getElementById('resultadoExecucao').textContent = 'Erro: ' + error;
      document.getElementById('loading').classList.remove('active');
    });
}
