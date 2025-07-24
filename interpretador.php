<?php
header("Content-Type: application/json");

function safe_eval($code) {
  try {
    return eval("return $code;");
  } catch (Throwable $t) {
    return "Erro ao avaliar expressão: " . $t->getMessage();
  }
}

$codigoOriginal = $_POST["codigo"];
$modo = $_POST["modo"] ?? "completo";
$linhas = explode("\n", $codigoOriginal);
$javaCode = "";
$resultadoCompleto = "";
$variaveis = [];

$emFuncao = false;
$blocoFuncao = "";
$nomeFuncao = "";
$funcoes = [];

$condicaoAtiva = null;
$ignorando = false;

foreach ($linhas as $linha) {
  $linha = trim($linha);
  if ($linha === "") continue;

  // Bloco de função
  if (preg_match("/^funcao (\w+)\(\)\$/", $linha, $m)) {
    $emFuncao = true;
    $nomeFuncao = $m[1];
    $blocoFuncao = "public static int {$nomeFuncao}() {\n";
    continue;
  }

  if ($linha === "fimfuncao") {
    $emFuncao = false;
    $blocoFuncao .= "}\n";
    $funcoes[$nomeFuncao] = $blocoFuncao;
    $javaCode .= $blocoFuncao;
    continue;
  }

  if ($emFuncao) {
    $blocoFuncao .= "  " . interpretar_linha($linha, $variaveis, $resultadoCompleto, true) . "\n";
    continue;
  }

  // Chamada de função
  if (preg_match("/^chamar (\w+)\(\)\$/", $linha, $m)) {
    $javaCode .= "{$m[1]}();\n";
    continue;
  }

  // Se
  if (preg_match("/^se (.+)\$/", $linha, $m)) {
    $javaCode .= "if ({$m[1]}) {\n";
    $condicao = $m[1];
    $condEval = $condicao;
    foreach ($variaveis as $k => $v) {
      $condEval = preg_replace('/\\b' . preg_quote($k, '/') . '\\b/', $v, $condEval);
    }
    $condResult = safe_eval($condEval);
    $condicaoAtiva = ($condResult) ? "se" : "senao";
    $ignorando = ($condicaoAtiva !== "se");
    continue;
  }

  // Senao
  if ($linha === "senao") {
    $javaCode .= "} else {\n";
    $ignorando = ($condicaoAtiva !== "senao");
    continue;
  }

  // FimSe
  if ($linha === "fimse") {
    $javaCode .= "}\n";
    $condicaoAtiva = null;
    $ignorando = false;
    continue;
  }

  // Outras linhas
  if (!$ignorando) {
    $javaCode .= interpretar_linha($linha, $variaveis, $resultadoCompleto, false) . "\n";
  }
}

$resultadoFinal = implode("\n", array_filter(explode("\n", $resultadoCompleto), function ($linha) {
  return !preg_match("/^\\[.*\\]\$/", trim($linha));
}));

echo json_encode([
  "java" => $javaCode,
  "resultado" => $modo === "final" ? $resultadoFinal : $resultadoCompleto
]);


function interpretar_linha($linha, &$variaveis, &$resultadoCompleto, $emFuncao = false) {
  if (preg_match("/^definir (\w+) = (\w+)\(\)\$/", $linha, $m)) {
    $variaveis[$m[1]] = "[retorno de função]";
    return "int {$m[1]} = {$m[2]}();";
  }

  if (preg_match("/^definir (\w+) = (\d+)\$/", $linha, $m)) {
    $variaveis[$m[1]] = (int)$m[2];
    return "int {$m[1]} = {$m[2]};";
  }

  elseif (preg_match("/^definir (\w+) = (\d+\.\d+)\$/", $linha, $m)) {
    $variaveis[$m[1]] = (float)$m[2];
    return "double {$m[1]} = {$m[2]};";
  }

  elseif (preg_match('/^definir (\w+) = \"(.*)\"\$/', $linha, $m)) {
    $variaveis[$m[1]] = $m[2];
    return "String {$m[1]} = \"{$m[2]}\";";
  }

  elseif (preg_match("/^mostrar (.+)\$/", $linha, $m)) {
    $expr = trim($m[1]);
    $javaLine = "System.out.println($expr);";

    if (preg_match('/^\"(.*)\"\$/', $expr, $t)) {
      $val = $t[1];
      $resultadoCompleto .= $val . "\n";
    } elseif (is_numeric($expr) || isset($variaveis[$expr])) {
      $val = isset($variaveis[$expr]) ? $variaveis[$expr] : $expr;
      $resultadoCompleto .= $val . "\n";
    } elseif (preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*\$/', $expr)) {
      $resultadoCompleto .= "[valor de $expr em tempo de execução]\n";
    } else {
      $eval = $expr;
      foreach ($variaveis as $k => $v) {
        $eval = preg_replace('/\\b' . preg_quote($k, '/') . '\\b/', $v, $eval);
      }
      $val = safe_eval($eval);
      $resultadoCompleto .= $val . "\n";
    }
    return $javaLine;
  }

  elseif (preg_match("/^incrementar (\w+)\$/", $linha, $m)) {
    if (isset($variaveis[$m[1]]) && is_numeric($variaveis[$m[1]])) {
      $variaveis[$m[1]]++;
    }
    return "{$m[1]}++;";
  }

  elseif (preg_match("/^decrementar (\w+)\$/", $linha, $m)) {
    if (isset($variaveis[$m[1]]) && is_numeric($variaveis[$m[1]])) {
      $variaveis[$m[1]]--;
    }
    return "{$m[1]}--;";
  }

  elseif (preg_match("/^enquanto (.+)\$/", $linha, $m)) {
    return "while ({$m[1]}) {";
  }

  elseif (preg_match("/^para (\w+) de (\d+) ate (\d+)\$/", $linha, $m)) {
    return "for (int {$m[1]} = {$m[2]}; {$m[1]} <= {$m[3]}; {$m[1]}++) {";
  }

  elseif (preg_match("/^retornar (.+)\$/", $linha, $m)) {
    return "return {$m[1]};";
  }

  elseif (preg_match("/^ler (\w+)\$/", $linha, $m)) {
    $variaveis[$m[1]] = "usuario";
    return "String {$m[1]} = \"usuario\";";
  }

  elseif (preg_match("/^esperar (\d+)\$/", $linha, $m)) {
    $ms = $m[1] * 1000;
    return "Thread.sleep({$ms});";
  }

  elseif (in_array($linha, ["fim", "fimenquanto", "fimpara"])) {
    return "}";
  }

  return "// Comando inválido";
}
?>
