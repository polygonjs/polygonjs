import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
export class PassWithHooks {
	// if set to true, the pass is processed by the composer
	public enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	public needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	public clear = false;

	// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
	public renderToScreen = false;

	//
	public updatesRender = true;

	constructor() {}

	setSize(width: number, height: number) {}

	render(
		renderer: WebGLRenderer,
		writeBuffer: WebGLRenderTarget,
		readBuffer: WebGLRenderTarget,
		deltaTime: number,
		maskActive: boolean /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */
	) {
		console.error('THREE.Pass: .render() must be implemented in derived pass.');
	}
	onBeforeRender() {}
	onAfterRender() {}
}
