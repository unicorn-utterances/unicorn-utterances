const fillButton = document.getElementById("fill-button");
const coverButton = document.getElementById("cover-button");
const containButton = document.getElementById("contain-button");
const noneButton = document.getElementById("none-button");
const scaleButton = document.getElementById("scale-button");

const fourByThree = document.getElementById("four-three");
const sixteenByNine = document.getElementById("sixteen-nine");
const oneByOne = document.getElementById("one-one");

const imgElement = document.getElementById("illustration");

let fitMode = 'cover';

fillButton.addEventListener("click", () => {
  imgElement.style.objectFit = 'fill';
});

coverButton.addEventListener("click", () => {
  imgElement.style.objectFit = "cover";
});

containButton.addEventListener("click", () => {
  imgElement.style.objectFit = "contain";
});

noneButton.addEventListener("click", () => {
  imgElement.style.objectFit = "none";
});

scaleButton.addEventListener("click", () => {
  imgElement.style.objectFit = "scale-down";
});

fourByThree.addEventListener("click", () => {
  imgElement.style.aspectRatio = 4 / 3;
});

sixteenByNine.addEventListener("click", () => {
  imgElement.style.aspectRatio = 16 / 9;
});

oneByOne.addEventListener("click", () => {
  imgElement.style.aspectRatio = 1;
});