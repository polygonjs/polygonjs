import {Camera, Scene, WebGLRenderer} from 'three';
import {TypedNode, BaseNodeType} from '../_Base';
import {EffectComposer, Pass} from 'postprocessing';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDB} from '../utils/FlagsController';
import {BaseParamType} from '../../params/_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {BaseNetworkPostProcessNodeType, EffectComposerController} from './utils/EffectComposerController';
import {CoreCameraPostProcessController} from '../../../core/camera/CoreCameraPostProcessController';
import {CoreType} from '../../../core/Type';
import {BaseViewerType} from '../../viewers/_Base';

export interface TypedPostNodeContext {
	composerController: EffectComposerController;
	composer: EffectComposer;
	camera: Camera;
	renderer: WebGLRenderer;
	// resolution: Vector2;
	scene: Scene;
	// requester: BaseNodeType;
	viewer: BaseViewerType;
}

function PostParamCallback(node: BaseNodeType, param: BaseParamType) {
	TypedPostNode.PARAM_CALLBACK_updatePasses(node as BasePostProcessNodeType);
}
export const PostParamOptions: ParamOptions = {
	cook: false,
	callback: PostParamCallback,
	computeOnDirty: true, // important if an expression drives a param
};

/**
 *
 *
 * TypedPostNode is the base class for all nodes that create post-processing passes. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */

export class TypedPostNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static override context(): NodeContext {
		return NodeContext.POST;
	}

	public override readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	protected _passesByEffectsComposer: Map<EffectComposer, P | P[]> = new Map();

	override initializeNode() {
		this.flags.display.set(false);
		this.flags.display.onUpdate(() => {
			if (this.flags.display.active()) {
				const parent = this.parent();
				if (parent && parent.displayNodeController) {
					parent.displayNodeController.setDisplayNode(this);
				}
			}
		});

		this.io.inputs.setCount(0, 1);
		this.io.outputs.setHasOneOutput();
	}

	override cook() {
		this.cookController.endCook();
	}
	setupComposer(context: TypedPostNodeContext) {
		this._addPassFromInput(0, context);

		if (!this.flags.bypass.active()) {
			this._setupComposerIfActive(context);
		}
	}
	protected _setupComposerIfActive(context: TypedPostNodeContext) {
		const pass = this.createPassForContext(context);
		if (pass) {
			const array = CoreType.isArray(pass) ? pass : [pass];
			for (let p of array) {
				context.composerController.addPassByNodeInBuildPassesProcess(this, p, context.composer);
			}
		}
	}
	passesByComposer(composer: EffectComposer) {
		return this._passesByEffectsComposer.get(composer);
	}

	protected _addPassFromInput(index: number, context: TypedPostNodeContext) {
		const input = this.io.inputs.input(index);
		if (input) {
			input.setupComposer(context);
		}
	}
	createPassForContext(context: TypedPostNodeContext) {
		let pass = this._passesByEffectsComposer.get(context.composer);
		if (!pass) {
			pass = this.createPass(context);
			if (pass) {
				this._passesByEffectsComposer.set(context.composer, pass);
			}
		}
		return pass;
	}
	createPass(context: TypedPostNodeContext): P | P[] | undefined {
		return undefined;
	}

	static PARAM_CALLBACK_updatePasses(node: BasePostProcessNodeType) {
		node._updatePasses();
	}
	protected _updatePasses() {
		this._passesByEffectsComposer.forEach((passOrPasses) => {
			const passes = CoreType.isArray(passOrPasses) ? passOrPasses : [passOrPasses];
			for (let pass of passes) {
				this.updatePass(pass);
			}
		});
	}
	protected updatePass(pass: P) {}

	protected _postProcessNetworkNode(): BaseNetworkPostProcessNodeType {
		const parentNode = this.parent()!;
		if (CoreCameraPostProcessController.isPostProcessNetworkNode(parentNode)) {
			return parentNode as BaseNetworkPostProcessNodeType;
		} else {
			console.error('parent is neither a POST NETWORK or a POST node', parentNode);
			const parentPostNode = parentNode as BasePostProcessNodeType;
			return parentPostNode._postProcessNetworkNode();
		}
	}
	// protected _createRenderTarget(renderer: WebGLRenderer, options?: RenderTargetCreateOptions) {
	// 	const parentNode = this._postProcessNetworkNode();
	// 	return parentNode.effectsComposerController.createRenderTarget(renderer);
	// }
	// protected _createEffectComposer(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget) {
	// 	return new EffectComposer(renderer, renderTarget);
	// }
}

export type BasePostProcessNodeType = TypedPostNode<Pass, NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostNode<Pass, NodeParamsConfig> {}
