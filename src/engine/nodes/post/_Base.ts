import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {TypedNode, BaseNodeType} from '../_Base';
import {EffectComposer} from '../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {FlagsControllerDB} from '../utils/FlagsController';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {BaseParamType} from '../../params/_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

const INPUT_PASS_NAME = 'input pass';
const DEFAULT_INPUT_NAMES = [INPUT_PASS_NAME];
export interface TypedPostNodeContext {
	composer: EffectComposer;
	camera: Camera;
	resolution: Vector2;
	scene: Scene;
	requester: BaseNodeType;
	camera_node?: BaseCameraObjNodeType;
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
 * BasePostNode is the base class for all nodes that process post-processing passes.
 *
 */

export class TypedPostProcessNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static context(): NodeContext {
		return NodeContext.POST;
	}

	public readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	protected _passes_by_requester_id: Map<CoreGraphNodeId, P> = new Map();

	static displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}
	initializeNode() {
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

	cook() {
		this.cookController.endCook();
	}
	setupComposer(context: TypedPostNodeContext): void {
		this._addPassFromInput(0, context);

		if (!this.flags.bypass.active()) {
			let pass = this._passes_by_requester_id.get(context.requester.graphNodeId());
			if (!pass) {
				pass = this._createPass(context);
				if (pass) {
					this._passes_by_requester_id.set(context.requester.graphNodeId(), pass);
				}
			}
			if (pass) {
				context.composer.addPass(pass);
			}
		}
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
	private _update_pass_bound = this.updatePass.bind(this);
	private _updatePasses() {
		this._passes_by_requester_id.forEach(this._update_pass_bound);
	}
	protected updatePass(pass: P) {}
}

export type BasePostProcessNodeType = TypedPostProcessNode<Pass, NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostProcessNode<Pass, NodeParamsConfig> {}
