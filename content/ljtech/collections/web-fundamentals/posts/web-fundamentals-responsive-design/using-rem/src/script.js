const remSlider = document.getElementById("rem-slider")
const remValue = document.getElementById("rem-value");
const h1Slider = document.getElementById("h1-slider");
const h1Value = document.getElementById("h1-value");
const headlineElement = document.getElementById("headline1");
const browserREM = parseInt(getComputedStyle(document.documentElement).fontSize);

remSlider.addEventListener('input', function() {
  updateFontSize();
});

h1Slider.addEventListener('input', function() {
  updateFontSize();
});

function updateFontSize() {
  headlineElement.style.fontSize = remSlider.value / browserREM * h1Slider.value + 'rem';
  remValue.textContent = remSlider.value;
  h1Value.textContent = h1Slider.value;
}