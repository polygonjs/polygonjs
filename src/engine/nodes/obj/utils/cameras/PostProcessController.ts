import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
// import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ACESFilmicToneMapping, sRGBEncoding} from 'three/src/constants';
import {Vector2} from 'three/src/math/Vector2';

import lodash_range from 'lodash/range';
// import {BaseParam} from '../../../../params/_Base';
import {BooleanParam} from '../../../../params/Boolean';
import {OperatorPathParam} from '../../../../params/OperatorPath';
import {BasePostProcessNodeType} from '../../../post/_Base';
import {BaseCameraObjNodeType} from '../../_BaseCamera';
import {EffectComposer} from '../../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from '../../../../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {Pass} from '../../../../../../modules/three/examples/jsm/postprocessing/Pass';
import {NodeContext} from '../../../../poly/NodeContext';
import {Poly} from '../../../../Poly';

interface DisposablePass extends Pass {
	dispose: () => void;
}

function boolean_param_options(index: number) {
	return {
		visible_if: {
			do_post_process: 1,
		},
	};
}
function operator_path_param_options(index: number) {
	return {
		node_selection: {context: NodeContext.POST},
		visible_if: {
			do_post_process: 1,
			[`use_post_process_node${index}`]: 1,
		},
	};
}

import {ParamConfig} from '../../../utils/params/ParamsConfig';
export function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		post_process = ParamConfig.FOLDER();

		do_post_process = ParamConfig.BOOLEAN(0);
		use_post_process_node0 = ParamConfig.BOOLEAN(0, boolean_param_options(0));
		post_process_node0 = ParamConfig.OPERATOR_PATH('', operator_path_param_options(0));
		use_post_process_node1 = ParamConfig.BOOLEAN(0, boolean_param_options(1));
		post_process_node1 = ParamConfig.OPERATOR_PATH('', operator_path_param_options(1));
		use_post_process_node2 = ParamConfig.BOOLEAN(0, boolean_param_options(2));
		post_process_node2 = ParamConfig.OPERATOR_PATH('', operator_path_param_options(2));
		use_post_process_node3 = ParamConfig.BOOLEAN(0, boolean_param_options(3));
		post_process_node3 = ParamConfig.OPERATOR_PATH('', operator_path_param_options(3));
	};
}

export class PostProcessController {
	// private _param_do_post_process: boolean;
	// private _param_do_sao: boolean;
	private _renderers_by_canvas_id: Dictionary<WebGLRenderer> = {};
	private _composers_by_canvas_id: Dictionary<EffectComposer> = {};
	private _resolution_by_canvas_id: Dictionary<Vector2> = {};
	private _composers_set_in_progress_by_canvas_id: Dictionary<boolean> = {};
	private _fetch_post_process_nodes_in_progress: boolean = false;
	// private _render_passes: any[] = []
	private _post_process_nodes: BasePostProcessNodeType[] = [];

	private _post_process_use_node_path_params: BooleanParam[] = [];
	private _post_process_node_path_params: OperatorPathParam[] = [];

	constructor(private node: BaseCameraObjNodeType) {}

