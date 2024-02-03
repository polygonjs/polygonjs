const CONTEXT_MENU_DISABLER = (event: MouseEvent) => {
	event.preventDefault();
	return false;
};

export function disableContextMenu() {
	document.addEventListener('contextmenu', CONTEXT_MENU_DISABLER);
}
export function enableContextMenu() {
	document.removeEventListener('contextmenu', CONTEXT_MENU_DISABLER);
}
export function isHTMLVideoElementLoaded(videoElement: HTMLVideoElement) {
	return videoElement.readyState === 4;
}
export function isHTMLVideoPaused(videoElement: HTMLVideoElement) {
	return videoElement.paused;
}

export function observeStyleChange(element: HTMLElement) {
	const Observe = (element: HTMLElement, opt: any, cb: any) => {
		const Obs = new MutationObserver((m) => [...m].forEach(cb));
		Obs.observe(element, opt);
	};
	Observe(
		element,
		{
			attributesList: ['style'], // Only the "style" attribute
			attributeOldValue: true, // Report also the oldValue
		},
		(m: any) => {
			console.log('m');
			console.warn(m); // Mutation object
		}
	);
}
