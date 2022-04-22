import {Vector2} from 'three';
import type {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {EffectComposer} from '../../../../../modules/core/post_process/EffectComposer';
import {NetworkNodeType} from '../../../../poly/NodeContext';
import {BaseNetworkPostProcessNodeType} from '../../../post/utils/EffectsComposerController';

export class PostProcessController {
	private _composersByCanvasId: Map<string, EffectComposer> = new Map();

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
	renderer(canvas: HTMLCanvasElement) {
		const composer = this.composer(canvas);
		if (composer) {
			return composer.renderer;
		}
	}

	reset() {
		this._composersByCanvasId.clear();
	}

	// method could be private, but is public for the test suite
	composer(canvas: HTMLCanvasElement): EffectComposer | undefined {
		const existingComposer = this._composersByCanvasId.get(canvas.id);
		if (existingComposer) {
			return existingComposer;
		} else {
			const newComposer = this._createComposer(canvas);
			if (newComposer) {
				this._composersByCanvasId.set(canvas.id, newComposer);
			}
			return newComposer;
		}
	}

	private _createComposer(canvas: HTMLCanvasElement) {
		const renderer = this.node.renderController().renderer(canvas);
		if (renderer) {
			const scene = this.node.renderController().resolvedScene() || this.node.scene().threejsScene();
			const camera = this.node.object;

			const found_node = this.node.p.postProcessNode.value.node();
			if (found_node) {
				if (found_node.type() == NetworkNodeType.POST) {
					const post_process_network = found_node as BaseNetworkPostProcessNodeType;
					const resolution = this.node.renderController().canvasResolution(canvas);

					if (!resolution) {
						return;
					}
					return post_process_network.effectsComposerController.createEffectsComposer({
						renderer,
						scene,
						camera,
						resolution,
						requester: this.node,
						camera_node: this.node,
						// render_target: render_target,
						// prepend_render_pass: this.node.pv.prepend_render_pass,
					});
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
