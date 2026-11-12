
/* ========================================
   1. ELEMENTOS DO DOM
======================================== */

const display = document.querySelector("#display");
const teclas = document.querySelector(".teclas");

const listaHistorico =
  document.querySelector("#lista-historico");

const botaoLimparHistorico =
  document.querySelector("#limpar-historico");

const botaoTema =
  document.querySelector("#alternar-tema");
const expressao = document.querySelector("#expressao");

/* ========================================
   2. ESTADO DA CALCULADORA
======================================== */

let primeiroNumero = null;
let operador = null;
let novoNumero = false;

let historico = [];

/* ========================================
   3. FORMATAÇÃO DE NÚMEROS
======================================== */

function formatarNumero(numero) {
  if (!Number.isFinite(numero)) {
    return "Erro";
  }

  return String(Number(numero.toPrecision(12)));
}

/* ========================================
   4. ADICIONAR NÚMEROS
======================================== */

function adicionarNumero(numero) {
  if (display.value === "Erro") {
    limpar();
  }

  if (novoNumero) {
    display.value = numero === "." ? "0." : numero;
    novoNumero = false;
  } else {
    if (
      numero === "." &&
      display.value.includes(".")
    ) {
      return;
    }

    if (display.value === "0" && numero !== ".") {
      display.value = numero;
    } else {
      display.value += numero;
    }
  }

  if (operador === null) {
    expressao.textContent = "";
  } else {
    atualizarExpressao();
  }
}


/* ========================================
   5. ESCOLHER OPERADOR
======================================== */


function escolherOperador(op) {
  if (display.value === "Erro") return;

  if (operador !== null && novoNumero) {
    operador = op;
    atualizarExpressao();
    return;
  }

  if (operador !== null) {
    calcular();

    if (display.value === "Erro") return;
  }

  primeiroNumero = Number(display.value);
  operador = op;
  novoNumero = true;

  atualizarExpressao();
}


/* ========================================
   6. CALCULAR
======================================== */


function calcular() {
  if (
    operador === null ||
    primeiroNumero === null ||
    display.value === "Erro"
  ) {
    return;
  }

  const segundoNumero = Number(display.value);
  let resultado;

  switch (operador) {
    case "+":
      resultado = primeiroNumero + segundoNumero;
      break;

    case "-":
      resultado = primeiroNumero - segundoNumero;
      break;

    case "*":
      resultado = primeiroNumero * segundoNumero;
      break;

    case "/":
      resultado = segundoNumero === 0
        ? NaN
        : primeiroNumero / segundoNumero;
      break;

    default:
      return;
  }

  const resultadoFormatado = formatarNumero(resultado);

  expressao.textContent =
    `${primeiroNumero} ${obterSimbolo(operador)} ` +
    `${segundoNumero} =`;

  display.value = resultadoFormatado;

  if (Number.isFinite(resultado)) {
    salvarNoHistorico(
      primeiroNumero,
      operador,
      segundoNumero,
      Number(resultadoFormatado)
    );
  }

  primeiroNumero = null;
  operador = null;
  novoNumero = true;
}


/* ========================================
   7. LIMPAR CALCULADORA
======================================== */

function limpar() {
  display.value = "0";
  expressao.textContent = "";

  primeiroNumero = null;
  operador = null;
  novoNumero = false;
}

/* ========================================
   8. APAGAR ÚLTIMO DÍGITO
======================================== */

function apagar() {
  if (display.value === "Erro" || novoNumero) {
    display.value = "0";
    novoNumero = false;
  } else {
    display.value =
      display.value.slice(0, -1) || "0";
  }

  if (operador === null) {
    expressao.textContent = "";
  } else {
    atualizarExpressao();
  }
}

/* ========================================
   9. PORCENTAGEM
======================================== */

function calcularPorcentagem() {
  if (display.value === "Erro") return;

  const numero = Number(display.value);
  const resultado = numero / 100;

  display.value = formatarNumero(resultado);
  novoNumero = operador === null;

  if (operador === null) {
    expressao.textContent = `${numero}%`;
  } else {
    atualizarExpressao();
  }
}

/* ========================================
   10. EVENTOS DE CLIQUE
======================================== */

teclas.addEventListener("click", (evento) => {

  const botao = evento.target.closest("button");

  if (!botao) return;

  if (botao.dataset.numero !== undefined) {
    adicionarNumero(botao.dataset.numero);
  }

  else if (botao.dataset.operador) {
    escolherOperador(botao.dataset.operador);
  }

  else if (botao.dataset.acao === "igual") {
    calcular();
  }

  else if (botao.dataset.acao === "limpar") {
    limpar();
  }

  else if (botao.dataset.acao === "apagar") {
    apagar();
  }

  else if (botao.dataset.acao === "porcentagem") {
    calcularPorcentagem();
  }
});

/* ========================================
   11. IDENTIFICAR TECLAS
======================================== */

