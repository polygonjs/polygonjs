import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector2} from 'three/src/math/Vector2';
import {Scene} from 'three/src/scenes/Scene';
import {NodeContext} from '../../../../poly/NodeContext';
import {SceneObjNode} from '../../Scene';
import {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {Poly} from '../../../../Poly';
import {
	WebGlRendererRopNode,
	DEFAULT_SHADOW_MAP_TYPE,
	DEFAULT_OUTPUT_ENCODING,
	DEFAULT_TONE_MAPPING,
} from '../../../../nodes/rop/WebGLRenderer';
import {Css2DRendererRopNode} from '../../../rop/Css2DRenderer';
import {Css3DRendererRopNode} from '../../../rop/Css3DRenderer';
import {RopType} from '../../../../poly/registers/nodes/Rop';

import {ParamConfig} from '../../../utils/params/ParamsConfig';
export function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		render = ParamConfig.FOLDER();

		set_scene = ParamConfig.BOOLEAN(0);
		scene = ParamConfig.OPERATOR_PATH('/scene1', {
			visible_if: {set_scene: 1},
			node_selection: {
				context: NodeContext.OBJ,
				types: [SceneObjNode.type()],
			},
		});

		set_renderer = ParamConfig.BOOLEAN(0);
		renderer = ParamConfig.OPERATOR_PATH('./renderers1/webgl_renderer1', {
			visible_if: {set_renderer: 1},
			node_selection: {
				context: NodeContext.ROP,
				types: [WebGlRendererRopNode.type()],
			},
		});

		set_css_renderer = ParamConfig.BOOLEAN(0);
		css_renderer = ParamConfig.OPERATOR_PATH('./renderers1/css2d_renderer1', {
			visible_if: {set_css_renderer: 1},
			node_selection: {
				context: NodeContext.ROP,
				types: [RopType.CSS2D, RopType.CSS3D],
			},
		});
	};
}

export class RenderController {
	private _renderers_by_canvas_id: Dictionary<WebGLRenderer> = {};
	private _resolution_by_canvas_id: Dictionary<Vector2> = {};
	private _resolved_scene: Scene | undefined;
	private _resolved_renderer_rop: WebGlRendererRopNode | undefined;
	private _resolved_css_renderer_rop: Css2DRendererRopNode | Css3DRendererRopNode | undefined;

	constructor(private node: BaseThreejsCameraObjNodeType) {}

	//
	//
	// render methods
	//
	//
	render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number) {
		if (this.node.pv.do_post_process) {
			this.node.post_process_controller.render(canvas, size);
		} else {
			this.render_with_renderer(canvas);
		}

		if (this._resolved_css_renderer_rop && this._resolved_scene && this.node.pv.set_css_renderer) {
			const css_renderer = this.css_renderer(canvas);
			if (css_renderer) {
				css_renderer.render(this._resolved_scene, this.node.object);
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
		this.update_css_renderer();
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
		if (this.node.pv.set_scene) {
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
			this._resolved_scene = this.node.scene.default_scene;
		}
	}

	//
	//
	// RENDERER
	//
	//
	private update_renderer() {
		if (this.node.pv.set_renderer) {
			const param = this.node.p.renderer;
			if (param.is_dirty) {
				param.find_target();
			}
			this._resolved_renderer_rop = param.found_node_with_context_and_type(NodeContext.ROP, RopType.WEBGL);
		} else {
			this._resolved_renderer_rop = undefined;
		}
	}
	private update_css_renderer() {
		if (this.node.pv.set_css_renderer) {
			const param = this.node.p.css_renderer;
			if (param.is_dirty) {
				param.find_target();
			}
			this._resolved_css_renderer_rop = param.found_node_with_context_and_type(NodeContext.ROP, [
				RopType.CSS2D,
				RopType.CSS3D,
			]);
		} else {
			if (this._resolved_css_renderer_rop) {
				// TODO: not yet sure how to remove it so that it can be easily added again
				// const renderer = this.css_renderer()
				// const dom
				// this._resolved_css_renderer_rop.remove_renderer_element(canvas);
			}
			this._resolved_css_renderer_rop = undefined;
		}
	}

	renderer(canvas: HTMLCanvasElement) {
		return this._renderers_by_canvas_id[canvas.id];
	}
	css_renderer(canvas: HTMLCanvasElement) {
		if (this._resolved_css_renderer_rop && this.node.pv.set_css_renderer) {
			return this._resolved_css_renderer_rop.renderer(canvas);
		}
	}

	create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer {
		const gl = Poly.instance().renderers_controller.rendering_context(canvas);

		let renderer: WebGLRenderer | undefined;
		if (this.node.pv.set_renderer) {
			this.update_renderer();
			if (this._resolved_renderer_rop) {
				renderer = this._resolved_renderer_rop.create_renderer(canvas, gl);
			}
		}
		if (!renderer) {
			renderer = new WebGLRenderer({
				canvas: canvas,
				antialias: true,
				alpha: true,
				context: gl,
			});
		}

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;

		renderer.physicallyCorrectLights = true;

		// // TODO: find a way to have those accessible via params
		renderer.toneMapping = DEFAULT_TONE_MAPPING;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = DEFAULT_OUTPUT_ENCODING;

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
		this.set_renderer_size(canvas, size);
		renderer.setPixelRatio(window.devicePixelRatio);

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
			renderer.setSize(size.x, size.y);
		}

		if (this._resolved_css_renderer_rop) {
			const css_renderer = this.css_renderer(canvas);
			if (css_renderer) {
				css_renderer.setSize(size.x, size.y);
			}
		}
	}
}
