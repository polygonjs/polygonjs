/**
 * outputs 1 of the 2 inputs based on a boolean input
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {ParamlessTypedJsNode} from './_Base';

const OUTPUT_NAME = 'val';
export enum TwoWaySwitchJsNodeInputName {
	CONDITION = 'condition',
	IF_TRUE = 'ifTrue',
	IF_FALSE = 'ifFalse',
}
const InputNames: Array<TwoWaySwitchJsNodeInputName> = [
	TwoWaySwitchJsNodeInputName.CONDITION,
	TwoWaySwitchJsNodeInputName.IF_TRUE,
	TwoWaySwitchJsNodeInputName.IF_FALSE,
];

export class TwoWaySwitchJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'twoWaySwitch';
	}

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
		return InputNames[index];
	}
	protected _expectedOutputName() {
		return OUTPUT_NAME;
	}
	protected _expectedInputTypes(): JsConnectionPointType[] {
		const second_or_third_connection =
			this.io.connections.inputConnection(1) || this.io.connections.inputConnection(2);
		const type: JsConnectionPointType = second_or_third_connection
			? second_or_third_connection.srcConnectionPoint().type()
			: JsConnectionPointType.FLOAT;
		return [JsConnectionPointType.BOOLEAN, type, type];
	}
	protected _expectedOutputTypes() {
		const type = this._expectedInputTypes()[1];
		return [type];
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const condition = this.variableForInput(shadersCollectionController, TwoWaySwitchJsNodeInputName.CONDITION);
		const ifTrue = this.variableForInput(shadersCollectionController, TwoWaySwitchJsNodeInputName.IF_TRUE);
		const ifFalse = this.variableForInput(shadersCollectionController, TwoWaySwitchJsNodeInputName.IF_FALSE);

		const out = this.jsVarName(OUTPUT_NAME);

		const bodyLine = `${condition} ? ${ifTrue} : ${ifFalse}`;
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
