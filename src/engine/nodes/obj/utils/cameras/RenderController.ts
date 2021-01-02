import {Constructor, PolyDictionary} from '../../../../../types/GlobalTypes';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector2} from 'three/src/math/Vector2';
import {Scene} from 'three/src/scenes/Scene';
import {NodeContext} from '../../../../poly/NodeContext';
import {SceneObjNode} from '../../Scene';
import {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {Poly} from '../../../../Poly';
import {
	WebGlRendererRopNode,
	WebGLRendererWithSampling,
	DEFAULT_SHADOW_MAP_TYPE,
	DEFAULT_OUTPUT_ENCODING,
	DEFAULT_TONE_MAPPING,
} from '../../../rop/WebglRenderer';
import {Css2DRendererRopNode} from '../../../rop/Css2DRenderer';
import {Css3DRendererRopNode} from '../../../rop/Css3DRenderer';
import {RopType} from '../../../../poly/registers/nodes/Rop';

import {ParamConfig} from '../../../utils/params/ParamsConfig';
export function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		render = ParamConfig.FOLDER();

		setScene = ParamConfig.BOOLEAN(0);
		/** @param override rendered scene */
		scene = ParamConfig.OPERATOR_PATH('/scene1', {
			visibleIf: {setScene: 1},
			nodeSelection: {
				context: NodeContext.OBJ,
				types: [SceneObjNode.type()],
			},
		});

		setRenderer = ParamConfig.BOOLEAN(0);
		/** @param override renderer used */
		renderer = ParamConfig.OPERATOR_PATH('./renderers1/webGlRenderer1', {
			visibleIf: {setRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [WebGlRendererRopNode.type()],
			},
		});

		setCssRenderer = ParamConfig.BOOLEAN(0);
		/** @param add a css renderer */
		cssRenderer = ParamConfig.OPERATOR_PATH('./renderers1/css2DRenderer1', {
			visibleIf: {setCssRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [RopType.CSS2D, RopType.CSS3D],
			},
		});
	};
}

export class RenderController {
	private _renderers_by_canvas_id: PolyDictionary<WebGLRenderer> = {};
	private _resolution_by_canvas_id: PolyDictionary<Vector2> = {};
	private _resolved_scene: Scene | undefined;
	private _resolved_renderer_rop: WebGlRendererRopNode | undefined;
	private _resolved_cssRenderer_rop: Css2DRendererRopNode | Css3DRendererRopNode | undefined;

	constructor(private node: BaseThreejsCameraObjNodeType) {}

