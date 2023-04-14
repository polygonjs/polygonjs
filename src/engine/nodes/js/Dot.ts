/**
 * returns the dot product between 2 vectors
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {isJsConnectionPointArray, JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';

enum DotJsNodeInputName {
	VALUE0 = 'v0',
	VALUE1 = 'v1',
}
const DefaultValues: PolyDictionary<number> = {
	[DotJsNodeInputName.VALUE0]: 1,
	[DotJsNodeInputName.VALUE1]: 1,
};
const OUTPUT_NAME = 'val';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [JsConnectionPointType.VECTOR2, JsConnectionPointType.VECTOR3];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.VECTOR2: {
			return 'dotVector2';
		}
		case JsConnectionPointType.VECTOR3: {
			return 'dotVector3';
		}
	}
}

export class DotJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'dot';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const value0 = this.variableForInput(shadersCollectionController, DotJsNodeInputName.VALUE0);
		const value1 = this.variableForInput(shadersCollectionController, DotJsNodeInputName.VALUE1);
		const varName = this.jsVarName(this._expectedOutputName(0));
		const inputType = this._expectedInputTypes()[0];

		if (isJsConnectionPointArray(inputType)) {
			// only create a variable if the input is an array
			const variable = createVariable(inputType);
			if (variable) {
				shadersCollectionController.addVariable(this, varName, variable);
			}
		}

		// color / vector
		const functionName = functionNameByType(inputType);
		if (functionName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{dataType: inputType, varName, value: func.asString(value0, value1)},
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
		const outputType = isJsConnectionPointArray(inputType)
			? JsConnectionPointType.FLOAT_ARRAY
			: JsConnectionPointType.FLOAT;
		return [outputType];
	}
	protected _expectedInputName(index: number) {
		return [DotJsNodeInputName.VALUE0, DotJsNodeInputName.VALUE1][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
}
