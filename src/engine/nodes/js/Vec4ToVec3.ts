/**
 * converts a vector4 to a vector3
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Vector3} from 'three';
import {Poly} from '../../Poly';
import {PrimitiveArray, VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';

type AllowedType = JsConnectionPointType.VECTOR4 | JsConnectionPointType.VECTOR4_ARRAY;
const ALLOWED_TYPES: AllowedType[] = [JsConnectionPointType.VECTOR4, JsConnectionPointType.VECTOR4_ARRAY];
enum OutputName {
	Vector3 = 'Vector3',
	w = 'w',
}
class Vec4ToVec3ParamsJsConfig extends NodeParamsConfig {
	Vector4 = ParamConfig.VECTOR4([0, 0, 0, 0]);
}
const ParamsConfig_Vec4ToVec3 = new Vec4ToVec3ParamsJsConfig();
export class Vec4ToVec3JsNode extends TypedJsNode<Vec4ToVec3ParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec4ToVec3;
	static override type() {
		return 'vec4ToVec3';
	}
	// static readonly INPUT_NAME_VEC4 = 'vec4';
	// static readonly OUTPUT_NAME_VEC3 = 'vec3';
	// static readonly OUTPUT_NAME_W = 'w';

	override initializeNode() {
		// this.io.outputs.setNamedOutputConnectionPoints([
		// 	new JsConnectionPoint(OutputName.vec3, JsConnectionPointType.VECTOR3),
		// 	new JsConnectionPoint(OutputName.w, JsConnectionPointType.FLOAT),
		// ]);

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	_expectedInputName(index: number): string {
		return this._expectedInputTypes()[0];
	}
	_expectedOutputName(index: number): string {
		return [OutputName.Vector3, OutputName.w][index];
	}

	protected _expectedInputTypes(): AllowedType[] {
		const firstInputType = this.io.connection_points.first_input_connection_type();
		const type =
			firstInputType != null && ALLOWED_TYPES.includes(firstInputType as AllowedType)
				? (firstInputType as AllowedType)
				: JsConnectionPointType.VECTOR4;
		return [type];
	}
	protected _expectedOutputTypes() {
		const firstInputTypes = this._expectedInputTypes()[0];
		switch (firstInputTypes) {
			case JsConnectionPointType.VECTOR4_ARRAY: {
				return [JsConnectionPointType.VECTOR3_ARRAY, JsConnectionPointType.FLOAT_ARRAY];
			}
			default: {
				return [JsConnectionPointType.VECTOR3, JsConnectionPointType.FLOAT];
			}
		}
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const firstType = this._expectedInputTypes()[0];
		switch (firstType) {
			case JsConnectionPointType.VECTOR4: {
				return this._setLinesAsVector4(shadersCollectionController);
			}
			case JsConnectionPointType.VECTOR4_ARRAY: {
				return this._setLinesAsVector4Array(shadersCollectionController);
			}
		}
	}

	private _setLinesAsVector4(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const vec4 = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const _v3 = (propertyName: OutputName, functionName: 'sizzleVec4XYZ', type: JsConnectionPointType) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(vec4, varName),
				},
			]);
		};
		const _f = (propertyName: OutputName, type: JsConnectionPointType) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: `${vec4}.w`,
				},
			]);
		};

		_v3(OutputName.Vector3, 'sizzleVec4XYZ', JsConnectionPointType.VECTOR3);
		_f(OutputName.w, JsConnectionPointType.FLOAT);
	}

	private _setLinesAsVector4Array(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const vec4 = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const _v3 = (propertyName: OutputName, functionName: 'sizzleVec4XYZArray', type: JsConnectionPointType) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new VectorArray([new Vector3()]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(vec4, varName),
				},
			]);
		};
		const _f = (propertyName: OutputName, functionName: 'sizzleVec4WArray', type: JsConnectionPointType) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new PrimitiveArray([0]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(vec4, varName),
				},
			]);
		};

		_v3(OutputName.Vector3, 'sizzleVec4XYZArray', JsConnectionPointType.VECTOR3_ARRAY);
		_f(OutputName.w, 'sizzleVec4WArray', JsConnectionPointType.FLOAT_ARRAY);
	}
}