	// private _prev_t = 0;
	render(canvas: HTMLCanvasElement, size: Vector2, aspect: number) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			if (this.node.pv.do_post_process) {
				const composer = this.composer(canvas);
				if (composer) {
					composer.setSize(size.x, size.y);
					composer.render();
				}
			} else {
				this.node.setup_for_aspect_ratio(aspect);
				// const cur_t = performance.now();
				// const delta = cur_t - this._prev_t;
				// this._prev_t = cur_t;
				// console.log(cur_t, delta);
				renderer.render(this.node.scene.default_scene, this.node.object);
			}
		}
	}

	private renderer(canvas: HTMLCanvasElement) {
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
	set_renderer_size(canvas: HTMLCanvasElement, size: Vector2) {
		this._resolution_by_canvas_id[canvas.id] = this._resolution_by_canvas_id[canvas.id] || new Vector2();
		this._resolution_by_canvas_id[canvas.id].copy(size);

		const renderer = this.renderer(canvas);
		if (renderer) {
			renderer.setSize(size.x, size.y);
		}
		const composer = this.composer(canvas);
		if (composer) {
			composer.setSize(size.x, size.y);
		}
	}

	private composer(canvas: HTMLCanvasElement): EffectComposer {
		return (this._composers_by_canvas_id[canvas.id] =
			this._composers_by_canvas_id[canvas.id] || this._create_composer(canvas));
	}

	private _create_composer(canvas: HTMLCanvasElement) {
		const renderer = this.renderer(canvas);
		if (renderer) {
			// const parameters = {
			// 	minFilter: LinearFilter,
			// 	magFilter: LinearFilter,
			// 	format: RGBAFormat,
			// 	stencilBuffer: true
			// }
			// const renderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );
			const composer = new EffectComposer(renderer); //, renderTarget );
			// to achieve better antialiasing
			// while using post:
			// composer.setPixelRatio( window.devicePixelRatio*2 )
			composer.setPixelRatio(window.devicePixelRatio * 2);
			this.set_composer_passes(canvas.id, composer, renderer);

			return composer;
		} /*else {
			console.warn(this._renderers_by_canvas_id)
			throw "failed to create composer, no renderer ready"
		}*/
	}

	async update_composer_passes() {
		if (this.node.pv.do_post_process) {
			this._post_process_nodes = [];
			if (this._fetch_post_process_nodes_in_progress) {
				return;
			}
			this._fetch_post_process_nodes_in_progress = true;

			if (this.composer_passes_nodes_changed()) {
				this._post_process_nodes = [];

				for (let i of lodash_range(4)) {
					const toggle_param = this._post_process_use_node_path_params[i];
					// const use_node = await toggle_param.eval_p()
					const use_node = toggle_param.value;
					if (use_node) {
						const param = this._post_process_node_path_params[i];
						const post_process_node = param.found_node() as BasePostProcessNodeType;
						if (post_process_node) {
							await post_process_node.request_container();
							// const render_pass = container.render_pass()
							// this._render_passes.push(render_pass)
							this._post_process_nodes.push(post_process_node);
						}
					}
				}

				this.set_composers_passes();
				// this._previous_post_process_nodes_paths = this.composer_passes_nodes_paths()
			}
			this._fetch_post_process_nodes_in_progress = false;
		} else {
			this._post_process_nodes = [];
		}
	}

	private set_composers_passes() {
		const ids = Object.keys(this._composers_by_canvas_id);

		for (let id of ids) {
			const composer = this._composers_by_canvas_id[id];
			const renderer = this._renderers_by_canvas_id[id];
			if (composer) {
				this.set_composer_passes(id, composer, renderer);
			}
		}
	}

	private set_composer_passes(id: string, composer: EffectComposer, renderer: WebGLRenderer) {
		const set_in_progress = this._composers_set_in_progress_by_canvas_id[id];
		if (set_in_progress) {
			return;
		}
		this._composers_set_in_progress_by_canvas_id[id] = true;

		this.clear_render_passes(composer);

		const render_scene_pass = new RenderPass(this.node.scene.default_scene, this.node.object);
		render_scene_pass.clearAlpha = 0;
		composer.addPass(render_scene_pass);

		for (let post_process_node of this._post_process_nodes) {
			post_process_node.apply_to_composer(
				composer,
				this.node.object,
				this._resolution_by_canvas_id[id],
				this.node
			);
		}
		delete this._composers_set_in_progress_by_canvas_id[id];
	}

	private clear_render_passes(composer: EffectComposer) {
		let render_pass: Pass | undefined;
		while ((render_pass = composer.passes.pop())) {
			if (render_pass) {
				const disposable_pass: DisposablePass = render_pass as DisposablePass;
				if (typeof disposable_pass.dispose === 'function') {
					try {
						disposable_pass.dispose();
					} catch (e) {
						console.warn(e);
					}
				}
			}
		}
		// this._render_passes = []
		composer.passes = [];
	}

	private composer_passes_nodes_changed(): boolean {
		return true;
		// I have to evaluate the nodes anyway, in case they changed
		// unless I can create a method that can store if one of those nodes are the ones that
		// made this current node dirty
	}

	// add_params() {
	// 	// this.node.within_param_folder('post_process', () => {
	// 	this.node.add_param(ParamType.BOOLEAN, 'do_post_process', 0);

	// 	lodash_range(4).forEach((i) => {
	// 		const toggle_param = this.node.add_param(ParamType.BOOLEAN, `use_post_process_node${i + 1}`, 0, {
	// 			visible_if: {do_post_process: 1},
	// 		});

	// 		if (toggle_param) {
	// 			const visible_options = {
	// 				do_post_process: 1,
	// 				[toggle_param.name]: 1,
	// 			};
	// 			const node_path_options = {
	// 				node_selection: {context: NodeContext.POST},
	// 				visible_if: visible_options,
	// 			};
	// 			const param = this.node.add_param(
	// 				ParamType.OPERATOR_PATH,
	// 				`post_process_node${i + 1}`,
	// 				'',
	// 				node_path_options
	// 			);
	// 			if (param) {
	// 				this._post_process_use_node_path_params.push(toggle_param);
	// 				this._post_process_node_path_params.push(param);
	// 			}
	// 		}
	// 	});
	// 	// });
	// }
}
