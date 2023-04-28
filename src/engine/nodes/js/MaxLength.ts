/**
 * clamps a vector length
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';

enum MaxLengthJsNodeInputName {
	VALUE = 'value',
	MAX = 'max',
}
const DefaultValues: PolyDictionary<number> = {
	[MaxLengthJsNodeInputName.VALUE]: 1,
	[MaxLengthJsNodeInputName.MAX]: 1,
};

const OUTPUT_NAME = 'vector';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.VECTOR2: {
			return 'maxLengthVector2';
		}
		case JsConnectionPointType.VECTOR3: {
			return 'maxLengthVector3';
		}
		case JsConnectionPointType.VECTOR4: {
			return 'maxLengthVector4';
		}
	}
}

export class MaxLengthJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'maxLength';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const input = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const scalar = this.variableForInput(shadersCollectionController, this._expectedInputName(1));
		const varName = this.jsVarName(this._expectedOutputName(0));
		const inputType = this._expectedInputTypes()[0];
		const variable = createVariable(inputType);
		const tmpVarName =(variable) ?
			shadersCollectionController.addVariable(this,  variable)
		:undefined

		// vector
		const functionName = functionNameByType(inputType);
		if (functionName&&tmpVarName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{dataType: inputType, varName, value: func.asString(input, scalar, tmpVarName)},
			]);
			return;
		}
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type = firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : JsConnectionPointType.VECTOR3;
		return [type, JsConnectionPointType.FLOAT];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	protected _expectedInputName(index: number) {
		return [MaxLengthJsNodeInputName.VALUE, MaxLengthJsNodeInputName.MAX][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
}
