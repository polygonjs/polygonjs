// let el: HTMLDivElement | undefined;
// function _div() {
// 	return (el = el || document.createElement('div'));
// }
export class CoreUserAgent {
	// user agent on linux with chrome
	// "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
	// user agent on linux with firefox
	// "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0"
	private static _isChrome: boolean | undefined;
	static isChrome(): boolean {
		return (this._isChrome =
			this._isChrome ||
			(navigator && navigator.userAgent != null && navigator.userAgent.indexOf('Chrome') != -1));
	}
	private static _isMobile: boolean | undefined;
	static isMobile(): boolean {
		return (this._isMobile =
			this._isMobile ||
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
	}
	private static _isiOS: boolean | undefined;
	static isiOS(): boolean {
		return (this._isiOS = this._isiOS || /(iPad|iPhone|iPod)/g.test(navigator.userAgent));
	}
	private static _isAndroid: boolean | undefined;
	static isAndroid(): boolean {
		return (this._isAndroid = this._isAndroid || /(Android)/g.test(navigator.userAgent));
	}
	private static _isTouchDevice: boolean | undefined;
	static isTouchDevice(): boolean {
		// https://stackoverflow.com/questions/6262584/how-to-determine-if-the-client-is-a-touch-device
		// the following would not work on android
		// const el = _div();
		// el.setAttribute('ongesturestart', 'return;'); // or try "ontouchstart"
		// return typeof (el as any).ongesturestart === 'function';
		// but this does work on android
		return (this._isTouchDevice = this._isTouchDevice || document.documentElement.ontouchstart != null);
	}
}
