import {Camera} from 'three';
import {TypedNode, BaseNodeType} from '../_Base';
import {EffectComposer} from '../../../modules/core/post_process/EffectComposer';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Scene} from 'three';
import {FlagsControllerDB} from '../utils/FlagsController';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {BaseParamType} from '../../params/_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {
	BaseNetworkPostProcessNodeType,
	EffectComposerController,
	RenderTargetCreateOptions,
} from './utils/EffectComposerController';
import {WebGLRenderer} from 'three';
import {WebGLRenderTarget} from 'three';
import {CoreCameraPostProcessController} from '../../../core/camera/CoreCameraPostProcessController';

const INPUT_PASS_NAME = 'input pass';
const DEFAULT_INPUT_NAMES = [INPUT_PASS_NAME];
export interface TypedPostNodeContext {
	composerController: EffectComposerController;
	composer: EffectComposer;
	camera: Camera;
	renderer: WebGLRenderer;
	// resolution: Vector2;
	scene: Scene;
	// requester: BaseNodeType;
}

function PostParamCallback(node: BaseNodeType, param: BaseParamType) {
	TypedPostProcessNode.PARAM_CALLBACK_updatePasses(node as BasePostProcessNodeType);
}
export const PostParamOptions: ParamOptions = {
	cook: false,
	callback: PostParamCallback,
	computeOnDirty: true, // important if an expression drives a param
};

/**
 * BasePostNode is the base class for all nodes that process post-processing passes. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */

export class TypedPostProcessNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static override context(): NodeContext {
		return NodeContext.POST;
	}

	public override readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	protected _passesByEffectsComposer: Map<EffectComposer, P> = new Map();

	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}
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
	setupComposer(context: TypedPostNodeContext): void {
		this._addPassFromInput(0, context);

		if (!this.flags.bypass.active()) {
			let pass = this._passesByEffectsComposer.get(context.composer);
			if (!pass) {
				pass = this._createPass(context);
				if (pass) {
					this._passesByEffectsComposer.set(context.composer, pass);
				}
			}
			if (pass) {
				context.composerController.addPassByNodeInBuildPassesProcess(this, pass);
				context.composer.addPass(pass);
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

	protected _createPass(context: TypedPostNodeContext): P | undefined {
		return undefined;
	}

	static PARAM_CALLBACK_updatePasses(node: BasePostProcessNodeType) {
		node._updatePasses();
	}
	private _updatePassBound = this.updatePass.bind(this);
	private _updatePasses() {
		this._passesByEffectsComposer.forEach(this._updatePassBound);
	}
	protected updatePass(pass: P) {}

	private _postProcessNetworkNode(): BaseNetworkPostProcessNodeType {
		const parentNode = this.parent()!;
		if (CoreCameraPostProcessController.isPostProcessNetworkNode(parentNode)) {
			return parentNode as BaseNetworkPostProcessNodeType;
		} else {
			console.error('parent is neither a POST NETWORK or a POST node', parentNode);
			const parentPostNode = parentNode as BasePostProcessNodeType;
			return parentPostNode._postProcessNetworkNode();
		}
	}
	protected _createRenderTarget(renderer: WebGLRenderer, options?: RenderTargetCreateOptions) {
		const parentNode = this._postProcessNetworkNode();
		return parentNode.effectsComposerController.createRenderTarget(renderer);
	}
	protected _createEffectComposer(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget) {
		return new EffectComposer(renderer, renderTarget);
	}
}

export type BasePostProcessNodeType = TypedPostProcessNode<Pass, NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostProcessNode<Pass, NodeParamsConfig> {}
