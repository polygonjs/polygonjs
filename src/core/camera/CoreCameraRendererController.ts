import {Camera, Vector2, WebGLRenderer, WebGLRendererParameters} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {Poly} from '../../engine/Poly';
import {
	DEFAULT_OUTPUT_COLOR_SPACE,
	DEFAULT_SHADOW_MAP_TYPE,
	DEFAULT_TONE_MAPPING,
} from '../../engine/nodes/rop/WebGLRenderer';
import {defaultPixelRatio} from '../render/defaultPixelRatio';
import {PowerPreference} from '../render/Common';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CoreType} from '../Type';
import {RopType} from '../../engine/poly/registers/nodes/types/Rop';
import {NodeContext} from '../../engine/poly/NodeContext';
import {TypedNode} from '../../engine/nodes/_Base';
import {AbstractRenderer} from '../../engine/viewers/Common';
import type {PathTracingRendererRopNode} from '../../engine/nodes/rop/PathTracingRenderer';
import type {WebGLRendererRopNode} from '../../engine/nodes/rop/WebGLRenderer';
// @ts-ignore
import type {PathTracingRenderer} from '../../core/thirdParty/three-gpu-pathtracer';
import {PathTracingRendererContainer} from '../../engine/nodes/rop/utils/pathTracing/PathTracingRendererContainer';

const UPDATE_STYLE = false;
const SIZE_MULT = 1;

export interface WebGLRendererWithTypes extends WebGLRenderer {
	useLegacyLights: boolean;
}
interface RendererRopOptions {
	camera: Camera;
	scene: PolyScene;
}
interface RendererConfigOptions {
	camera: Camera;
	scene: PolyScene;
	canvas: HTMLCanvasElement;
	// size: Vector2;
	// rendererROP?: WebGLRendererRopNode;
}
// type AvailableRopNode = WebGLRendererRopNode | PathTracingRendererRopNode;
// type AvailableRenderer = WebGLRenderer | PathTracingRenderer;

// export interface RendererConfig<A extends AvailableRenderer> {
// 	renderer: A;
// 	rendererNode?: AvailableRopNode;
// }
interface RendererConfigWebGL {
	renderer: WebGLRenderer;
	rendererNode?: WebGLRendererRopNode;
}
interface RendererConfigPathtracing {
	renderer: PathTracingRendererContainer;
	rendererNode?: PathTracingRendererRopNode;
}
export type AvailableRenderConfig = RendererConfigWebGL | RendererConfigPathtracing;

export class CoreCameraRendererController {
	// private static _resolutionByCanvas: Map<HTMLCanvasElement, Vector2> = new Map();
	private static _defaultRendererByContext: Map<WebGLRenderingContext, AbstractRenderer> = new Map();
	private static _renderersByCanvas: Map<HTMLCanvasElement, AbstractRenderer> = new Map();
	// private static _superSamplingSize = new Vector2();

	// static canvasResolution(canvas: HTMLCanvasElement) {
	// 	return this._resolutionByCanvasId.get(canvas.id);
	// }
	static renderer(canvas: HTMLCanvasElement) {
		return this._renderersByCanvas.get(canvas);
	}

	static rendererNode(options: RendererRopOptions) {
		const {scene, camera} = options;
		const rendererROPId = CoreObject.attribValue(camera, CameraAttribute.RENDERER_NODE_ID);
		if (rendererROPId && CoreType.isNumber(rendererROPId)) {
			const rendererROP = scene.graph.nodeFromId(rendererROPId);
			return rendererROP;
		}
	}

	static rendererConfig<A extends AvailableRenderConfig>(options: RendererConfigOptions): A | undefined {
		const {canvas, scene} = options;
		const gl = Poly.renderersController.getRenderingContext(canvas);
		if (!gl) {
			console.error('failed to create webgl context');
			return;
		}

		let renderer: A['renderer'] | undefined;
		let rendererNode: A['rendererNode'] | undefined;
		// if (isBooleanTrue(this.node.pv.setRenderer)) {
		// await this._updateRenderer();

		const rendererROP = this.rendererNode(options);
		if (rendererROP != null && rendererROP instanceof TypedNode && rendererROP.context() == NodeContext.ROP) {
			const type = rendererROP.type();
			switch (type) {
				case RopType.WEBGL: {
					renderer = (rendererROP as WebGLRendererRopNode).createRenderer(canvas, gl);
					rendererNode = rendererROP as WebGLRendererRopNode;
					break;
				}
				case RopType.PATH_TRACING: {
					renderer = (rendererROP as PathTracingRendererRopNode).createRenderer(canvas, gl);
					rendererNode = rendererROP as PathTracingRendererRopNode;
					break;
				}
			}
		}
		// }
		if (!renderer) {
			renderer = this._defaultRendererByContext.get(gl) as A['renderer'] | undefined;
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

		if (!renderer) {
			return;
		}
		const renderConfig: A = {
			renderer,
			rendererNode,
		} as A;
		return renderConfig;
	}
	static setRendererSize(canvas: HTMLCanvasElement, size: Vector2) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			renderer.setSize(SIZE_MULT * size.x, SIZE_MULT * size.y, UPDATE_STYLE);
		}
	}
	static createDefaultRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		const params: WebGLRendererParameters = {
			powerPreference: PowerPreference.HIGH,
			canvas: canvas,
			// no anti alias with a pixel ratio of 2 is more performant
			// but using a pixel ratio of 2 by default can also create hard to debug
			// inconsistencies when using post processing
			antialias: true, //defaultPixelRatio() < 2,
			// alpha: true, // let's use threejs default alpha
			context: gl,
		};
		const renderer = Poly.renderersController.createWebGLRenderer(params);
		const pixelRatio = defaultPixelRatio();
		renderer.setPixelRatio(pixelRatio);

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;

		(renderer as WebGLRendererWithTypes).useLegacyLights = false;

		// // TODO: find a way to have those accessible via params
		renderer.toneMapping = DEFAULT_TONE_MAPPING;
		renderer.toneMappingExposure = 1;
		renderer.outputColorSpace = DEFAULT_OUTPUT_COLOR_SPACE;

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
