const WEBXR_NOT_SUPPORTED_COLOR = `rgb(61 20 35 / 95%)`;

export function setErrorStyle(element: HTMLElement) {
	element.style.background = WEBXR_NOT_SUPPORTED_COLOR;
}
