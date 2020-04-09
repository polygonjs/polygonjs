import {Vector2} from 'three/src/math/Vector2';

import {LinearFilter, RGBFormat} from 'three/src/constants';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';

import {BasePostProcessNodeType} from '../../../post/_Base';
import {BaseCameraObjNodeType} from '../../_BaseCamera';
import {EffectComposer} from '../../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {NodeContext} from '../../../../poly/NodeContext';

// interface DisposablePass extends Pass {
// 	dispose: () => void;
// }

import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {RenderPass} from '../../../../../../modules/three/examples/jsm/postprocessing/RenderPass';
export function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		do_post_process = ParamConfig.BOOLEAN(0);
		post_process_node = ParamConfig.OPERATOR_PATH('/POST/OUT', {
			visible_if: {
				do_post_process: 1,
			},
			node_selection: {
				context: NodeContext.POST,
			},
			cook: false,
		});
		prepend_render_pass = ParamConfig.BOOLEAN(1, {
			visible_if: {
				do_post_process: 1,
			},
		});
		use_render_target = ParamConfig.BOOLEAN(0, {
			visible_if: {
				do_post_process: 1,
			},
		});
	};
}

export class PostProcessController {
	private _composers_by_canvas_id: Dictionary<EffectComposer> = {};

	constructor(private node: BaseCameraObjNodeType) {
		if (this.node.p.post_process_node) {
			this._add_param_dirty_hook();
		} else {
			this.node.params.set_post_create_params_hook(() => {
				this._add_param_dirty_hook();
			});
		}
	}
	private _add_param_dirty_hook() {
		this.node.p.post_process_node.add_post_dirty_hook('on_post_node_dirty', () => {
			this._reset_composers();
		});
	}

	// private _prev_t = 0;
	render(canvas: HTMLCanvasElement, size?: Vector2) {
		const composer = this.composer(canvas);
		if (composer) {
			if (size) {
				composer.setSize(size.x, size.y);
			}
			if (this.node.pv.use_render_target) {
				const renderer = this.node.render_controller.renderer(canvas);
				renderer.clear();
			}
			composer.render();
		}
	}

	private _reset_composers() {
		const ids = Object.keys(this._composers_by_canvas_id);
		for (let id of ids) {
			delete this._composers_by_canvas_id[id];
		}
	}

	private composer(canvas: HTMLCanvasElement): EffectComposer {
		return (this._composers_by_canvas_id[canvas.id] =
			this._composers_by_canvas_id[canvas.id] || this._create_composer(canvas));
	}

	private _create_composer(canvas: HTMLCanvasElement) {
		const renderer = this.node.render_controller.renderer(canvas);
		if (renderer) {
			let composer: EffectComposer;
			if (this.node.pv.use_render_target) {
				renderer.autoClear = false;
				const parameters = {
					minFilter: LinearFilter,
					magFilter: LinearFilter,
					format: RGBFormat,
					stencilBuffer: true,
				};

				const render_target = new WebGLRenderTarget(
					renderer.domElement.offsetWidth,
					renderer.domElement.offsetHeight,
					parameters
				);
				composer = new EffectComposer(renderer, render_target); //, renderTarget );
			} else {
				composer = new EffectComposer(renderer); //, renderTarget );
			}
			// to achieve better antialiasing
			// while using post:
			// composer.setPixelRatio( window.devicePixelRatio*2 )
			composer.setPixelRatio(window.devicePixelRatio * 1);

			const scene = this.node.render_controller.resolved_scene || this.node.scene.default_scene;
			const camera = this.node.object;
			if (this.node.pv.prepend_render_pass == true) {
				const render_pass = new RenderPass(scene, camera);
				composer.addPass(render_pass);
			}

			const found_node = this.node.p.post_process_node.found_node();
			if (found_node) {
				if (found_node.node_context() == NodeContext.POST) {
					const post_node = found_node as BasePostProcessNodeType;
					post_node.setup_composer({
						composer: composer,
						camera: camera,
						resolution: this.node.render_controller.canvas_resolution(canvas),
						camera_node: this.node,
						scene: scene,
						canvas: canvas,
					});
				} else {
					this.node.states.error.set('found node is not a post process node');
				}
			} else {
				this.node.states.error.set('no post node found');
			}

			return composer;
		}
	}

	// private _clear_render_passes(composer: EffectComposer) {
	// 	let render_pass: Pass | undefined;
	// 	while ((render_pass = composer.passes.pop())) {
	// 		if (render_pass) {
	// 			const disposable_pass: DisposablePass = render_pass as DisposablePass;
	// 			if (typeof disposable_pass.dispose === 'function') {
	// 				try {
	// 					disposable_pass.dispose();
	// 				} catch (e) {
	// 					console.warn(e);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
