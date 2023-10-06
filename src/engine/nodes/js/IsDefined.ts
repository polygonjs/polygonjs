/**
 * compares 2 input values and generates a boolean value
 *
 * @remarks
 *
 * This node is frequently used with the [js/TwoWaySwitch](/docs/nodes/js/TwoWaySwitch)
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';

const ALLOWED_TYPES = [
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.INT,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INTERSECTION,
	JsConnectionPointType.MATERIAL,
	JsConnectionPointType.OBJECT_3D,
	JsConnectionPointType.STRING,
	JsConnectionPointType.TEXTURE,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

const OUTPUT_NAME = 'defined';
enum IsDefinedInputName {
	VALUE = 'value',
}
class IsDefinedJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new IsDefinedJsParamsConfig();
export class IsDefinedJsNode extends TypedJsNode<IsDefinedJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'isDefined';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.initializeNode();
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}

	protected _expectedInputName(index: number) {
		return [IsDefinedInputName.VALUE][index];
	}
	protected _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		const connectionPoints = this.io.inputs.namedInputConnectionPoints();
		if (first_input_type && connectionPoints) {
			if (!ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = connectionPoints[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		return [type];
	}
	private _expectedOutputTypes() {
		return [JsConnectionPointType.BOOLEAN];
	}
	private _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}

	override setLines(linesController: JsLinesCollectionController) {
		const varName = this.jsVarName(this._expectedOutputName(0));

		const inputType = this._expectedInputTypes()[0];
		const variable = createVariable(inputType);
		if (variable) {
			linesController.addVariable(this, variable);
		}

		const value = this.variableForInput(linesController, IsDefinedInputName.VALUE);

		const mainFunction = `${value} != null`;

		linesController.addBodyOrComputed(this, [{dataType: inputType, varName, value: mainFunction}]);
	}
}
