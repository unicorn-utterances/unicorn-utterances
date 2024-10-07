const remSlider = document.getElementById("rem-slider")
const remValue = document.getElementById("rem-value");
const headlineSlider = document.getElementById("h1-slider");
const headlineValue = document.getElementById("h1-value");
const headlineElement = document.getElementById("headline1");
const highlightSlider = document.getElementById("highlight-slider");
const highlightValue = document.getElementById("highlight-value");
const highlightElement = document.getElementById("highlight");
const modeSwitch = document.getElementById("modeButton");

const browserREM = parseInt(getComputedStyle(document.documentElement).fontSize);
let paddingMode = 'em';

remSlider.addEventListener('input', function() {
  updateFontSize();
});

headlineSlider.addEventListener('input', function() {
  updateFontSize();
});

highlightSlider.addEventListener('input', function() {
  updateFontSize();
});

modeSwitch.addEventListener('click', function() {
  if (paddingMode === 'em') {
    paddingMode = 'rem';
    modeButton.innerHTML = "Change to em"; 
  } else {
    paddingMode = 'em';
    modeButton.innerHTML = "Change to rem"; 
  }
  
  updateFontSize();
});

function updateFontSize() {
  remValue.textContent = remSlider.value;
  headlineValue.textContent = headlineSlider.value;
  headlineElement.style.fontSize = remSlider.value / browserREM * headlineSlider.value + 'rem';
  highlightValue.textContent = highlightSlider.value + paddingMode;
  highlightElement.style.padding = highlightSlider.value + paddingMode;
  highlightElement.style.borderRadius = highlightSlider.value + paddingMode;
}