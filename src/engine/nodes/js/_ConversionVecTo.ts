import {Number2} from '../../../types/GlobalTypes';
import {TypedJsNode} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {ShadersCollectionController, ComputedValueJsDefinitionData} from './code/utils/ShadersCollectionController';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {Poly} from '../../Poly';

class VecToParamsJsConfig extends NodeParamsConfig {}
const ParamsConfig = new VecToParamsJsConfig();
class BaseVecToJsNode extends TypedJsNode<VecToParamsJsConfig> {
	override paramsConfig = ParamsConfig;
}

interface VecToJsOptions {
	components: string[];
	param_type: ParamType;
}

function VecToJsFactory(type: string, options: VecToJsOptions): typeof BaseVecToJsNode {
	const components = options.components;
	const param_type = options.param_type;

	return class VecToJsNode extends BaseVecToJsNode {
		static override type() {
			return type;
		}

		override initializeNode() {
			this.io.outputs.setNamedOutputConnectionPoints(
				components.map((c) => {
					return new JsConnectionPoint(c, JsConnectionPointType.FLOAT);
				})
			);
		}
		override createParams() {
			this.addParam(param_type, 'vec', components.map((c) => 0) as Number2);
		}

		override setLines(shadersCollectionController: ShadersCollectionController) {
			// const body_lines: string[] = [];

			const vec = this.variableForInput(shadersCollectionController, 'vec');

			this.io.outputs.used_output_names().forEach((c) => {
				const varName = this.jsVarName(c);
				// body_lines.push(`const ${varName} = ${vec}.${c}`);
				shadersCollectionController.addBodyOrComputed(this, [
					{
						dataType: JsConnectionPointType.FLOAT,
						varName,
						value: `${vec}.${c}`,
					},
				]);
			});
			// shadersCollectionController.addBodyOrComputed(this, body_lines);
		}
	};
}

const components_v2 = ['x', 'y'];
const components_v3 = ['x', 'y', 'z'];
const components_v4 = ['x', 'y', 'z', 'w'];

export class Vec2ToFloatJsNode extends VecToJsFactory('vec2ToFloat', {
	components: components_v2,
	param_type: ParamType.VECTOR2,
}) {}
export class Vec3ToFloatJsNode extends VecToJsFactory('vec3ToFloat', {
	components: components_v3,
	param_type: ParamType.VECTOR3,
}) {}
export class Vec4ToFloatJsNode extends VecToJsFactory('vec4ToFloat', {
	components: components_v4,
	param_type: ParamType.VECTOR4,
}) {}

