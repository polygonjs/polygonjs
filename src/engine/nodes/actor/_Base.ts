import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamsEditableStateController} from '../utils/io/ParamsEditableStateController';
import {Object3D} from 'three/src/core/Object3D';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {ParamValuesTypeMap} from '../../params/types/ParamValuesTypeMap';
import {ActorNodeParamConstructorMap} from './utils/ActorNodeInputParam';
import {Poly} from '../../Poly';

export interface ActorNodeTriggerContext {
	Object3D: Object3D;
}

const INPUT_NAME = 'input actor behaviors';
const DEFAULT_INPUT_NAMES = [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
export const TRIGGER_CONNECTION_NAME = 'trigger';
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
		// this.io.connection_points.set_expected_input_types_function(() => []);
	}
	private _cookWithoutInputsBound = this._cookWithoutInputs.bind(this);
	_cookWithoutInputs() {
		this.cookController.cookMainWithoutInputs();
	}
	override cook() {
		this.cookController.endCook();
	}

	public receiveTrigger(context: ActorNodeTriggerContext) {}
	runTrigger = Poly.playerMode() ? this._triggerConnectionForPlayer : this._triggerConnectionForEditor;
	private _triggerConnectionForEditor(context: ActorNodeTriggerContext, outputIndex = 0) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(outputIndex);
		if (!triggerConnections) {
			return;
		}
		const dispatcher = this.scene().actorsManager.connectionTriggerDispatcher;
		triggerConnections.forEach((triggerConnection) => {
			dispatcher.dispatchTrigger(triggerConnection);
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}
	private _triggerConnectionForPlayer(context: ActorNodeTriggerContext, outputIndex = 0) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(outputIndex);
		if (!triggerConnections) {
			return;
		}
		triggerConnections.forEach((triggerConnection) => {
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}

	public outputValue(
		inputName: string,
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		return -1;
	}

	protected _inputValueFromParam<T extends ParamType>(
		param: ActorNodeParamConstructorMap[T],
		context: ActorNodeTriggerContext
	): ParamValuesTypeMap[T] {
		const inputIndex = this.io.inputs.getInputIndex(param.name());
		const connection = this.io.connections.inputConnection(inputIndex);
		if (connection) {
			const inputNode = (<unknown>connection.node_src) as BaseActorNodeType;
			const output_connection_point = inputNode.io.outputs.namedOutputConnectionPoints()[connection.output_index];
			if (output_connection_point) {
				const outputName = output_connection_point.name();
				// const type = ActorParamTypeToConnectionPointTypeMap[param.type()]
				// if(type){
				return inputNode.outputValue(outputName, context) as ParamValuesTypeMap[T];
				// }
			}
		} else {
			return param.value as ParamValuesTypeMap[T];
		}
		return -1 as ParamValuesTypeMap[T];
	}
	protected _inputValue<T extends ActorConnectionPointType>(
		inputName: string,
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[T] {
		const inputIndex = this.io.inputs.getInputIndex(inputName);
		const connection = this.io.connections.inputConnection(inputIndex);
		if (connection) {
			const inputNode = (<unknown>connection.node_src) as BaseActorNodeType;
			const output_connection_point = inputNode.io.outputs.namedOutputConnectionPoints()[connection.output_index];
			if (output_connection_point) {
				const outputName = output_connection_point.name();
				// const type = ActorParamTypeToConnectionPointTypeMap[param.type()]
				// if(type){
				return inputNode.outputValue(outputName, context) as ReturnValueTypeByActorConnectionPointType[T];
				// }
			}
		} else {
			if (this.params.has(inputName)) {
				return this.params.get(inputName)!.value as ReturnValueTypeByActorConnectionPointType[T];
			}
		}
		return -1 as ReturnValueTypeByActorConnectionPointType[T];
	}

	// processActor(object: Object3D) {}
}

export type BaseActorNodeType = TypedActorNode<NodeParamsConfig>;
export class BaseActorNodeClass extends TypedActorNode<NodeParamsConfig> {}

class ParamlessParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessParamsConfig();
export class ParamlessTypedActorNode extends TypedActorNode<ParamlessParamsConfig> {
	override paramsConfig = ParamsConfig;
}
