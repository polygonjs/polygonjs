/**
 * outputs a single element from an array
 *
 *
 *
 */
import {
	JsConnectionPointType,
	ARRAY_JS_CONNECTION_TYPES_SET,
	JsConnectionPointTypeFromArrayTypeMap,
	JsConnectionPointTypeArray,
} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {RegisterableVariable, createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';

const ALLOWED_INPUT_TYPES = ARRAY_JS_CONNECTION_TYPES_SET;
enum IndexInput {
	index = 'index', // same as param
}

class ArrayElementJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [0, 9],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ArrayElementJsParamsConfig();

export class ArrayElementJsNode extends TypedJsNode<ArrayElementJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'arrayElement';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): [JsConnectionPointTypeArray, JsConnectionPointType] {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType != null && ALLOWED_INPUT_TYPES.has(firstType as JsConnectionPointTypeArray)
				? (firstType as JsConnectionPointTypeArray)
				: JsConnectionPointType.FLOAT_ARRAY;
		return [type, JsConnectionPointType.INT];
	}

	protected _expectedInputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return [`${type}`, IndexInput.index][index];
	}
	protected _expectedOutputName(index: number): string {
		const type = this._expectedOutputTypes()[0];
		return `${type}`;
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		const outputType = JsConnectionPointTypeFromArrayTypeMap[firstType] || JsConnectionPointType.FLOAT;
		return [outputType];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const firstType = this._expectedInputTypes()[0];
		switch (firstType) {
			case JsConnectionPointType.BOOLEAN_ARRAY:
			case JsConnectionPointType.FLOAT_ARRAY:
			case JsConnectionPointType.INT_ARRAY:
			case JsConnectionPointType.STRING_ARRAY: {
				return this._setLinesAsPrimitive(shadersCollectionController);
			}
			case JsConnectionPointType.COLOR_ARRAY:
			case JsConnectionPointType.MATRIX4_ARRAY:
			case JsConnectionPointType.QUATERNION_ARRAY:
			case JsConnectionPointType.VECTOR2_ARRAY:
			case JsConnectionPointType.VECTOR3_ARRAY:
			case JsConnectionPointType.VECTOR4_ARRAY: {
				return this._setLinesAsVector(shadersCollectionController);
			}
			case JsConnectionPointType.INTERSECTION_ARRAY: {
				return this._setLinesAsIntersection(shadersCollectionController);
			}
			case JsConnectionPointType.TEXTURE_ARRAY: {
				return this._setLinesAsTexture(shadersCollectionController);
			}
		}
	}
	private _setLinesAsPrimitive(shadersCollectionController: ShadersCollectionController) {
		const array = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction(
			'arrayElementPrimitive',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, index),
			},
		]);
	}
	private _setLinesAsVector(shadersCollectionController: ShadersCollectionController) {
		const array = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const elementType = JsConnectionPointTypeFromArrayTypeMap[dataType];
		shadersCollectionController.addVariable(this, varName, createVariable(elementType) as RegisterableVariable);
		const func = Poly.namedFunctionsRegister.getFunction('arrayElementVector', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(array, index, varName),
			},
		]);
	}
	private _setLinesAsIntersection(shadersCollectionController: ShadersCollectionController) {
		console.warn('not implemented');
	}
	private _setLinesAsTexture(shadersCollectionController: ShadersCollectionController) {
		console.warn('not implemented');
	}
}
