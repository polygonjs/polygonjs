/**
 * Allows to switch between different inputs.
 *
 *
 *
 */
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';

// TODO: it would make typings easier of the switch node had a predefined index param
// but this currently does not work with dynamic inputs/spare params
export class SwitchActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'switch';
	}
	static INPUT_INDEX_NAME = 'index';
	static OUTPUT_NAME = 'val';

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputName(index: number) {
		if (index == 0) {
			return SwitchActorNode.INPUT_INDEX_NAME;
		} else {
			return `in${index - 1}`;
		}
	}
	protected _expectedOutputName() {
		return SwitchActorNode.OUTPUT_NAME;
	}
	protected _expectedInputTypes(): ActorConnectionPointType[] {
		const secondInputType = this.io.connection_points.input_connection_type(1);
		const type = secondInputType || ActorConnectionPointType.FLOAT;

		const currentConnections = this.io.connections.inputConnections() || [];
		let lastValidConnectionIndex = 1;
		let i = 0;
		for (let connection of currentConnections) {
			if (connection) {
				lastValidConnectionIndex = i;
			}
			i++;
		}

		const expectedCount = Math.max(lastValidConnectionIndex + 1, 2);
		const expectedInputTypes = [ActorConnectionPointType.INTEGER];
		for (let i = 0; i < expectedCount; i++) {
			expectedInputTypes.push(type);
		}
		return expectedInputTypes;
	}
	protected _expectedOutputTypes() {
		const inputTypes = this._expectedInputTypes();
		const type = inputTypes[1] || ActorConnectionPointType.FLOAT;
		return [type];
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const inputIndex =
			this._inputValue<ActorConnectionPointType.INTEGER>(SwitchActorNode.INPUT_INDEX_NAME, context) || 0;
		return this._inputValue(this._expectedInputName(inputIndex + 1), context) || 0;
	}
}
