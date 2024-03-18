// let el: HTMLDivElement | undefined;
// function _div() {
// 	return (el = el || document.createElement('div'));
// }

export function isMobile(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
export function isIOS(): boolean {
	return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}
export function isAndroid(): boolean {
	return /(Android)/g.test(navigator.userAgent);
}
export function isTouchDevice(): boolean {
	return (
		isMobile() ||
		isIOS() ||
		isAndroid() ||
		'ontouchstart' in globalThis ||
		((globalThis as any).DocumentTouch != null && document instanceof (globalThis as any).DocumentTouch)
	);
}
export function isChrome(): boolean {
	return navigator && navigator.userAgent != null && navigator.userAgent.indexOf('Chrome') != -1;
}
export function isSafari(): boolean {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
export function isPortrait(): boolean {
	return globalThis.innerHeight > globalThis.innerWidth;
}
export function isLandscape(): boolean {
	return !isPortrait();
}
export function screenOrientation() {
	const windowOrientation = globalThis.orientation;
	if (windowOrientation != null) {
		return windowOrientation;
	}
	const screenAngle: number | undefined = globalThis?.screen?.orientation?.angle || 0;
	return screenAngle;
}

export class CoreUserAgent {
	// user agent on linux with chrome
	// "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
	// user agent on linux with firefox
	// "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0"
	private static _isChrome: boolean | undefined;
	static isChrome(): boolean {
		if (this._isChrome == null) {
			this._isChrome = isChrome();
		}
		return this._isChrome;
	}
	private static _isSafari: boolean | undefined;
	static isSafari(): boolean {
		if (this._isSafari == null) {
			this._isSafari = isSafari();
		}
		return this._isSafari;
	}
	private static _isMobile: boolean | undefined;
	static isMobile(): boolean {
		if (this._isMobile == null) {
			this._isMobile = isMobile();
		}
		return this._isMobile;
	}
	private static _isiOS: boolean | undefined;
	static isiOS(): boolean {
		if (this._isiOS == null) {
			this._isiOS = isIOS();
		}
		return this._isiOS;
	}
	private static _isAndroid: boolean | undefined;
	static isAndroid(): boolean {
		if (this._isAndroid == null) {
			this._isAndroid = isAndroid();
		}
		return this._isAndroid;
	}
	private static _isTouchDevice: boolean | undefined;
	static isTouchDevice(): boolean {
		// https://stackoverflow.com/questions/6262584/how-to-determine-if-the-client-is-a-touch-device
		// the following would not work on android
		// const el = _div();
		// el.setAttribute('ongesturestart', 'return;'); // or try "ontouchstart"
		// return typeof (el as any).ongesturestart === 'function';
		// but this does work on android
		// return (this._isTouchDevice = this._isTouchDevice || document.documentElement.ontouchstart != null);
		// update:
		if (this._isTouchDevice == null) {
			this._isTouchDevice = isTouchDevice();
		}
		return this._isTouchDevice;
	}
	static isPortrait = isPortrait;
	static isLandscape = isLandscape;
	static screenOrientation = screenOrientation;
}
