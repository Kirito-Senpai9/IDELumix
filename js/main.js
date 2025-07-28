// Sistema de temas e popup de sintaxe
const btnModo = document.getElementById('btnModo');
const btnTemas = document.getElementById('btnTemas');
const popupTemas = document.getElementById('popupTemas');
const temaOverlay = document.getElementById('temaOverlay');
const fecharTemas = document.getElementById('fecharTemas');
const temaBtns = document.querySelectorAll('.tema-btn');
const resetPosicao = document.getElementById('resetPosicao');
const titleBar = popupTemas ? popupTemas.querySelector('.title-bar') : null;

let selectedTheme = 'claro';

function applyTheme(nome, save = true) {
  document.body.classList.remove('dark-mode', 'tema-pastel', 'tema-futurista', 'tema-terra');
  if (nome === 'escuro') document.body.classList.add('dark-mode');
  if (nome === 'pastel') document.body.classList.add('tema-pastel');
  if (nome === 'futurista') document.body.classList.add('tema-futurista');
  if (nome === 'terra') document.body.classList.add('tema-terra');
  selectedTheme = nome;
  if (btnModo) btnModo.textContent = nome === 'escuro' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
  if (save) localStorage.setItem('theme', nome);
}

function carregarTema() {
  const salvo = localStorage.getItem('theme');
  applyTheme(salvo || 'claro', false);
}

function abrirPopupTemas() {
  if (!popupTemas) return;
  popupTemas.classList.add('active');
  temaOverlay.classList.add('active');
  restaurarPosicao();
}

function fecharPopupTemas() {
  if (!popupTemas) return;
  popupTemas.classList.remove('active');
  temaOverlay.classList.remove('active');
}

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

document.addEventListener('DOMContentLoaded', () => {
  carregarTema();
  atualizarMiniaturas();
});

// Drag and drop da janela
let arrastando = false;
let offX = 0;
let offY = 0;

function restaurarPosicao() {
  const pos = JSON.parse(localStorage.getItem('popupTemasPos') || 'null');
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
  localStorage.setItem('popupTemasPos', JSON.stringify({ left: popupTemas.style.left, top: popupTemas.style.top }));
}

if (titleBar) titleBar.addEventListener('mousedown', iniciarDrag);

if (resetPosicao) {
  resetPosicao.addEventListener('click', () => {
    localStorage.removeItem('popupTemasPos');
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
