/**
 * Allows to switch between different inputs.
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamlessTypedJsNode} from './_Base';
import {ThreeToJs} from '../../../core/ThreeToJs';

// TODO: it would make typings easier if the switch node had a predefined index param
// but this currently does not work with dynamic inputs/spare params

const INPUT_TYPES_ALLOWING_NON_CONNECTED_INPUT = new Set([
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.INT,
	JsConnectionPointType.STRING,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
]);

export class SwitchJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'switch';
	}
	static INPUT_INDEX_NAME = 'index';
	static OUTPUT_NAME = 'val';

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
			return SwitchJsNode.INPUT_INDEX_NAME;
		} else {
			return `in${index - 1}`;
		}
	}
	protected _expectedOutputName() {
		return SwitchJsNode.OUTPUT_NAME;
	}
	protected _expectedInputTypes(): JsConnectionPointType[] {
		const secondInputType = this.io.connection_points.input_connection_type(1);
		const type = secondInputType || JsConnectionPointType.FLOAT;

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
		const expectedInputTypes = [JsConnectionPointType.INT];
		for (let i = 0; i < expectedCount; i++) {
			expectedInputTypes.push(type);
		}
		return expectedInputTypes;
	}
	protected _expectedOutputTypes() {
		const inputTypes = this._expectedInputTypes();
		const type = inputTypes[1] || JsConnectionPointType.FLOAT;
		return [type];
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputIndex = ThreeToJs.integer(
			this.variableForInput(shadersCollectionController, SwitchJsNode.INPUT_INDEX_NAME)
		);
		const inputTypes = this._expectedInputTypes();
		const inputValuesCount = this._expectedInputTypes().length - 1;
		const inputArgs: string[] = [];
		for (let i = 0; i <= inputValuesCount; i++) {
			const inputIndex = i + 1;
			const inputType = inputTypes[inputIndex];
			if (
				this.io.connections.inputConnection(inputIndex) ||
				INPUT_TYPES_ALLOWING_NON_CONNECTED_INPUT.has(inputType)
			) {
				const inputArg = ThreeToJs.valueWrap(
					this.variableForInput(shadersCollectionController, this._expectedInputName(inputIndex))
				);
				inputArgs.push(inputArg);
			}
		}
		const value = `[${inputArgs.join(', ')}][${inputIndex}].value`;

		const varName = this.jsVarName(SwitchJsNode.OUTPUT_NAME);

		const dataType = this._expectedOutputTypes()[0];
		shadersCollectionController.addBodyOrComputed(this, [{dataType, varName, value}]);
	}
}
