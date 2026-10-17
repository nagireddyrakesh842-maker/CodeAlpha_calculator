
const screen = document.querySelector("#screen");
const history = document.querySelector("#history");
const keys = document.querySelector(".keys");

let currentInput = "0";
let previousInput = null;
let operator = null;
let shouldResetScreen = false;
let justCalculated = false;
let errorState = false;

function updateDisplay() {
  screen.textContent = currentInput;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    throw new Error("Invalid calculation");
  }

  if (Object.is(number, -0)) number = 0;

  // Keep floating-point results readable.
  return String(Number(number.toPrecision(12)));
}

function clearCalculator() {
  currentInput = "0";
  previousInput = null;
  operator = null;
  shouldResetScreen = false;
  justCalculated = false;
  errorState = false;

  history.textContent = "Ready to calculate";
  updateDisplay();
}

function enterDigit(digit) {
  if (errorState) clearCalculator();

  if (shouldResetScreen || justCalculated) {
    currentInput = digit;
    shouldResetScreen = false;
    justCalculated = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else if (currentInput.replace("-", "").length < 15) {
    currentInput += digit;
  }

  updateDisplay();
}

function enterDecimal() {
  if (errorState) clearCalculator();

  if (shouldResetScreen || justCalculated) {
    currentInput = "0.";
    shouldResetScreen = false;
    justCalculated = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (errorState) return;

  const currentNumber = Number(currentInput);

  // If an operator was already selected, calculate first.
  if (operator !== null && !shouldResetScreen) {
    const result = calculate(
      previousInput,
      currentNumber,
      operator
    );

    if (result === null) return;

    currentInput = formatNumber(result);
  }

  previousInput = Number(currentInput);
  operator = nextOperator;
  shouldResetScreen = true;
  justCalculated = false;

  history.textContent =
    `${currentInput} ${displayOperator(operator)}`;

  updateDisplay();
}

function calculate(a, b, op) {
  let result;

  switch (op) {
    case "+":
      result = a + b;
      break;

    case "-":
      result = a - b;
      break;

    case "*":
      result = a * b;
      break;

    case "/":
      if (b === 0) {
        showError("Cannot divide by zero");
        return null;
      }

      result = a / b;
      break;

    default:
      return b;
  }

  if (!Number.isFinite(result)) {
    showError("Result is out of range");
    return null;
  }

  return result;
}

function displayOperator(op) {
  return {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
  }[op] || op;
}

function showError(message) {
  currentInput = "Error";
  previousInput = null;
  operator = null;
  shouldResetScreen = true;
  justCalculated = false;
  errorState = true;

  history.textContent = message;
  updateDisplay();
}

function showResult() {
  if (errorState || operator === null ||
      previousInput === null) {
    return;
  }

  const a = previousInput;
  const b = Number(currentInput);
  const op = operator;
  const result = calculate(a, b, op);

  if (result === null) return;

  history.textContent =
    `${formatNumber(a)} ${displayOperator(op)} ${formatNumber(b)} =`;

  currentInput = formatNumber(result);
  previousInput = null;
  operator = null;
  shouldResetScreen = false;
  justCalculated = true;

  updateDisplay();
}

function deleteLastDigit() {
  if (errorState) {
    clearCalculator();
    return;
  }

  if (shouldResetScreen || justCalculated) {
    return;
  }

  currentInput = currentInput.length > 1
    ? currentInput.slice(0, -1)
    : "0";

  if (currentInput === "-") currentInput = "0";

  updateDisplay();
}

function changeSign() {
  if (errorState) return;

  if (Number(currentInput) !== 0) {
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
  }

  shouldResetScreen = false;
  justCalculated = false;
  updateDisplay();
}

function applyPercent() {
  if (errorState) return;

  currentInput = formatNumber(Number(currentInput) / 100);
  shouldResetScreen = false;
  justCalculated = false;
  updateDisplay();
}

function handleAction(action, value) {
  switch (action) {
    case "digit":
      enterDigit(value);
      break;

    case "decimal":
      enterDecimal();
      break;

    case "operator":
      chooseOperator(value);
      break;

    case "equals":
      showResult();
      break;

    case "clear":
      clearCalculator();
      break;

    case "delete":
      deleteLastDigit();
      break;

    case "sign":
      changeSign();
      break;

    case "percent":
      applyPercent();
      break;
  }
}

keys.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  handleAction(
    button.dataset.action,
    button.dataset.value
  );
});

// Keyboard support
document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    enterDigit(key);
  } else if (key === ".") {
    event.preventDefault();
    enterDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    showResult();
  } else if (key === "Backspace") {
    event.preventDefault();
    deleteLastDigit();
  } else if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    clearCalculator();
  } else if (key === "%") {
    event.preventDefault();
    applyPercent();
  }
});

clearCalculator();
