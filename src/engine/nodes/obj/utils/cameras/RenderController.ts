import {Constructor} from '../../../../../types/GlobalTypes';
import {WebGLRenderer, WebGLRendererParameters} from 'three/src/renderers/WebGLRenderer';
import {Vector2} from 'three/src/math/Vector2';
import {Scene} from 'three/src/scenes/Scene';
import {NodeContext} from '../../../../poly/NodeContext';
import {SceneObjNode} from '../../Scene';
import {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {Poly} from '../../../../Poly';
import {
	WebGLRendererRopNode,
	DEFAULT_SHADOW_MAP_TYPE,
	DEFAULT_OUTPUT_ENCODING,
	DEFAULT_TONE_MAPPING,
} from '../../../rop/WebGLRenderer';
import {CSS2DRendererRopNode} from '../../../rop/CSS2DRenderer';
import {Css3DRendererRopNode} from '../../../rop/CSS3DRenderer';
import {RopType} from '../../../../poly/registers/nodes/types/Rop';

import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {CoreUserAgent} from '../../../../../core/UserAgent';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {Object3D} from 'three/src/core/Object3D';
export function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		render = ParamConfig.FOLDER();

		/** @param toggle on to override rendered scene */
		setScene = ParamConfig.BOOLEAN(0);
		/** @param override rendered scene */
		scene = ParamConfig.NODE_PATH('', {
			visibleIf: {setScene: 1},
			nodeSelection: {
				context: NodeContext.OBJ,
				types: [SceneObjNode.type()],
			},
		});

		/** @param toggle on to override the renderer */
		setRenderer = ParamConfig.BOOLEAN(0);
		/** @param override renderer used */
		renderer = ParamConfig.NODE_PATH('', {
			visibleIf: {setRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [WebGLRendererRopNode.type()],
			},
		});

		/** @param toggle on to add a CSSRenderer to have html elements on top of the 3D objects */
		setCSSRenderer = ParamConfig.BOOLEAN(0);
		/** @param add a css renderer */
		CSSRenderer = ParamConfig.NODE_PATH('', {
			visibleIf: {setCSSRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [RopType.CSS2D, RopType.CSS3D],
			},
		});
	};
}

export class RenderController {
	private _renderersByCanvasId: Map<string, WebGLRenderer> = new Map();
	private _resolutionByCanvasId: Map<string, Vector2> = new Map();
	private _resolvedScene: Scene | undefined;
	private _resolvedRendererROP: WebGLRendererRopNode | undefined;
	private _resolvedCSSRendererROP: CSS2DRendererRopNode | Css3DRendererRopNode | undefined;

	constructor(private node: BaseThreejsCameraObjNodeType) {}

