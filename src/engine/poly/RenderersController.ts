import {
	WebGLRenderer,
	WebGLRendererParameters,
	WebGLRenderTarget,
	WebGLRenderTargetOptions,
	NoColorSpace,
	NoToneMapping,
} from 'three';
import type {AbstractRenderer} from '../viewers/Common';
import {WEBGL_RENDERER_DEFAULT_PARAMS} from '../../core/render/Common';

export interface WithPolyId {
	_polygonId?: number;
}
export interface WithContextId {
	_polygonjsContextId?: number;
}
export interface POLYAbstractRenderer extends AbstractRenderer, WithPolyId {}
export interface CanvasContext extends WebGLRenderingContext, WithContextId {}

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
	private _requireWebGL2: boolean = false;
	// private _resolves: Callback[] = [];
	private _webgl2_available: boolean | undefined;
	// private _env_maps: TextureByString = {};
	// private _next_env_map_id: number = 0;
	private _webGLContextByCanvas: Map<HTMLCanvasElement, WebGLRenderingContext> = new Map();
	private _defaultRendererByCanvas = new Map<HTMLCanvasElement, WebGLRenderer>();

	dispose() {
		this._webGLContextByCanvas.clear();
		this._defaultRendererByCanvas.forEach((renderer) => {
			renderer.dispose();
		});
		this._defaultRendererByCanvas.clear();
	}

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
		if (!this._requireWebGL2) {
			this._requireWebGL2 = true;
		}
	}
	webGL2Available(canvas?: HTMLCanvasElement) {
		if (this._webgl2_available === undefined) {
			this._webgl2_available = this._getWebGL2Available(canvas);
		}
		return this._webgl2_available;
	}
	private _getWebGL2Available(canvas?: HTMLCanvasElement) {
		canvas = canvas || document.createElement('canvas');
		return (window.WebGL2RenderingContext && canvas.getContext(WebGLContext.WEBGL2)) != null;
	}
	defaultWebGLRendererForCanvas(canvas: HTMLCanvasElement) {
		let renderer = this._defaultRendererByCanvas.get(canvas);
		if (!renderer) {
			const context = this.getRenderingContext(canvas)!;
			renderer = this.createWebGLRenderer({...WEBGL_RENDERER_DEFAULT_PARAMS, canvas, context});
			this._defaultRendererByCanvas.set(canvas, renderer);
		}
		return renderer;
	}
	// disposeWebGLRendererForCanvas(canvas: HTMLCanvasElement) {
	// 	const renderer = this._defaultRendererByCanvas.get(canvas);
	// 	if (renderer) {
	// 		renderer.dispose();
	// 		this._defaultRendererByCanvas.delete(canvas);
	// 	}
	// }

	createWebGLRenderer(params: WebGLRendererParameters) {
		const renderer = new WebGLRenderer(params);

		// renderer.debug.checkShaderErrors = true;
		// renderer.debug.onShaderError = (gl, program, glVertexShader, glFragmentShader) => {
		// 	console.log('onShaderError', {gl, program, glVertexShader, glFragmentShader});
		// 	console.log(gl.getShaderSource(glVertexShader));
		// 	console.log(gl.getShaderSource(glFragmentShader));
		// };

		this.assignIdToRenderer(renderer);

		this.printDebugMessage([`create renderer:`, params]);
		return renderer;
	}

	assignIdToRenderer(renderer: AbstractRenderer) {
		if ((renderer as POLYAbstractRenderer)._polygonId != null) {
			// we do not re-assign the id if there is already one
			return;
		}

		const nextId = (nextRendererId += 1);
		(renderer as POLYAbstractRenderer)._polygonId = nextId;
	}
	rendererId(renderer: AbstractRenderer) {
		const id = (renderer as POLYAbstractRenderer)._polygonId;

		if (id == null) {
			console.error('renderer has no _polygonId');
			return;
		}
		return id;
	}

	getRenderingContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
		let gl: WebGLRenderingContext | undefined = this._webGLContextByCanvas.get(canvas);
		if (gl) {
			return gl;
		}
		// if (this._require_webgl2) {
		gl = this._getRenderingContextWebgl(canvas, true);
		if (!gl) {
			console.warn('failed to create webgl2 context');
		}
		// }
		if (!gl) {
			gl = this._getRenderingContextWebgl(canvas, false);
		}

		if (!gl) {
			console.error('failed to create webgl context');
			return null;
		}

		if ((gl as CanvasContext)._polygonjsContextId == null) {
			(gl as CanvasContext)._polygonjsContextId = RenderersController._nextGlContextId++;
		}
		this._webGLContextByCanvas.set(canvas, gl);

		// gl.getExtension('OES_standard_derivatives') // for derivative normals, but it cannot work at the moment (see node Gl/DerivativeNormals)
		// to test data texture
		// gl.getExtension('OES_texture_float')
		// gl.getExtension('OES_texture_float_linear')

		return gl;
	}
	private _getRenderingContextWebgl(canvas: HTMLCanvasElement, webgl2: boolean): WebGLRenderingContext | undefined {
		let contextName: WebGLContext;
		if (this.webGL2Available(canvas)) {
			contextName = WebGLContext.WEBGL2;
		} else {
			contextName = webgl2 ? WebGLContext.WEBGL2 : WebGLContext.WEBGL;
		}
		let gl = canvas.getContext(contextName, CONTEXT_OPTIONS);
		if (gl) {
			this.printDebugMessage(`create gl context: ${contextName}.`);
		} else {
			contextName = webgl2 ? WebGLContext.EXPERIMENTAL_WEBGL2 : WebGLContext.EXPERIMENTAL_WEBGL;
			this.printDebugMessage(`create gl context: ${contextName}.`);
			gl = canvas.getContext(contextName, CONTEXT_OPTIONS);
		}

		return gl as WebGLRenderingContext | undefined;
	}

	createRenderTarget(width: number, height: number, parameters: WebGLRenderTargetOptions) {
		if (this.webGL2Available()) {
			const multiSampleRenderTarget = new WebGLRenderTarget(width, height, parameters);
			multiSampleRenderTarget.samples = 2;
			return multiSampleRenderTarget;
		} else {
			return new WebGLRenderTarget(width, height, parameters);
		}
	}

	/*
	 *
	 * Linear renderer, used for cop/builder, cop/render
	 *
	 */
	private _linearRenderer: WebGLRenderer | undefined;
	linearRenderer() {
		return (this._linearRenderer = this._linearRenderer || this._createLinearRenderer());
	}
	private _createLinearRenderer() {
		const canvas = document.createElement('canvas');
		const gl = this.getRenderingContext(canvas);
		if (!gl) {
			return;
		}
		const renderer = this.createWebGLRenderer({
			// antialias: true,
			// stencil: true,
			// depth: false,
			alpha: true,
			premultipliedAlpha: true,
			canvas,
			context: gl,
		});
		renderer.outputColorSpace = NoColorSpace;
		renderer.toneMapping = NoToneMapping;
		return renderer;
	}
}
