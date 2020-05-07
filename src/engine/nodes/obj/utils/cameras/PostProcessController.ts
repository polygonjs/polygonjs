import {Vector2} from 'three/src/math/Vector2';

import {BaseThreejsCameraObjNodeType, BaseThreejsCameraObjNodeClass} from '../../_BaseCamera';
import {EffectComposer} from '../../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {NetworkNodeType} from '../../../../poly/NodeContext';
import {BaseNetworkPostProcessNodeType} from '../../../post/utils/EffectsComposerController';

// interface DisposablePass extends Pass {
// 	dispose: () => void;
// }

import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../../_Base';
export function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		do_post_process = ParamConfig.BOOLEAN(0);
		post_process_node = ParamConfig.OPERATOR_PATH('./post_process1', {
			visible_if: {
				do_post_process: 1,
			},
			node_selection: {
				type: NetworkNodeType.POST,
			},
			// cook: false,
			callback: (node: BaseNodeType) => {
				BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_reset_effects_composer(
					node as BaseThreejsCameraObjNodeType
				);
			},
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

	constructor(private node: BaseThreejsCameraObjNodeType) {
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
			this.reset();
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

	reset() {
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
		console.warn('create composer');
		const renderer = this.node.render_controller.renderer(canvas);
		if (renderer) {
			const scene = this.node.render_controller.resolved_scene || this.node.scene.default_scene;
			const camera = this.node.object;

			const found_node = this.node.p.post_process_node.found_node();
			if (found_node) {
				if (found_node.type == NetworkNodeType.POST) {
					const post_process_network = found_node as BaseNetworkPostProcessNodeType;
					const resolution = this.node.render_controller.canvas_resolution(canvas);
					const composer = post_process_network.effects_composer_controller.create_effects_composer({
						renderer,
						scene,
						camera,
						resolution,
						canvas,
						camera_node: this.node,
						use_render_target: this.node.pv.use_render_target,
						prepend_render_pass: this.node.pv.prepend_render_pass,
					});
					// this._rebuild_required = false
					return composer;
				} else {
					this.node.states.error.set('found node is not a post process node');
				}
			} else {
				this.node.states.error.set('no post node found');
			}
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
