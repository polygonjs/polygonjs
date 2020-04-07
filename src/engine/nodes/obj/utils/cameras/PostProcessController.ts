import {Vector2} from 'three/src/math/Vector2';

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
		});
		add_render_pass = ParamConfig.BOOLEAN(1, {
			visible_if: {
				do_post_process: 1,
			},
		});
	};
}

export class PostProcessController {
	private _composers_by_canvas_id: Dictionary<EffectComposer> = {};

	constructor(private node: BaseCameraObjNodeType) {}

	// private _prev_t = 0;
	render(canvas: HTMLCanvasElement, size: Vector2, aspect: number) {
		const composer = this.composer(canvas);
		if (composer) {
			composer.setSize(size.x, size.y);
			composer.render();
		}
	}

	private composer(canvas: HTMLCanvasElement): EffectComposer {
		return (this._composers_by_canvas_id[canvas.id] =
			this._composers_by_canvas_id[canvas.id] || this._create_composer(canvas));
	}

	private _create_composer(canvas: HTMLCanvasElement) {
		const renderer = this.node.render_controller.renderer(canvas);
		if (renderer) {
			const composer = new EffectComposer(renderer); //, renderTarget );
			// to achieve better antialiasing
			// while using post:
			// composer.setPixelRatio( window.devicePixelRatio*2 )
			composer.setPixelRatio(window.devicePixelRatio * 2);

			const scene = this.node.render_controller.resolved_scene || this.node.scene.default_scene;
			const camera = this.node.object;
			if (this.node.pv.add_render_pass) {
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
