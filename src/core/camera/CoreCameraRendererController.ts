import {Camera, Vector2, WebGLRenderer, WebGLRendererParameters} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {Poly} from '../../engine/Poly';
import {
	DEFAULT_OUTPUT_ENCODING,
	DEFAULT_SHADOW_MAP_TYPE,
	DEFAULT_TONE_MAPPING,
} from '../../engine/nodes/rop/WebGLRenderer';
import type {WebGLRendererRopNode} from '../../engine/nodes/rop/WebGLRenderer';
import {defaultPixelRatio} from './defaultPixelRatio';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {RopType} from '../../engine/poly/registers/nodes/types/Rop';
import {NodeContext} from '../../engine/poly/NodeContext';

interface CreateRendererOptions {
	camera: Camera;
	scene: PolyScene;
	canvas: HTMLCanvasElement;
	// size: Vector2;
	// rendererROP?: WebGLRendererRopNode;
}

export class CoreCameraRendererController {
	// private static _resolutionByCanvas: Map<HTMLCanvasElement, Vector2> = new Map();
	private static _defaultRendererByContext: Map<WebGLRenderingContext, WebGLRenderer> = new Map();
	private static _renderersByCanvas: Map<HTMLCanvasElement, WebGLRenderer> = new Map();
	// private static _superSamplingSize = new Vector2();

	// static canvasResolution(canvas: HTMLCanvasElement) {
	// 	return this._resolutionByCanvasId.get(canvas.id);
	// }
	static renderer(canvas: HTMLCanvasElement) {
		return this._renderersByCanvas.get(canvas);
	}

	static createRenderer(options: CreateRendererOptions): WebGLRenderer | undefined {
		const {camera, canvas, scene} = options;
		const gl = Poly.renderersController.getRenderingContext(canvas);
		if (!gl) {
			console.error('failed to create webgl context');
			return;
		}

		let renderer: WebGLRenderer | undefined;
		// if (isBooleanTrue(this.node.pv.setRenderer)) {
		// await this._updateRenderer();

		const rendererROPPath = CoreObject.attribValue(camera, CameraAttribute.RENDERER_PATH);
		if (rendererROPPath && CoreType.isString(rendererROPPath)) {
			const rendererROP = scene.node(rendererROPPath);
			if (rendererROP && rendererROP.type() == RopType.WEBGL && rendererROP.context() == NodeContext.ROP) {
				renderer = (rendererROP as WebGLRendererRopNode).createRenderer(camera, canvas, gl);
			}
		}
		// }
		if (!renderer) {
			renderer = this._defaultRendererByContext.get(gl);
			if (!renderer) {
				renderer = CoreCameraRendererController.createDefaultRenderer(canvas, gl);
				this._defaultRendererByContext.set(gl, renderer);
			}
		}

		// https://github.com/mrdoob/js/issues/15493
		// This below is an attempt to fix env map not being loaded in firefox, but that doesn't work.
		// Since the threejs example (https://threejs.org/examples/?q=exr#webgl_materials_envmaps_exr) also only works in chrome, not in firefox, I assume this is a firefox+linux bug
		// console.log(renderer.extensions)
		// renderer.extensions.get( 'EXT_color_buffer_float' );

		// attempt to have particle systems work in firefox on mobile
		// (current solution is to have the node SOP/particlesSystemGPU force webgl2 to be used)
		// renderer.extensions.get( 'WEBGL_color_buffer_float' );
		// renderer.extensions.get( 'WEBGL_draw_buffers' );

		scene.renderersRegister.registerRenderer(renderer);
		this._renderersByCanvas.set(canvas, renderer);
		// this._superSamplingSize.copy(size);
		// this.setRendererSize(canvas, this._superSamplingSize);
		// remove devicePixelRatio for now, as this seems to double the size
		// of the canvas on high dpi screens
		// or if this is used, make sure to have the canvas at 100% width and height
		// renderer.setPixelRatio(window.devicePixelRatio);
		// UPDATE: favor using devicePixelRatio
		// to have nice subsampling feel, without needing antialias

		return renderer;
	}
	static setRendererSize(canvas: HTMLCanvasElement, size: Vector2) {
		// let currentRes = this._resolutionByCanvasId.get(canvas.id);
		// if (!currentRes) {
		// 	currentRes = new Vector2();
		// 	this._resolutionByCanvasId.set(canvas.id, currentRes);
		// }
		// currentRes.copy(size);

		const renderer = this.renderer(canvas);
		if (renderer) {
			const updateStyle = false;
			renderer.setSize(size.x, size.y, updateStyle);
		}

		// if (this._resolvedCSSRendererROP) {
		// 	const cssRenderer = this.cssRenderer(canvas);
		// 	if (cssRenderer) {
		// 		cssRenderer.setSize(size.x, size.y);
		// 	}
		// }
	}
	static createDefaultRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		const params: WebGLRendererParameters = {
			canvas: canvas,
			antialias: false, // no anti alias with a pixel ratio of 2 is more performant
			// alpha: true, // let's use threejs default alpha
			context: gl,
		};
		const renderer = Poly.renderersController.createWebGLRenderer(params);
		const pixelRatio = defaultPixelRatio();
		renderer.setPixelRatio(pixelRatio);

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;

		renderer.physicallyCorrectLights = true;

		// // TODO: find a way to have those accessible via params
		renderer.toneMapping = DEFAULT_TONE_MAPPING;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = DEFAULT_OUTPUT_ENCODING;

		if (Poly.renderersController.printDebug()) {
			Poly.renderersController.printDebugMessage('create default renderer');
			Poly.renderersController.printDebugMessage({
				params: params,
				pixelRatio: pixelRatio,
			});
		}

		return renderer;
	}
}