//
//
// Vector4 -> Vector3
//
//
class Vec4ToVec3ParamsJsConfig extends NodeParamsConfig {
	vec4 = ParamConfig.VECTOR4([0, 0, 0, 0]);
}
const ParamsConfig_Vec4ToVec3 = new Vec4ToVec3ParamsJsConfig();
export class Vec4ToVec3JsNode extends TypedJsNode<Vec4ToVec3ParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec4ToVec3;
	static override type() {
		return 'vec4ToVec3';
	}
	static readonly INPUT_NAME_VEC4 = 'vec4';
	static readonly OUTPUT_NAME_VEC3 = 'vec3';
	static readonly OUTPUT_NAME_W = 'w';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec4ToVec3JsNode.OUTPUT_NAME_VEC3, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(Vec4ToVec3JsNode.OUTPUT_NAME_W, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		// const body_lines: string[] = [];

		const in_vec4 = Vec4ToVec3JsNode.INPUT_NAME_VEC4;
		const out_vec3 = Vec4ToVec3JsNode.OUTPUT_NAME_VEC3;
		const out_w = Vec4ToVec3JsNode.OUTPUT_NAME_W;
		const vec = this.variableForInput(shadersCollectionController, in_vec4);

		const used_output_names = this.io.outputs.used_output_names();

		if (used_output_names.indexOf(out_vec3) >= 0) {
			const varName = this.jsVarName(out_vec3);
			shadersCollectionController.addVariable(this, varName, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction('sizzleVec4XYZ', this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.VECTOR3,
					varName,
					value: func.asString(vec, varName),
				},
			]);
			// body_lines.push(`${func.asString(vec, out)}`);
			// const var_name = this.jsVarName(out_vec3);
			// body_lines.push(`vec3 ${var_name} = ${vec}.xyz`);
		}
		if (used_output_names.indexOf(out_w) >= 0) {
			const varName = this.jsVarName(out_w);
			// body_lines.push(`const ${var_name} = ${vec}.w`);

			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.FLOAT,
					varName,
					value: `${vec}.w`,
				},
			]);
		}
		// shadersCollectionController.addBodyOrComputed(this, body_lines);
	}
}
//
//
// Vector3 -> Vector2
//
//
class Vec3ToVec2ParamsJsConfig extends NodeParamsConfig {
	vec3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig_Vec3ToVec2 = new Vec3ToVec2ParamsJsConfig();
export class Vec3ToVec2JsNode extends TypedJsNode<Vec3ToVec2ParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec3ToVec2;
	static override type() {
		return 'vec3ToVec2';
	}
	static readonly OUTPUT_NAME_VEC2 = 'vec2';
	static readonly OUTPUT_NAME_Z = 'z';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec3ToVec2JsNode.OUTPUT_NAME_VEC2, JsConnectionPointType.VECTOR2),
			new JsConnectionPoint(Vec3ToVec2JsNode.OUTPUT_NAME_Z, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		const out_vec2 = Vec3ToVec2JsNode.OUTPUT_NAME_VEC2;
		const out_z = Vec3ToVec2JsNode.OUTPUT_NAME_Z;
		const vec = this.variableForInputParam(shadersCollectionController, this.p.vec3);

		const used_output_names = this.io.outputs.used_output_names();

		if (used_output_names.indexOf(out_vec2) >= 0) {
			const varName = this.jsVarName(out_vec2);
			shadersCollectionController.addVariable(this, varName, new Vector2());
			const func = Poly.namedFunctionsRegister.getFunction('sizzleVec3XY', this, shadersCollectionController);
			linesData.push({
				dataType: JsConnectionPointType.VECTOR2,
				varName,
				value: func.asString(vec, varName),
			});
			// body_lines.push(`${func.asString(vec, out)}`);
		}
		if (used_output_names.indexOf(out_z) >= 0) {
			const varName = this.jsVarName(out_z);
			linesData.push({
				dataType: JsConnectionPointType.FLOAT,
				varName,
				value: `${vec}.z`,
			});
			// body_lines.push(`const ${varName} = ${vec}.z`);
		}
		shadersCollectionController.addBodyOrComputed(this, linesData);
	}
}
//
//
// Vector2 -> Vector3
//
//
class Vec2ToVec3ParamsJsConfig extends NodeParamsConfig {
	vec2 = ParamConfig.VECTOR2([0, 0]);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig_Vec2ToVec3 = new Vec2ToVec3ParamsJsConfig();
export class Vec2ToVec3JsNode extends TypedJsNode<Vec2ToVec3ParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec2ToVec3;
	static override type() {
		return 'vec2ToVec3';
	}
	static readonly OUTPUT_NAME_VEC3 = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec2ToVec3JsNode.OUTPUT_NAME_VEC3, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		const out_vec3 = Vec2ToVec3JsNode.OUTPUT_NAME_VEC3;
		const vec2 = this.variableForInputParam(shadersCollectionController, this.p.vec2);
		const z = this.variableForInputParam(shadersCollectionController, this.p.z);

		const varName = this.jsVarName(out_vec3);

		shadersCollectionController.addVariable(this, varName, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('vec2ToVec3', this, shadersCollectionController);
		// body_lines.push(`${func.asString(vec2, z, varName)}`);
		linesData.push({
			dataType: JsConnectionPointType.VECTOR3,
			varName,
			value: func.asString(vec2, z, varName),
		});

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// linesData.push({
		// 	dataType: JsConnectionPointType.VECTOR3,
		// 	varName,
		// 	value: func.asString(vec2, z, varName)
		// })
		shadersCollectionController.addBodyOrComputed(this, linesData);
	}
}

