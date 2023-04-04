/**
 * multiplies a vector by a scalar
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
// import {Color, Vector2, Vector3, Vector4} from 'three';

enum MultScalarJsNodeInputName {
	VALUE = 'value',
	MULT = 'mult',
}
const DefaultValues: PolyDictionary<number> = {
	[MultScalarJsNodeInputName.VALUE]: 1,
	[MultScalarJsNodeInputName.MULT]: 1,
};
const OUTPUT_NAME = 'mult';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [
	JsConnectionPointType.COLOR,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.COLOR: {
			return 'multScalarColor';
		}
		case JsConnectionPointType.VECTOR2: {
			return 'multScalarVector2';
		}
		case JsConnectionPointType.VECTOR3: {
			return 'multScalarVector3';
		}
		case JsConnectionPointType.VECTOR4: {
			return 'multScalarVector4';
		}
	}
}

export class MultScalarJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'multScalar';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const input = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const scalar = this.variableForInput(shadersCollectionController, this._expectedInputName(1));
		const varName = this.jsVarName(this._expectedOutputName(0));
		const inputType = this._expectedInputTypes()[0];
		const variable = createVariable(inputType);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}

		// color / vector
		const functionName = functionNameByType(inputType);
		if (functionName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{dataType: inputType, varName, value: func.asString(input, scalar, varName)},
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
		return [MultScalarJsNodeInputName.VALUE, MultScalarJsNodeInputName.MULT][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
}
