// Temperature Converter — conversion logic + validation

const input = document.getElementById('tempInput');
const unitRadios = document.querySelectorAll('input[name="unit"]');
const convertBtn = document.getElementById('convertBtn');
const errorMsg = document.getElementById('errorMsg');
const outC = document.getElementById('outC');
const outF = document.getElementById('outF');
const outK = document.getElementById('outK');
const results = document.getElementById('results');
const thermoFill = document.getElementById('thermoFill');
const thermoBulb = document.getElementById('thermoBulb');

const ABSOLUTE_ZERO_C = -273.15;

function getSelectedUnit() {
  return document.querySelector('input[name="unit"]:checked').value;
}

function toCelsius(value, unit) {
  if (unit === 'C') return value;
  if (unit === 'F') return (value - 32) * (5 / 9);
  if (unit === 'K') return value - 273.15;
}

function fromCelsius(celsius) {
  return {
    C: celsius,
    F: celsius * (9 / 5) + 32,
    K: celsius + 273.15
  };
}

function formatValue(n) {
  return Math.round(n * 100) / 100;
}

function clearResults() {
  outC.textContent = '—';
  outF.textContent = '—';
  outK.textContent = '—';
  results.classList.remove('has-result');
  document.querySelectorAll('.result-row').forEach(function (row) {
    row.classList.remove('is-input-unit');
  });
}

function showError(message) {
  errorMsg.textContent = message;
  clearResults();
  setThermo(null);
}

function clearError() {
  errorMsg.textContent = '';
}

function setThermo(normalized) {
  // normalized: 0 (cold) to 1 (hot), or null to reset
  if (normalized === null) {
    thermoFill.style.height = '4%';
    thermoFill.style.background = 'var(--text-faint)';
    thermoBulb.style.background = 'var(--text-faint)';
    return;
  }
  const clamped = Math.max(0, Math.min(1, normalized));
  const hue = 210 - clamped * 210; // 210 = blue, 0 = red
  const color = 'hsl(' + hue + ', 82%, 55%)';
  thermoFill.style.height = (6 + clamped * 94) + '%';
  thermoFill.style.background = color;
  thermoBulb.style.background = color;
}

function convert() {
  clearError();

  const raw = input.value.trim();

  if (raw === '') {
    showError('Enter a temperature value.');
    return;
  }

  // Reject non-numeric input (allows leading minus and decimals only)
  const numericPattern = /^-?\d+(\.\d+)?$/;
  if (!numericPattern.test(raw)) {
    showError('That doesn\'t look like a number. Use digits only, e.g. -12 or 98.6.');
    return;
  }

  const value = parseFloat(raw);
  const unit = getSelectedUnit();
  const celsius = toCelsius(value, unit);

  if (celsius < ABSOLUTE_ZERO_C - 0.001) {
    showError('That\'s below absolute zero (-273.15°C) — no such temperature exists.');
    return;
  }

  const converted = fromCelsius(celsius);

  outC.textContent = formatValue(converted.C) + ' °C';
  outF.textContent = formatValue(converted.F) + ' °F';
  outK.textContent = formatValue(converted.K) + ' K';
  results.classList.add('has-result');

  document.querySelectorAll('.result-row').forEach(function (row) {
    row.classList.toggle('is-input-unit', row.dataset.unit === unit);
  });

  // Normalize for thermometer visual across a practical human-relevant range
  const normalized = (celsius - (-40)) / (60 - (-40));
  setThermo(normalized);
}

convertBtn.addEventListener('click', convert);

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') convert();
});

unitRadios.forEach(function (radio) {
  radio.addEventListener('change', function () {
    if (input.value.trim() !== '') convert();
  });
});

setThermo(null);