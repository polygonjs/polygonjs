import {WebGLRenderer, WebGLRendererParameters} from 'three';
import {WebGLRenderTarget, WebGLRenderTargetOptions} from 'three';
export interface POLYWebGLRenderer extends WebGLRenderer {
	_polygonId?: number;
}

const CONTEXT_OPTIONS: WebGLContextAttributes = {
	// powerPreference: 'high-performance', // attempt to fix issues in safari
	// antialias: false, // leave that to the renderer node
	// preserveDrawingBuffer: true, // this could only be useful to capture static images
};

enum WebGLContext {
	WEBGL = 'webgl',
	WEBGL2 = 'webgl2',
	EXPERIMENTAL_WEBGL = 'experimental-webgl',
	EXPERIMENTAL_WEBGL2 = 'experimental-webgl2',
}
let nextRendererId: number = 0;

export class RenderersController {
	private static _nextGlContextId = 0;
	// private _firstRenderer: WebGLRenderer | null = null;
	// private _lastRenderer: WebGLRenderer | null = null;
	private _printDebug = false;
	private _require_webgl2: boolean = false;
	// private _resolves: Callback[] = [];
	private _webgl2_available: boolean | undefined;
	// private _env_maps: TextureByString = {};
	// private _next_env_map_id: number = 0;

	setPrintDebug(state: boolean = true) {
		this._printDebug = state;
	}
	printDebug() {
		return this._printDebug;
	}
	printDebugMessage(message: any) {
		if (!this._printDebug) {
			return;
		}
		console.warn('[Poly debug]', message);
	}

	setRequireWebGL2() {
		if (!this._require_webgl2) {
			this._require_webgl2 = true;
		}
	}
	webGL2Available() {
		if (this._webgl2_available === undefined) {
			this._webgl2_available = this._setWebGL2Available();
		}
		return this._webgl2_available;
	}
	private _setWebGL2Available() {
		const canvas = document.createElement('canvas');
		return (window.WebGL2RenderingContext && canvas.getContext(WebGLContext.WEBGL2)) != null;
	}

	createWebGLRenderer(params: WebGLRendererParameters) {
		const renderer = new WebGLRenderer(params);

		this.assignIdToRenderer(renderer);

		this.printDebugMessage([`create renderer:`, params]);
		return renderer;
	}

	assignIdToRenderer(renderer: WebGLRenderer) {
		if ((renderer as POLYWebGLRenderer)._polygonId != null) {
			// we do not re-assign the id if there is already one
			return;
		}

		const nextId = (nextRendererId += 1);
		(renderer as POLYWebGLRenderer)._polygonId = nextId;
	}
	rendererId(renderer: WebGLRenderer) {
		const id = (renderer as POLYWebGLRenderer)._polygonId;

		if (id == null) {
			console.error('renderer has no _polygonId');
			return;
		}
		return id;
	}

	getRenderingContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
		let gl: WebGLRenderingContext | null = null;
		// if (this._require_webgl2) {
		gl = this._getRenderingContextWebgl(canvas, true);
		if (!gl) {
			console.warn('failed to create webgl2 context');
		}
		// }
		if (!gl) {
			gl = this._getRenderingContextWebgl(canvas, false);
		}

		if ((gl as any).contextId == null) {
			(gl as any).contextId = RenderersController._nextGlContextId++;
		}

		// gl.getExtension('OES_standard_derivatives') // for derivative normals, but it cannot work at the moment (see node Gl/DerivativeNormals)
		// to test data texture
		// gl.getExtension('OES_texture_float')
		// gl.getExtension('OES_texture_float_linear')

		return gl;
	}
	private _getRenderingContextWebgl(canvas: HTMLCanvasElement, webgl2: boolean): WebGLRenderingContext | null {
		let context_name: WebGLContext;
		if (this.webGL2Available()) {
			context_name = WebGLContext.WEBGL2;
		} else {
			context_name = webgl2 ? WebGLContext.WEBGL2 : WebGLContext.WEBGL;
		}
		let gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
		if (gl) {
			this.printDebugMessage(`create gl context: ${context_name}.`);
		} else {
			context_name = webgl2 ? WebGLContext.EXPERIMENTAL_WEBGL2 : WebGLContext.EXPERIMENTAL_WEBGL;
			this.printDebugMessage(`create gl context: ${context_name}.`);
			gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
		}
		return gl as WebGLRenderingContext | null;
	}

	// _registerRenderer(renderer: WebGLRenderer, scene: PolyScene) {
	// 	// if ((renderer as POLYWebGLRenderer)._polygonId) {
	// 	// 	throw new Error('render already registered');
	// 	// }

	// 	// this._renderers.set(nextId, renderer);

	// 	// if (this._renderers.size == 1) {
	// 	// 	this._flushCallbacksWithRenderer(renderer);
	// 	// }
	// 	this._updateCache();
	// }
	// _deregisterRenderer(renderer: WebGLRenderer) {
	// 	// const id = (renderer as POLYWebGLRenderer)._polygonId;
	// 	// this._renderers.delete(id);
	// 	// renderer.dispose();
	// 	this._updateCache();
	// }

	// private _updateCache() {
	// 	// this._firstRenderer = null;
	// 	// this._lastRenderer = null;
	// 	// this._renderers.forEach((renderer) => {
	// 	// 	this._firstRenderer = this._firstRenderer || renderer;
	// 	// 	this._lastRenderer = renderer;
	// 	// });
	// }
	// firstRenderer(): WebGLRenderer | null {
	// 	return this._firstRenderer;
	// }
	// lastRenderer(): WebGLRenderer | null {
	// 	return this._lastRenderer;
	// }
	// renderers(): WebGLRenderer[] {
	// 	return Object.values(this._renderers);
	// }

	// private _flushCallbacksWithRenderer(renderer: WebGLRenderer) {
	// 	const callbacks: Callback[] = [];
	// 	for (let r of this._resolves) {
	// 		callbacks.push(r);
	// 	}
	// 	this._resolves = [];
	// 	for (let c of callbacks) {
	// 		c(renderer);
	// 	}
	// }

	// async waitForRenderer(): Promise<WebGLRenderer | void> {
	// 	const lastScene = Poly.scenesRegister.lastRegisteredScene();
	// 	if (lastScene) {
	// 		return await lastScene.renderersRegister.waitForRenderer();
	// 	}
	// 	// const renderer = this.lastRenderer();
	// 	// if (renderer) {
	// 	// 	return renderer;
	// 	// } else {
	// 	// 	return new Promise((resolve, reject) => {
	// 	// 		this._resolves.push(resolve);
	// 	// 	});
	// 	// }
	// }

	renderTarget(width: number, height: number, parameters: WebGLRenderTargetOptions) {
		if (this.webGL2Available()) {
			const multiSampleRenderTarget = new WebGLRenderTarget(width, height, parameters);
			multiSampleRenderTarget.samples = 2;
			return multiSampleRenderTarget;
		} else {
			return new WebGLRenderTarget(width, height, parameters);
		}
	}
}