//
//
// Vector3 -> Vector4
//
//
class Vec3ToVec4ParamsJsConfig extends NodeParamsConfig {
	vec3 = ParamConfig.VECTOR3([0, 0, 0]);
	w = ParamConfig.FLOAT(0);
}
const ParamsConfig_Vec3ToVec4 = new Vec3ToVec4ParamsJsConfig();
export class Vec3ToVec4JsNode extends TypedJsNode<Vec3ToVec4ParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec3ToVec4;
	static override type() {
		return 'vec3ToVec4';
	}
	// static readonly INPUT_NAME_VEC3 = 'vec3';
	// static readonly INPUT_NAME_W = 'w';
	static readonly OUTPUT_NAME_VEC4 = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec3ToVec4JsNode.OUTPUT_NAME_VEC4, JsConnectionPointType.VECTOR4),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		// const in_vec3 = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		// const in_w = this.variableForInputParam(shadersCollectionController, this.p.w);
		const out_vec4 = Vec3ToVec4JsNode.OUTPUT_NAME_VEC4;
		const vec3 = this.variableForInputParam(shadersCollectionController, this.p.vec3);
		const w = this.variableForInputParam(shadersCollectionController, this.p.w);

		const varName = this.jsVarName(out_vec4);

		shadersCollectionController.addVariable(this, varName, new Vector4());
		const func = Poly.namedFunctionsRegister.getFunction('vec3ToVec4', this, shadersCollectionController);

		// body_lines.push(`${func.asString(vec3, w, varName)}`);
		linesData.push({
			dataType: JsConnectionPointType.VECTOR4,
			varName,
			value: func.asString(vec3, w, varName),
		});
		// body_lines.push(`vec4 ${var_name} = vec4(${vec3}.xyz, ${w})`);

		shadersCollectionController.addBodyOrComputed(this, linesData);
	}
}

//
//
// Vector3 <-> Color
//
//
class Vec3ToColorParamsJsConfig extends NodeParamsConfig {
	vec3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig_Vec3ToColor = new Vec3ToColorParamsJsConfig();
export class Vec3ToColorJsNode extends TypedJsNode<Vec3ToColorParamsJsConfig> {
	override paramsConfig = ParamsConfig_Vec3ToColor;
	static override type() {
		return 'vec3ToColor';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.COLOR, JsConnectionPointType.COLOR),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		const vec3 = this.variableForInputParam(shadersCollectionController, this.p.vec3);

		const varName = this.jsVarName(JsConnectionPointType.COLOR);

		shadersCollectionController.addVariable(this, varName, new Color());
		const func = Poly.namedFunctionsRegister.getFunction('vec3ToColor', this, shadersCollectionController);

		linesData.push({
			dataType: JsConnectionPointType.COLOR,
			varName,
			value: func.asString(vec3, varName),
		});

		shadersCollectionController.addBodyOrComputed(this, linesData);
	}
}

//
//
// Color <-> Vector3
//
//
class ColorToVec3ParamsJsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([0, 0, 0]);
}
const ParamsConfig_ColorToVec3 = new ColorToVec3ParamsJsConfig();
export class ColorToVec3JsNode extends TypedJsNode<ColorToVec3ParamsJsConfig> {
	override paramsConfig = ParamsConfig_ColorToVec3;
	static override type() {
		return 'colorToVec3';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		const color = this.variableForInputParam(shadersCollectionController, this.p.color);

		const varName = this.jsVarName(JsConnectionPointType.VECTOR3);

		shadersCollectionController.addVariable(this, varName, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('colorToVec3', this, shadersCollectionController);

		linesData.push({
			dataType: JsConnectionPointType.COLOR,
			varName,
			value: func.asString(color, varName),
		});

		shadersCollectionController.addBodyOrComputed(this, linesData);
	}
}