	//
	//
	// render methods
	//
	//
	render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number) {
		if (this.node.pv.doPostProcess) {
			this.node.post_process_controller.render(canvas, size);
		} else {
			this.render_with_renderer(canvas);
		}

		if (this._resolved_cssRenderer_rop && this._resolved_scene && this.node.pv.setCssRenderer) {
			const cssRenderer = this.cssRenderer(canvas);
			if (cssRenderer) {
				cssRenderer.render(this._resolved_scene, this.node.object);
			}
		}
	}
	render_with_renderer(canvas: HTMLCanvasElement) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			// renderer.autoClear = false;
			if (this._resolved_scene) {
				renderer.render(this._resolved_scene, this.node.object);
			}
		}
	}

	async update() {
		this.update_scene();
		this.update_renderer();
		this.update_cssRenderer();
	}

	//
	//
	// SCENE
	//
	//
	get resolved_scene() {
		return this._resolved_scene;
	}
	private update_scene() {
		if (this.node.pv.setScene) {
			const param = this.node.p.scene;
			if (param.is_dirty) {
				param.find_target();
			}
			const node = param.found_node_with_context_and_type(NodeContext.OBJ, SceneObjNode.type());
			if (node) {
				// it's probably weird to cook the node here, but that works for now
				if (node.is_dirty) {
					node.cook_controller.cook_main_without_inputs();
				}
				this._resolved_scene = node.object;
			}
		} else {
			this._resolved_scene = this.node.scene.defaultScene;
		}
	}

	//
	//
	// RENDERER
	//
	//
	private update_renderer() {
		if (this.node.pv.setRenderer) {
			const param = this.node.p.renderer;
			if (param.is_dirty) {
				param.find_target();
			}
			this._resolved_renderer_rop = param.found_node_with_context_and_type(NodeContext.ROP, RopType.WEBGL);
		} else {
			this._resolved_renderer_rop = undefined;
		}
	}
	private update_cssRenderer() {
		if (this.node.pv.setCssRenderer) {
			const param = this.node.p.cssRenderer;
			if (param.is_dirty) {
				param.find_target();
			}
			this._resolved_cssRenderer_rop = param.found_node_with_context_and_type(NodeContext.ROP, [
				RopType.CSS2D,
				RopType.CSS3D,
			]);
		} else {
			if (this._resolved_cssRenderer_rop) {
				// TODO: not yet sure how to remove it so that it can be easily added again
				// const renderer = this.cssRenderer()
				// const dom
				// this._resolved_cssRenderer_rop.remove_renderer_element(canvas);
			}
			this._resolved_cssRenderer_rop = undefined;
		}
	}

	renderer(canvas: HTMLCanvasElement) {
		return this._renderers_by_canvas_id[canvas.id];
	}
	cssRenderer(canvas: HTMLCanvasElement) {
		if (this._resolved_cssRenderer_rop && this.node.pv.setCssRenderer) {
			return this._resolved_cssRenderer_rop.renderer(canvas);
		}
	}

	private _super_sampling_size = new Vector2();
	create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer | undefined {
		const gl = Poly.instance().renderers_controller.rendering_context(canvas);
		if (!gl) {
			console.error('failed to create webgl context');
			return;
		}

		let renderer: WebGLRendererWithSampling | undefined;
		if (this.node.pv.setRenderer) {
			this.update_renderer();
			if (this._resolved_renderer_rop) {
				renderer = this._resolved_renderer_rop.create_renderer(canvas, gl);
			}
		}
		if (!renderer) {
			renderer = RenderController._create_default_renderer(canvas, gl);
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

		Poly.instance().renderers_controller.register_renderer(renderer);
		this._renderers_by_canvas_id[canvas.id] = renderer;
		this._super_sampling_size.copy(size);
		if (renderer.sampling) {
			this._super_sampling_size.multiplyScalar(renderer.sampling);
		}
		this.set_renderer_size(canvas, this._super_sampling_size);
		// remove devicePixelRatio for now, as this seems to double the size
		// of the canvas on high dpi screens
		// or if this is used, make sure to have the canvas at 100% width and height
		// renderer.setPixelRatio(window.devicePixelRatio);

		return renderer;
	}
	private static _create_default_renderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		const renderer = new WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
			context: gl,
		});
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;

		renderer.physicallyCorrectLights = true;

		// // TODO: find a way to have those accessible via params
		renderer.toneMapping = DEFAULT_TONE_MAPPING;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = DEFAULT_OUTPUT_ENCODING;
		return renderer;
	}

	delete_renderer(canvas: HTMLCanvasElement) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			Poly.instance().renderers_controller.deregister_renderer(renderer);
		}
	}
	canvas_resolution(canvas: HTMLCanvasElement) {
		return this._resolution_by_canvas_id[canvas.id];
	}
	set_renderer_size(canvas: HTMLCanvasElement, size: Vector2) {
		this._resolution_by_canvas_id[canvas.id] = this._resolution_by_canvas_id[canvas.id] || new Vector2();
		this._resolution_by_canvas_id[canvas.id].copy(size);

		const renderer = this.renderer(canvas);
		if (renderer) {
			const update_style = false;
			renderer.setSize(size.x, size.y, update_style);
		}

		if (this._resolved_cssRenderer_rop) {
			const cssRenderer = this.cssRenderer(canvas);
			if (cssRenderer) {
				cssRenderer.setSize(size.x, size.y);
			}
		}
	}
}
