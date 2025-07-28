<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LUMIX IDE</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <!-- Barra de navegação -->
  <nav class="navbar">
    <a href="index.html" class="home-btn" aria-label="Página inicial"></a>
    <h1 class="nav-title">Lumix IDE</h1>
    <div class="botoes">
      <button id="btnSintaxe" data-tooltip="Exibir Sintaxe">📘 Sintaxe</button>
      <button id="btnModo" data-tooltip="Alternar Modo Claro/Escuro">🌙 Modo Escuro</button>
      <button id="btnTemas" data-tooltip="Alterar tema da IDE">🎨</button>
    </div>
  </nav>

  <!-- Área principal -->
  <main class="container">
    <h1>LUMIX IDE</h1>

    <label for="codigo">Digite seu código com a nova sintaxe:</label>
    <textarea id="codigo" placeholder="ex: definir x = 10"></textarea>

    <button onclick="interpretarCodigo()" data-tooltip="Executar código">▶️ Interpretar</button>
    <div id="loading">
      <div class="loader"></div>
      <p>Interpretando...</p>
    </div>

    <h2>Código Java Gerado:</h2>
    <pre id="codigoJava"></pre>

    <h2>Resultado da Execução:</h2>
    <fieldset class="modo-resultado">
      <legend>Modo de visualização do resultado</legend>
      <label><input type="radio" name="modoResultado" value="completo" checked /> Passo a Passo</label>
      <label><input type="radio" name="modoResultado" value="final" /> Resultado Final</label>
    </fieldset>
    <pre id="resultadoExecucao"></pre>
  </main>

  <!-- Janela de ajuda com sintaxe -->
  <div id="popupSintaxe" class="popup hidden">
    <h3>Sintaxe da Linguagem</h3>
    <div class="filtro-area">
      <label for="filtroSintaxe">Filtrar por:</label>
      <select id="filtroSintaxe" onchange="filtrarSintaxe()">
        <option value="todos">Todos</option>
        <option value="comandos">Comandos</option>
        <option value="simbolos">Símbolos</option>
      </select>
    </div>
    <div id="sintaxeConteudo">
      <ul id="listaSintaxe">
        <!-- Comandos -->
        <li data-tipo="comandos"><code>definir nome = "João"</code> — Cria uma variável String.</li>
        <li data-tipo="comandos"><code>definir idade = 25</code> — Cria uma variável inteira.</li>
        <li data-tipo="comandos"><code>definir altura = 1.75</code> — Cria uma variável decimal.</li>
        <li data-tipo="comandos"><code>mostrar "Olá"</code> — Exibe um texto.</li>
        <li data-tipo="comandos"><code>mostrar nome</code> — Exibe uma variável.</li>
        <li data-tipo="comandos"><code>ler nome</code> — Simula entrada de texto.</li>
        <li data-tipo="comandos"><code>incrementar idade</code> — Soma 1 à variável.</li>
        <li data-tipo="comandos"><code>decrementar idade</code> — Subtrai 1 da variável.</li>
        <li data-tipo="comandos"><code>se idade > 18</code> — Início de condicional.</li>
        <li data-tipo="comandos"><code>senao</code> — Alternativa ao if.</li>
        <li data-tipo="comandos"><code>fimse</code> — Fim da condicional.</li>
        <li data-tipo="comandos"><code>enquanto idade < 30</code> — Início de laço while.</li>
        <li data-tipo="comandos"><code>fimenquanto</code> — Fim do laço while.</li>
        <li data-tipo="comandos"><code>para i de 1 ate 5</code> — Laço for de 1 até 5.</li>
        <li data-tipo="comandos"><code>fimpara</code> — Fim do laço for.</li>
        <li data-tipo="comandos"><code>funcao somar()</code> — Declaração de função.</li>
        <li data-tipo="comandos"><code>retornar x + y</code> — Retorno de função.</li>
        <li data-tipo="comandos"><code>fimfuncao</code> — Fim da função.</li>
        <li data-tipo="comandos"><code>esperar 2</code> — Espera por 2 segundos.</li>
        <!-- Símbolos -->
        <li data-tipo="simbolos"><code>+</code> — Soma. Ex: <code>a + b</code></li>
        <li data-tipo="simbolos"><code>-</code> — Subtração. Ex: <code>a - b</code></li>
        <li data-tipo="simbolos"><code>*</code> — Multiplicação. Ex: <code>a * b</code></li>
        <li data-tipo="simbolos"><code>/</code> — Divisão. Ex: <code>a / b</code></li>
        <li data-tipo="simbolos"><code>%</code> — Módulo (resto). Ex: <code>a % b</code></li>
        <li data-tipo="simbolos"><code>&gt;</code> — Maior que. Ex: <code>a > b</code></li>
        <li data-tipo="simbolos"><code>&lt;</code> — Menor que. Ex: <code>a < b</code></li>
        <li data-tipo="simbolos"><code>&gt;=</code> — Maior ou igual. Ex: <code>a >= b</code></li>
        <li data-tipo="simbolos"><code>&lt;=</code> — Menor ou igual. Ex: <code>a <= b</code></li>
        <li data-tipo="simbolos"><code>==</code> — Igualdade. Ex: <code>a == b</code></li>
        <li data-tipo="simbolos"><code>!=</code> — Diferente. Ex: <code>a != b</code></li>
        <li data-tipo="simbolos"><code>&&</code> — E lógico. Ex: <code>cond1 && cond2</code></li>
        <li data-tipo="simbolos"><code>||</code> — Ou lógico. Ex: <code>cond1 || cond2</code></li>
        <li data-tipo="simbolos"><code>( )</code> — Agrupamento de expressões.</li>
        <li data-tipo="simbolos"><code>" "</code> — Delimita strings. Ex: <code>"Texto"</code></li>
      </ul>
    </div>
    <div class="popup-footer">
      <button onclick="fecharPopup()" data-tooltip="Fechar janela">Fechar</button>
    </div>
  </div>

  <div id="temaOverlay" class="overlay hidden"></div>
  <div id="popupTemas" class="popup-temas hidden">
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
  </div>

  <footer>
    Desenvolvido por equipe Lumix ©
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
