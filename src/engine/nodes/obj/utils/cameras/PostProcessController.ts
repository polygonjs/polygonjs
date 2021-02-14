import {Constructor, PolyDictionary} from '../../../../../types/GlobalTypes';
import {Vector2} from 'three/src/math/Vector2';
import {BaseThreejsCameraObjNodeType, BaseThreejsCameraObjNodeClass} from '../../_BaseCamera';
import {EffectComposer} from '../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {NetworkNodeType} from '../../../../poly/NodeContext';
import {BaseNetworkPostProcessNodeType} from '../../../post/utils/EffectsComposerController';
import {BaseNodeType} from '../../../_Base';

// interface DisposablePass extends Pass {
// 	dispose: () => void;
// }
const POST_PROCESS_PARAM_OPTIONS = {
	callback: (node: BaseNodeType) => {
		BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_reset_effects_composer(node as BaseThreejsCameraObjNodeType);
	},
};

import {ParamConfig} from '../../../utils/params/ParamsConfig';
export function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		doPostProcess = ParamConfig.BOOLEAN(0);
		postProcessNode = ParamConfig.NODE_PATH('./postProcess1', {
			visibleIf: {
				doPostProcess: 1,
			},
			nodeSelection: {
				types: [NetworkNodeType.POST],
			},
			// cook: false,
			...POST_PROCESS_PARAM_OPTIONS,
		});
		// prepend_render_pass = ParamConfig.BOOLEAN(1, {
		// 	visibleIf: {
		// 		doPostProcess: 1,
		// 	},
		// });
		// use_render_target = ParamConfig.BOOLEAN(0, {
		// 	visibleIf: {
		// 		doPostProcess: 1,
		// 	},
		// 	...POST_PROCESS_PARAM_OPTIONS,
		// });
	};
}

export class PostProcessController {
	private _composers_by_canvas_id: PolyDictionary<EffectComposer> = {};

	constructor(private node: BaseThreejsCameraObjNodeType) {
		if (this.node.p.postProcessNode) {
			this._add_param_dirty_hook();
		} else {
			this.node.params.onParamsCreated('post process add param dirty hook', () => {
				this._add_param_dirty_hook();
			});
		}
	}
	private _add_param_dirty_hook() {
		this.node.p.postProcessNode.addPostDirtyHook('on_post_node_dirty', () => {
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
			// if (this.node.pv.use_render_target) {
			// 	const renderer = this.node.render_controller.renderer(canvas);
			// 	renderer.clear();
			// }
			composer.render();
		}
	}

	reset() {
		const ids = Object.keys(this._composers_by_canvas_id);
		for (let id of ids) {
			delete this._composers_by_canvas_id[id];
		}
	}

	// method could be private, but is public for the test suite
	composer(canvas: HTMLCanvasElement): EffectComposer {
		return (this._composers_by_canvas_id[canvas.id] =
			this._composers_by_canvas_id[canvas.id] || this._create_composer(canvas));
	}

	private _create_composer(canvas: HTMLCanvasElement) {
		const renderer = this.node.renderController.renderer(canvas);
		if (renderer) {
			const scene = this.node.renderController.resolved_scene || this.node.scene().threejsScene();
			const camera = this.node.object;

			const found_node = this.node.p.postProcessNode.value.node();
			if (found_node) {
				if (found_node.type() == NetworkNodeType.POST) {
					const post_process_network = found_node as BaseNetworkPostProcessNodeType;
					const resolution = this.node.renderController.canvas_resolution(canvas);

					const composer = post_process_network.effectsComposerController.createEffectsComposer({
						renderer,
						scene,
						camera,
						resolution,
						requester: this.node,
						camera_node: this.node,
						// render_target: render_target,
						// prepend_render_pass: this.node.pv.prepend_render_pass,
					});
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
