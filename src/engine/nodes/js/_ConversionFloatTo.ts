import {TypedJsNode} from './_Base';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {Poly} from '../../Poly';

//
//
// Float -> Color
//
//
class FloatToColorJsParamsConfig extends NodeParamsConfig {
	r = ParamConfig.FLOAT(0);
	g = ParamConfig.FLOAT(0);
	b = ParamConfig.FLOAT(0);
}
const ParamsConfig_Color = new FloatToColorJsParamsConfig();
export class FloatToColorJsNode extends TypedJsNode<FloatToColorJsParamsConfig> {
	override paramsConfig = ParamsConfig_Color;
	static override type() {
		return 'floatToColor';
	}
	static readonly OUTPUT_NAME = 'Color';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(FloatToVec3JsNode.OUTPUT_NAME, JsConnectionPointType.COLOR),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		// const bodyLines: string[] = [];

		const r = this.variableForInputParam(shadersCollectionController, this.p.r);
		const g = this.variableForInputParam(shadersCollectionController, this.p.g);
		const b = this.variableForInputParam(shadersCollectionController, this.p.b);

		const out = this.jsVarName(FloatToVec3JsNode.OUTPUT_NAME);

		const tmpVarName = shadersCollectionController.addVariable(this, new Color());
		const func = Poly.namedFunctionsRegister.getFunction('floatToColor', this, shadersCollectionController);
		// bodyLines.push(`${func.asString(x, y, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: func.asString(r, g, b, tmpVarName)},
		]);
	}
}

//
//
// Float -> Vector2
//
//
class FloatToVec2JsParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
}
const ParamsConfig_Vector2 = new FloatToVec2JsParamsConfig();
export class FloatToVec2JsNode extends TypedJsNode<FloatToVec2JsParamsConfig> {
	override paramsConfig = ParamsConfig_Vector2;
	static override type() {
		return 'floatToVec2';
	}
	static readonly OUTPUT_NAME = 'vec2';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(FloatToVec2JsNode.OUTPUT_NAME, JsConnectionPointType.VECTOR2),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		// const bodyLines: string[] = [];

		const x = this.variableForInputParam(shadersCollectionController, this.p.x);
		const y = this.variableForInputParam(shadersCollectionController, this.p.y);

		const varName = this.jsVarName(FloatToVec2JsNode.OUTPUT_NAME);

		const tmpVarName = shadersCollectionController.addVariable(this, new Vector2());
		const func = Poly.namedFunctionsRegister.getFunction('floatToVec2', this, shadersCollectionController);
		// bodyLines.push(`${func.asString(x, y, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(x, y, tmpVarName)},
		]);
	}
}

//
//
// Float -> Vector3
//
//
class FloatToVec3JsParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig_Vector3 = new FloatToVec3JsParamsConfig();
export class FloatToVec3JsNode extends TypedJsNode<FloatToVec3JsParamsConfig> {
	override paramsConfig = ParamsConfig_Vector3;
	static override type() {
		return 'floatToVec3';
	}
	static readonly OUTPUT_NAME = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(FloatToVec3JsNode.OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		// const bodyLines: string[] = [];

		const x = this.variableForInputParam(shadersCollectionController, this.p.x);
		const y = this.variableForInputParam(shadersCollectionController, this.p.y);
		const z = this.variableForInputParam(shadersCollectionController, this.p.z);

		const out = this.jsVarName(FloatToVec3JsNode.OUTPUT_NAME);

		const tmpVarName = shadersCollectionController.addVariable(this, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('floatToVec3', this, shadersCollectionController);
		// bodyLines.push(`${func.asString(x, y, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: func.asString(x, y, z, tmpVarName)},
		]);
	}
}

//
//
// Float -> Vector4
//
//
class FloatToVec4JsParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
	w = ParamConfig.FLOAT(0);
}
const ParamsConfig_Vector4 = new FloatToVec4JsParamsConfig();
export class FloatToVec4JsNode extends TypedJsNode<FloatToVec4JsParamsConfig> {
	override paramsConfig = ParamsConfig_Vector4;
	static override type() {
		return 'floatToVec4';
	}
	static readonly OUTPUT_NAME = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(FloatToVec3JsNode.OUTPUT_NAME, JsConnectionPointType.VECTOR4),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		// const bodyLines: string[] = [];

		const x = this.variableForInputParam(shadersCollectionController, this.p.x);
		const y = this.variableForInputParam(shadersCollectionController, this.p.y);
		const z = this.variableForInputParam(shadersCollectionController, this.p.z);
		const w = this.variableForInputParam(shadersCollectionController, this.p.w);

		const varName = this.jsVarName(FloatToVec3JsNode.OUTPUT_NAME);

		const tmpVarName = shadersCollectionController.addVariable(this, new Vector4());
		const func = Poly.namedFunctionsRegister.getFunction('floatToVec4', this, shadersCollectionController);
		// bodyLines.push(`${func.asString(x, y, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(x, y, z, w, tmpVarName)},
		]);
	}
}
