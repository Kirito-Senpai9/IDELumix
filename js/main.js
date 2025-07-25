// Alterna o modo escuro/claro e atualiza elementos visuais
const btnModo = document.getElementById("btnModo");
if (btnModo) {
  btnModo.addEventListener("click", () => {
    const body = document.body;

    body.classList.toggle("dark-mode");
    const modoEscuroAtivo = body.classList.contains("dark-mode");

    btnModo.textContent = modoEscuroAtivo
      ? "☀️ Modo Claro"
      : "🌙 Modo Escuro";
  });
}

// Exibe o popup de sintaxe se o botão existir (apenas na IDE)
const btnSintaxe = document.getElementById("btnSintaxe");
if (btnSintaxe) {
  btnSintaxe.addEventListener("click", () => {
    document.getElementById("popupSintaxe").classList.remove("hidden");
    document.getElementById("filtroSintaxe").value = "todos";
    filtrarSintaxe(); // Garante que tudo aparece ao abrir
  });
}

// Fecha o popup
function fecharPopup() {
  document.getElementById("popupSintaxe").classList.add("hidden");
}

// Função para filtrar por tipo de sintaxe
function filtrarSintaxe() {
  const filtro = document
    .getElementById("filtroSintaxe")
    .value.trim()
    .toLowerCase();
  const itens = document.querySelectorAll("#listaSintaxe li");

  itens.forEach((item) => {
    const tipo = item.getAttribute("data-tipo").toLowerCase();
    if (filtro === "todos" || filtro === tipo) {
      item.style.display = "list-item";
    } else {
      item.style.display = "none";
    }
  });
}

// Interpreta o código enviado
function interpretarCodigo() {
  document.getElementById("loading").classList.add("active");

  const codigo = document.getElementById("codigo").value;
  const modo = document.querySelector('input[name="modoResultado"]:checked').value;

  fetch("interpretador.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "codigo=" + encodeURIComponent(codigo) + "&modo=" + modo
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById("codigoJava").textContent = data.java;
      document.getElementById("resultadoExecucao").textContent = data.resultado;
      document.getElementById("loading").classList.remove("active");
    })
    .catch(error => {
      document.getElementById("resultadoExecucao").textContent = "Erro: " + error;
      document.getElementById("loading").classList.remove("active");
    });
}
