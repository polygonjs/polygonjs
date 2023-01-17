const CONTEXT_MENU_DISABLER = (event: MouseEvent) => {
	event.preventDefault();
	return false;
};
export class CoreDomUtils {
	static disableContextMenu() {
		document.addEventListener('contextmenu', CONTEXT_MENU_DISABLER);
	}
	static reEstablishContextMenu() {
		document.removeEventListener('contextmenu', CONTEXT_MENU_DISABLER);
	}
	static isHTMLVideoElementLoaded(videoElement: HTMLVideoElement) {
		return videoElement.readyState === 4;
	}
	static isHTMLVideoPaused(videoElement: HTMLVideoElement) {
		return videoElement.paused;
	}
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
