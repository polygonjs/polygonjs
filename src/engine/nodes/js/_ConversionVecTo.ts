import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {TypedJsNode} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Vector2, Vector3} from 'three';
import {sizzleVec3XY, sizzleVec4XYZ, vec2ToVec3, vec3ToVec4} from './js/conversion';

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
			const body_lines: string[] = [];

			const vec = this.variableForInput(shadersCollectionController, 'vec');

			this.io.outputs.used_output_names().forEach((c) => {
				const var_name = this.jsVarName(c);
				body_lines.push(`const ${var_name} = ${vec}.${c}`);
			});
			shadersCollectionController.addBodyLines(this, body_lines);
		}
	};
}

const components_v2 = ['x', 'y'];
const components_v3 = ['x', 'y', 'z'];
const components_v4 = ['x', 'y', 'z', 'w'];

export class Vec2ToFloatJsNode extends VecToJsFactory('vec2ToFloat', {
	components: ['x', 'y'],
	param_type: ParamType.VECTOR2,
}) {}
export class Vec3ToFloatJsNode extends VecToJsFactory('vec3ToFloat', {
	components: ['x', 'y', 'z'],
	param_type: ParamType.VECTOR3,
}) {}
export class Vec4ToFloatJsNode extends VecToJsFactory('vec4ToFloat', {
	components: components_v4,
	param_type: ParamType.VECTOR4,
}) {}

export class Vec4ToVec3JsNode extends BaseVecToJsNode {
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
	override createParams() {
		this.addParam(ParamType.VECTOR4, Vec4ToVec3JsNode.INPUT_NAME_VEC4, components_v4.map((c) => 0) as Number4);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const body_lines: string[] = [];

		const in_vec4 = Vec4ToVec3JsNode.INPUT_NAME_VEC4;
		const out_vec3 = Vec4ToVec3JsNode.OUTPUT_NAME_VEC3;
		const out_w = Vec4ToVec3JsNode.OUTPUT_NAME_W;
		const vec = this.variableForInput(shadersCollectionController, in_vec4);

		const used_output_names = this.io.outputs.used_output_names();

		if (used_output_names.indexOf(out_vec3) >= 0) {
			const out = this.jsVarName(out_vec3);
			shadersCollectionController.addVariable(this, out, new Vector3());
			const func = new sizzleVec4XYZ(this, shadersCollectionController);
			body_lines.push(`${func.asString(vec, out)}`);
			// const var_name = this.jsVarName(out_vec3);
			// body_lines.push(`vec3 ${var_name} = ${vec}.xyz`);
		}
		if (used_output_names.indexOf(out_w) >= 0) {
			const var_name = this.jsVarName(out_w);
			body_lines.push(`const ${var_name} = ${vec}.w`);
		}
		shadersCollectionController.addBodyLines(this, body_lines);
	}
}

export class Vec3ToVec2JsNode extends BaseVecToJsNode {
	static override type() {
		return 'vec3ToVec2';
	}
	static readonly INPUT_NAME_VEC3 = 'vec3';
	static readonly OUTPUT_NAME_VEC2 = 'vec2';
	static readonly OUTPUT_NAME_Z = 'z';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec3ToVec2JsNode.OUTPUT_NAME_VEC2, JsConnectionPointType.VECTOR2),
			new JsConnectionPoint(Vec3ToVec2JsNode.OUTPUT_NAME_Z, JsConnectionPointType.FLOAT),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToVec2JsNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const body_lines: string[] = [];

		const in_vec3 = Vec3ToVec2JsNode.INPUT_NAME_VEC3;
		const out_vec2 = Vec3ToVec2JsNode.OUTPUT_NAME_VEC2;
		const out_z = Vec3ToVec2JsNode.OUTPUT_NAME_Z;
		const vec = this.variableForInput(shadersCollectionController, in_vec3);

		const used_output_names = this.io.outputs.used_output_names();

		if (used_output_names.indexOf(out_vec2) >= 0) {
			const out = this.jsVarName(out_vec2);
			shadersCollectionController.addVariable(this, out, new Vector2());
			const func = new sizzleVec3XY(this, shadersCollectionController);
			body_lines.push(`${func.asString(vec, out)}`);
		}
		if (used_output_names.indexOf(out_z) >= 0) {
			const var_name = this.jsVarName(out_z);
			body_lines.push(`const ${var_name} = ${vec}.z`);
		}
		shadersCollectionController.addBodyLines(this, body_lines);
	}
}
export class Vec2ToVec3JsNode extends BaseVecToJsNode {
	static override type() {
		return 'vec2ToVec3';
	}
	static readonly INPUT_NAME_VEC2 = 'vec2';
	static readonly INPUT_NAME_Z = 'z';
	static readonly OUTPUT_NAME_VEC3 = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec2ToVec3JsNode.OUTPUT_NAME_VEC3, JsConnectionPointType.VECTOR3),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR2, Vec2ToVec3JsNode.INPUT_NAME_VEC2, components_v2.map((c) => 0) as Number2);
		this.addParam(ParamType.FLOAT, Vec2ToVec3JsNode.INPUT_NAME_Z, 0);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		// const body_lines: string[] = [];

		const in_vec2 = Vec2ToVec3JsNode.INPUT_NAME_VEC2;
		const in_z = Vec2ToVec3JsNode.INPUT_NAME_Z;
		const out_vec3 = Vec2ToVec3JsNode.OUTPUT_NAME_VEC3;
		const vec2 = this.variableForInput(shadersCollectionController, in_vec2);
		const z = this.variableForInput(shadersCollectionController, in_z);

		const varName = this.jsVarName(out_vec3);

		shadersCollectionController.addVariable(this, varName, new Vector2());
		const func = new vec2ToVec3(this, shadersCollectionController);
		// body_lines.push(`${func.asString(vec2, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		shadersCollectionController.addBodyOrComputed(
			this,
			JsConnectionPointType.VECTOR3,
			varName,
			func.asString(vec2, z, varName)
		);
	}
}
export class Vec3ToVec4JsNode extends BaseVecToJsNode {
	static override type() {
		return 'vec3ToVec4';
	}
	static readonly INPUT_NAME_VEC3 = 'vec3';
	static readonly INPUT_NAME_W = 'w';
	static readonly OUTPUT_NAME_VEC4 = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(Vec3ToVec4JsNode.OUTPUT_NAME_VEC4, JsConnectionPointType.VECTOR4),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToVec4JsNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
		this.addParam(ParamType.FLOAT, Vec3ToVec4JsNode.INPUT_NAME_W, 0);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const body_lines: string[] = [];

		const in_vec3 = Vec3ToVec4JsNode.INPUT_NAME_VEC3;
		const in_w = Vec3ToVec4JsNode.INPUT_NAME_W;
		const out_vec4 = Vec3ToVec4JsNode.OUTPUT_NAME_VEC4;
		const vec3 = this.variableForInput(shadersCollectionController, in_vec3);
		const w = this.variableForInput(shadersCollectionController, in_w);

		const varName = this.jsVarName(out_vec4);

		shadersCollectionController.addVariable(this, varName, new Vector2());
		const func = new vec3ToVec4(this, shadersCollectionController);

		body_lines.push(`${func.asString(vec3, w, varName)}`);
		// body_lines.push(`vec4 ${var_name} = vec4(${vec3}.xyz, ${w})`);

		shadersCollectionController.addBodyLines(this, body_lines);
	}
}
