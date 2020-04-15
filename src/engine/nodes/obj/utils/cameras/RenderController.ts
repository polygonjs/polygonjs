import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {
	ACESFilmicToneMapping,
	sRGBEncoding,
	// shadow map
	BasicShadowMap,
	PCFShadowMap,
	PCFSoftShadowMap,
	VSMShadowMap,
} from 'three/src/constants';
import {Vector2} from 'three/src/math/Vector2';
import {Scene} from 'three/src/scenes/Scene';

import {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {Poly} from '../../../../Poly';

import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {NodeContext} from '../../../../poly/NodeContext';
import {SceneObjNode} from '../../Scene';
export function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		render = ParamConfig.FOLDER();

		use_custom_scene = ParamConfig.BOOLEAN(0);
		scene = ParamConfig.OPERATOR_PATH('/scene1', {
			visible_if: {use_custom_scene: 1},
			node_selection: {
				context: NodeContext.OBJ,
				type: SceneObjNode.type(),
			},
			// callback: (node: BaseNodeType, param: BaseParamType) => {
			// 	BaseCameraObjNodeClass.PARAM_CALLBACK_reload(node as FileSopNode);
			// },
		});
	};
}

const SHADOW_MAP_TYPES = [BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap];
const DEFAULT_SHADOW_MAP_TYPE = SHADOW_MAP_TYPES[2];

export class RenderController {
	private _renderers_by_canvas_id: Dictionary<WebGLRenderer> = {};
	private _resolution_by_canvas_id: Dictionary<Vector2> = {};
	private _resolved_scene: Scene | undefined;

	constructor(private node: BaseThreejsCameraObjNodeType) {}

	// private _prev_t = 0;
	render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number) {
		if (this.node.pv.do_post_process) {
			this.node.post_process_controller.render(canvas, size);
		} else {
			const renderer = this.renderer(canvas);
			if (renderer) {
				if (this._resolved_scene) {
					renderer.render(this._resolved_scene, this.node.object);
				}
			}
		}
	}
	get resolved_scene() {
		return this._resolved_scene;
	}
	async update_scene() {
		if (this.node.pv.use_custom_scene) {
			console.warn('update_scene', this.node.full_path());
			const param = this.node.p.scene;
			if (param.is_dirty) {
				await param.compute();
			}
			const node = this.node.p.scene.found_node() as SceneObjNode;
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

	renderer(canvas: HTMLCanvasElement) {
		return this._renderers_by_canvas_id[canvas.id];
	}

	create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer {
		const gl = Poly.instance().renderers_controller.rendering_context(canvas);

		const renderer = new WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
			context: gl,
		});

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = DEFAULT_SHADOW_MAP_TYPE;

		renderer.physicallyCorrectLights = true; // https://discourse.threejs.org/t/three-js-white-is-too-bright/11873/3

		// TODO: find a way to have those accessible via params
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1;
		renderer.outputEncoding = sRGBEncoding;

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
	}
}
