function setViewportWidth() {
	const viewportWidth = window.innerWidth;
	const tooltipElement = document.getElementById("vw-tooltip");
	tooltipElement.textContent = "The current viewport is " + viewportWidth + "px wide.";
  }
  
  setViewportWidth();
  
  window.addEventListener("resize", setViewportWidth);