function encontrarBotao(tecla) {

  const mapa = {
    "Enter": '[data-acao="igual"]',
    "=": '[data-acao="igual"]',

    "Backspace": '[data-acao="apagar"]',
    "Escape": '[data-acao="limpar"]',

    "%": '[data-acao="porcentagem"]',

    ".": '[data-numero="."]',
    ",": '[data-numero="."]'
  };

  let seletor = mapa[tecla];

  // Números de 0 a 9
  if (!seletor && /^[0-9]$/.test(tecla)) {
    seletor = `[data-numero="${tecla}"]`;
  }

  // Operadores
  if (
    !seletor &&
    ["+", "-", "*", "/"].includes(tecla)
  ) {
    seletor = `[data-operador="${tecla}"]`;
  }

  return seletor
    ? document.querySelector(seletor)
    : null;
}

/* ========================================
   12. SUPORTE AO TECLADO FÍSICO
======================================== */

document.addEventListener("keydown", (evento) => {

  const tecla = evento.key;
  const botao = encontrarBotao(tecla);

  if (!botao) return;

  // Impede ações padrão das teclas usadas
  evento.preventDefault();

  // Evita repetição ao segurar uma tecla
  if (evento.repeat) return;

  // Efeito visual
  botao.classList.add("pressionado");

  // Números
  if (/^[0-9]$/.test(tecla)) {
    adicionarNumero(tecla);
  }

  // Decimais
  else if (tecla === "." || tecla === ",") {
    adicionarNumero(".");
  }

  // Operadores
  else if (["+", "-", "*", "/"].includes(tecla)) {
    escolherOperador(tecla);
  }

  // Resultado
  else if (tecla === "Enter" || tecla === "=") {
    calcular();
  }

  // Apagar
  else if (tecla === "Backspace") {
    apagar();
  }

  // Limpar
  else if (tecla === "Escape") {
    limpar();
  }

  // Porcentagem
  else if (tecla === "%") {
    calcularPorcentagem();
  }
});

/* ========================================
   13. REMOVER EFEITO VISUAL
======================================== */

document.addEventListener("keyup", (evento) => {

  const botao = encontrarBotao(evento.key);

  if (botao) {
    botao.classList.remove("pressionado");
  }
});

// Evita teclas visualmente presas ao perder foco
window.addEventListener("blur", () => {

  document
    .querySelectorAll(".pressionado")
    .forEach((botao) => {
      botao.classList.remove("pressionado");
    });
});

/* ========================================
   14. SALVAR HISTÓRICO
======================================== */

function salvarNoHistorico(
  primeiroNumero,
  operador,
  segundoNumero,
  resultado
) {

  const operacao = {
    primeiroNumero,
    operador,
    segundoNumero,
    resultado
  };

  historico.push(operacao);

  atualizarHistorico();
  armazenarHistorico();
}

/* ========================================
   15. ATUALIZAR HISTÓRICO NO DOM
======================================== */

function atualizarHistorico() {

  listaHistorico.innerHTML = "";

  const simbolos = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
  };

  // Operações mais recentes primeiro
  [...historico].reverse().forEach((operacao) => {

    const item = document.createElement("li");

    item.textContent =
      `${operacao.primeiroNumero} ` +
      `${simbolos[operacao.operador]} ` +
      `${operacao.segundoNumero} = ` +
      `${operacao.resultado}`;

    listaHistorico.appendChild(item);
  });
}

/* ========================================
   16. LOCALSTORAGE - HISTÓRICO
======================================== */

function armazenarHistorico() {

  localStorage.setItem(
    "historicoCalculadora",
    JSON.stringify(historico)
  );
}

function carregarHistorico() {

  try {
    const dados = localStorage.getItem(
      "historicoCalculadora"
    );

    if (dados) {
      const operacoes = JSON.parse(dados);

      historico = Array.isArray(operacoes)
        ? operacoes
        : [];
    }
  } catch (erro) {
    historico = [];
    console.error("Erro ao carregar histórico:", erro);
  }

  atualizarHistorico();
}

/* ========================================
   17. LIMPAR HISTÓRICO
======================================== */

botaoLimparHistorico.addEventListener("click", () => {

  historico = [];

  atualizarHistorico();
  armazenarHistorico();
});

/* ========================================
   18. TEMA CLARO E ESCURO
======================================== */

function atualizarIconeTema() {

  const temaClaro =
    document.body.classList.contains("tema-claro");

  botaoTema.textContent = temaClaro ? "🌙" : "☀️";

  botaoTema.setAttribute(
    "aria-label",
    temaClaro ? "Ativar tema escuro" : "Ativar tema claro"
  );
}

function carregarTema() {

  const temaSalvo = localStorage.getItem("tema");

  if (temaSalvo === "claro") {
    document.body.classList.add("tema-claro");
  }

  atualizarIconeTema();
}

botaoTema.addEventListener("click", () => {

  document.body.classList.toggle("tema-claro");

  const temaClaro =
    document.body.classList.contains("tema-claro");

  localStorage.setItem(
    "tema",
    temaClaro ? "claro" : "escuro"
  );

  atualizarIconeTema();
});

/* ========================================
   19. INICIALIZAÇÃO
======================================== */

carregarHistorico();
carregarTema();



function obterSimbolo(op) {
  const simbolos = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
  };

  return simbolos[op] || op;
}

function atualizarExpressao() {
  if (operador === null || primeiroNumero === null) {
    return;
  }

  const simbolo = obterSimbolo(operador);

  if (novoNumero) {
    expressao.textContent =
      `${primeiroNumero} ${simbolo}`;
  } else {
    expressao.textContent =
      `${primeiroNumero} ${simbolo} ${display.value}`;
  }
}
