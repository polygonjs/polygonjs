const WEBXR_NOT_SUPPORTED_COLOR = `rgb(61 20 35 / 95%)`;

export function setErrorStyle(element: HTMLElement) {
	element.style.background = WEBXR_NOT_SUPPORTED_COLOR;
}

export function applyDefaultStyle(element: HTMLElement) {
	element.style.margin = '0px 6px';
	element.style.padding = '12px 6px';
	element.style.border = '1px solid #fff';
	element.style.borderRadius = '4px';
	element.style.color = '#fff';
	// element.style.font = 'normal 13px sans-serif';
	element.style.textAlign = 'center';
	element.style.opacity = '0.8';
	element.style.outline = 'none';
	element.style.zIndex = '999';
	element.style.whiteSpace = 'nowrap';
}

export function createInfoLink() {
	const message = document.createElement('a');

	if (globalThis.isSecureContext === false) {
		message.href = document.location.href.replace(/^http:/, 'https:');
		message.innerHTML = 'WEBXR NEEDS HTTPS';
	} else {
		message.href = 'https://immersiveweb.dev/';
		message.innerHTML = 'WEBXR NOT AVAILABLE';
	}

	message.style.left = 'calc(50% - 90px)';
	// message.style.width = '180px';
	message.style.textDecoration = 'none';
	return message;
}

export function disableButtonElement(button: HTMLElement) {
	button.style.display = '';

	button.style.cursor = 'auto';
	button.style.left = 'calc(50% - 75px)';
	// button.style.width = '150px';
	button.onmouseenter = null;
	button.onmouseleave = null;

	button.onclick = null;
}
