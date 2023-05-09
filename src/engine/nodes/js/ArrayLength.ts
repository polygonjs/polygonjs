/**
 * return the length of an array
 *
 *
 *
 */
import {
	JsConnectionPointType,
	ARRAY_JS_CONNECTION_TYPES_SET,
	JsConnectionPointTypeArray,
} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const ALLOWED_INPUT_TYPES = ARRAY_JS_CONNECTION_TYPES_SET;

class ArrayLengthJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ArrayLengthJsParamsConfig();

export class ArrayLengthJsNode extends TypedJsNode<ArrayLengthJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'arrayLength';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): JsConnectionPointTypeArray[] {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType != null && ALLOWED_INPUT_TYPES.has(firstType as JsConnectionPointTypeArray)
				? (firstType as JsConnectionPointTypeArray)
				: JsConnectionPointType.FLOAT_ARRAY;
		return [type];
	}

	protected _expectedInputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return `${type}`;
	}
	protected _expectedOutputName(index: number): string {
		return `length`;
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.INT];
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const array = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction('arrayLength', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array),
			},
		]);
	}
}
