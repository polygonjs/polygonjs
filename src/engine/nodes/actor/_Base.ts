import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {ParamsEditableStateController} from '../utils/io/ParamsEditableStateController';

const INPUT_NAME = 'input actor behaviors';
const DEFAULT_INPUT_NAMES = [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];

/**
 * BaseActorNode is the base class for all nodes that create behaviors. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedActorNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ACTOR, K> {
	static override context(): NodeContext {
		return NodeContext.ACTOR;
	}

	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	private _paramsEditableStatesController = new ParamsEditableStateController(this);
	override initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		this.addPostDirtyHook('cookWithoutInputsOnDirty', this._cookWithoutInputsBound);

		this.io.inputs.setDependsOnInputs(false);
		this.io.connections.initInputs();
		this.io.connection_points.spare_params.initializeNode();
		this._paramsEditableStatesController.initializeNode();
	}
	private _cookWithoutInputsBound = this._cookWithoutInputs.bind(this);
	_cookWithoutInputs() {
		this.cookController.cookMainWithoutInputs();
	}
	override cook() {
		this.cookController.endCook();
	}

	processActor(object: Object3D) {}
}

export type BaseActorNodeType = TypedActorNode<NodeParamsConfig>;
export class BaseActorNodeClass extends TypedActorNode<NodeParamsConfig> {}
