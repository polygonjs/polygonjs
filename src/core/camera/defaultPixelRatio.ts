export function defaultPixelRatio() {
	// pixel ratio used to be set to:
	// - for mobile: 1
	// - for desktop: Math.max(2, window.devicePixelRatio)
	// using return CoreUserAgent.isMobile() ? 1 : Math.max(2, window.devicePixelRatio);
	// I've considerred keeping it simple and setting to window.devicePixelRatio for every device,
	// but the loss of resolution is noticeable on desktop.
	// so Math.max(2, window.devicePixelRatio) seems like a good compromise between
	// simplicity and result.
	// Any further customisation can be done with the rop/WebGLRenderer node
	return Math.max(2, window.devicePixelRatio);
}