	//
	//
	// render methods
	//
	//
	render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number, renderObjectOverride?: Object3D) {
		if (isBooleanTrue(this.node.pv.doPostProcess)) {
			this.node.postProcessController().render(canvas, size);
		} else {
			this.renderWithRenderer(canvas, renderObjectOverride);
		}

		if (this._resolvedCSSRendererROP && this._resolvedScene && isBooleanTrue(this.node.pv.setCSSRenderer)) {
			const cssRenderer = this.cssRenderer(canvas);
			if (cssRenderer) {
				cssRenderer.render(this._resolvedScene, this.node.object);
			}
		}
	}
	renderWithRenderer(canvas: HTMLCanvasElement, renderObjectOverride?: Object3D) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			// renderer.autoClear = false;

			const scene = /*renderObjectOverride ||*/ this._resolvedScene;
			if (scene) {
				renderer.render(scene, this.node.object);
			}
		}
	}
	preCompile(canvas: HTMLCanvasElement) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			const scene = /*renderObjectOverride ||*/ this._resolvedScene;
			if (scene) {
				renderer.compile(scene, this.node.object);
			}
		}
	}

	async update() {
		await this._updateScene();
		await this._updateRenderer();
		await this._updateCSSRenderer();
	}

	//
	//
	// SCENE
	//
	//
	resolvedScene() {
		return this._resolvedScene;
	}
	private async _updateScene() {
		if (isBooleanTrue(this.node.pv.setScene)) {
			const param = this.node.p.scene;
			if (param.isDirty()) {
				await param.compute();
			}
			const node = param.value.nodeWithContext(NodeContext.OBJ, this.node.states.error);
			if (node && node.type() == SceneObjNode.type()) {
				const sceneName = node as SceneObjNode;
				// it's probably weird to cook the node here, but that works for now
				if (sceneName.isDirty()) {
					sceneName.cookController.cookMainWithoutInputs();
				}
				this._resolvedScene = sceneName.object;
			}
		} else {
			this._resolvedScene = this.node.scene().threejsScene();
		}
	}

	//
	//
	// RENDERER
	//
	//
	private async _updateRenderer() {
		if (isBooleanTrue(this.node.pv.setRenderer)) {
			const param = this.node.p.renderer;
			if (param.isDirty()) {
				await param.compute();
			}
			const node = param.value.nodeWithContext(NodeContext.ROP, this.node.states.error);
			if (node && node.type() == WebGLRendererRopNode.type()) {
				this._resolvedRendererROP = node as WebGLRendererRopNode;
				return;
			}
		}
		this._resolvedRendererROP = undefined;
	}
	private async _updateCSSRenderer() {
		if (isBooleanTrue(this.node.pv.setCSSRenderer)) {
			const param = this.node.p.CSSRenderer;
			if (param.isDirty()) {
				await param.compute();
			}
			const node = param.value.nodeWithContext(NodeContext.ROP, this.node.states.error);
			const types = [RopType.CSS2D, RopType.CSS3D];
			if (node && (types as string[]).includes(node.type())) {
				this._resolvedCSSRendererROP = node as CSS2DRendererRopNode;
				return;
			}
		}
		if (this._resolvedCSSRendererROP) {
			// TODO: not yet sure how to remove it so that it can be easily added again
			// const renderer = this.cssRenderer()
			// const dom
			// this._resolved_cssRenderer_rop.remove_renderer_element(canvas);
		}
		this._resolvedCSSRendererROP = undefined;
	}

	renderer(canvas: HTMLCanvasElement) {
		return this._renderersByCanvasId.get(canvas.id);
	}
	renderersByCanvasId() {
		return this._renderersByCanvasId;
	}

	cssRenderer(canvas: HTMLCanvasElement) {
		if (this._resolvedCSSRendererROP && isBooleanTrue(this.node.pv.setCSSRenderer)) {
			return this._resolvedCSSRendererROP.renderer(canvas);
		}
	}

	private _super_sampling_size = new Vector2();
	async createRenderer(canvas: HTMLCanvasElement, size: Vector2): Promise<WebGLRenderer | undefined> {
		const gl = Poly.renderersController.getRenderingContext(canvas);
		if (!gl) {
			console.error('failed to create webgl context');
			return;
		}

		let renderer: WebGLRenderer | undefined;
		if (isBooleanTrue(this.node.pv.setRenderer)) {
			await this._updateRenderer();
			if (this._resolvedRendererROP) {
				renderer = this._resolvedRendererROP.createRenderer(this.node, canvas, gl);
			}
		}
		if (!renderer) {
			renderer = RenderController._createDefaultRenderer(canvas, gl);
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

		Poly.renderersController.registerRenderer(renderer);
		this._renderersByCanvasId.set(canvas.id, renderer);
		this._super_sampling_size.copy(size);
		this.setRendererSize(canvas, this._super_sampling_size);
		// remove devicePixelRatio for now, as this seems to double the size
		// of the canvas on high dpi screens
		// or if this is used, make sure to have the canvas at 100% width and height
		// renderer.setPixelRatio(window.devicePixelRatio);
		// UPDATE: favor using devicePixelRatio
		// to have nice subsampling feel, without needing antialias

		return renderer;
	}
	static defaultPixelRatio() {
		return CoreUserAgent.isMobile() ? 1 : Math.max(2, window.devicePixelRatio);
	}
	private static _createDefaultRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		const params: WebGLRendererParameters = {
			canvas: canvas,
			antialias: false, // no anti alias with a pixel ratio of 2 is more performant
			// alpha: true, // let's use threejs default alpha
			context: gl,
		};
		const renderer = Poly.renderersController.createWebGLRenderer(params);
		const pixelRatio = this.defaultPixelRatio();
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

	deleteRenderer(canvas: HTMLCanvasElement) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			Poly.renderersController.deregisterRenderer(renderer);
		}
	}
	canvasResolution(canvas: HTMLCanvasElement) {
		return this._resolutionByCanvasId.get(canvas.id);
	}
	setRendererSize(canvas: HTMLCanvasElement, size: Vector2) {
		let currentRes = this._resolutionByCanvasId.get(canvas.id);
		if (!currentRes) {
			currentRes = new Vector2();
			this._resolutionByCanvasId.set(canvas.id, currentRes);
		}
		currentRes.copy(size);

		const renderer = this.renderer(canvas);
		if (renderer) {
			const update_style = false;
			renderer.setSize(size.x, size.y, update_style);
		}

		if (this._resolvedCSSRendererROP) {
			const cssRenderer = this.cssRenderer(canvas);
			if (cssRenderer) {
				cssRenderer.setSize(size.x, size.y);
			}
		}
	}
}
