/**
 * returns the cross product between 2 vectors
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {
	isJsConnectionPointArray,
	JsConnectionPointType,
	JsConnectionPointTypeFromArrayTypeMap,
	JsConnectionPointTypeToArrayTypeMap,
} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';

enum CrossJsNodeInputName {
	VALUE0 = 'v0',
	VALUE1 = 'v1',
}
const DefaultValues: PolyDictionary<number> = {
	[CrossJsNodeInputName.VALUE0]: 1,
	[CrossJsNodeInputName.VALUE1]: 1,
};
const OUTPUT_NAME = 'val';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [JsConnectionPointType.VECTOR2, JsConnectionPointType.VECTOR3];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.VECTOR2: {
			return 'crossVector2';
		}
		case JsConnectionPointType.VECTOR3: {
			return 'crossVector3';
		}
	}
}

export class CrossJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'cross';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const value0 = this.variableForInput(shadersCollectionController, CrossJsNodeInputName.VALUE0);
		const value1 = this.variableForInput(shadersCollectionController, CrossJsNodeInputName.VALUE1);
		const varName = this.jsVarName(this._expectedOutputName(0));
		const inputType = this._expectedInputTypes()[0];

		const variable = createVariable(inputType);
		const tmpVarName = variable ? shadersCollectionController.addVariable(this, variable) : undefined;

		// color / vector
		const functionName = functionNameByType(inputType);
		if (functionName && tmpVarName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{dataType: inputType, varName, value: func.asString(value0, value1, tmpVarName)},
			]);
			return;
		}
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type = firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : JsConnectionPointType.VECTOR3;
		return [type, type];
	}
	protected _expectedOutputTypes() {
		const inputType = this._expectedInputTypes()[0];
		const elementInputType = JsConnectionPointTypeFromArrayTypeMap[inputType];

		function arrayOrElement(type: JsConnectionPointType) {
			return isJsConnectionPointArray(inputType) ? JsConnectionPointTypeToArrayTypeMap[type] : type;
		}

		function _outputType() {
			switch (elementInputType) {
				case JsConnectionPointType.VECTOR2: {
					return arrayOrElement(JsConnectionPointType.FLOAT);
				}
				case JsConnectionPointType.VECTOR3: {
					return arrayOrElement(JsConnectionPointType.VECTOR3);
				}
			}
			return arrayOrElement(JsConnectionPointType.VECTOR3);
		}

		return [_outputType()];
	}
	protected _expectedInputName(index: number) {
		return [CrossJsNodeInputName.VALUE0, CrossJsNodeInputName.VALUE1][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
}
