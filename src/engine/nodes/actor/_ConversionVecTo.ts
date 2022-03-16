import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

class VecToParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new VecToParamsConfig();
class BaseVecToActorNode extends TypedActorNode<VecToParamsConfig> {
	override paramsConfig = ParamsConfig;
}

interface VecToGlOptions {
	components: string[];
	param_type: ParamType;
}

function VecToActorFactory(type: string, options: VecToGlOptions): typeof BaseVecToActorNode {
	const components = options.components;
	const param_type = options.param_type;
	return class VecToActorNode extends BaseVecToActorNode {
		static override type() {
			return type;
		}
		private _inputVecName() {
			return `vec${components.length}`;
		}

		override initializeNode() {
			this.io.outputs.setNamedOutputConnectionPoints(
				components.map((c) => {
					return new ActorConnectionPoint(c, ActorConnectionPointType.FLOAT);
				})
			);
		}
		override createParams() {
			this.addParam(param_type, this._inputVecName(), components.map((c) => 0) as Number2);
		}

		public override outputValue(
			context: ActorNodeTriggerContext,
			outputName: Vector4Component = 'x'
		): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
			const vec4 = this._inputValue<ActorConnectionPointType.VECTOR4>(this._inputVecName(), context);
			return vec4[outputName] as number;
		}
	};
}

type Vector2Component = 'x' | 'y';
type Vector3Component = Vector2Component | 'z';
type Vector4Component = Vector3Component | 'w';
const components_v2 = ['x', 'y'];
const components_v3 = ['x', 'y', 'z'];
const components_v4 = ['x', 'y', 'z', 'w'];

export class Vec2ToFloatActorNode extends VecToActorFactory('vec2ToFloat', {
	components: ['x', 'y'],
	param_type: ParamType.VECTOR2,
}) {}
export class Vec3ToFloatActorNode extends VecToActorFactory('vec3ToFloat', {
	components: ['x', 'y', 'z'],
	param_type: ParamType.VECTOR3,
}) {}
export class Vec4ToFloatActorNode extends VecToActorFactory('vec4ToFloat', {
	components: components_v4,
	param_type: ParamType.VECTOR4,
}) {}

enum Vec4ToVec3ActorNodeInputName {
	VEC3 = 'Vector3',
	W = 'w',
}
const tmpV3 = new Vector3();
export class Vec4ToVec3ActorNode extends BaseVecToActorNode {
	static override type() {
		return 'vec4ToVec3';
	}
	static readonly INPUT_NAME_VEC4 = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(Vec4ToVec3ActorNodeInputName.VEC3, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(Vec4ToVec3ActorNodeInputName.W, ActorConnectionPointType.FLOAT),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR4, Vec4ToVec3ActorNode.INPUT_NAME_VEC4, components_v4.map((c) => 0) as Number4);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: Vec4ToVec3ActorNodeInputName = Vec4ToVec3ActorNodeInputName.VEC3
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec4 = this._inputValue<ActorConnectionPointType.VECTOR4>(Vec4ToVec3ActorNode.INPUT_NAME_VEC4, context);
		switch (outputName) {
			case Vec4ToVec3ActorNodeInputName.VEC3: {
				tmpV3.set(vec4.x, vec4.y, vec4.z);
				return tmpV3;
			}
			case Vec4ToVec3ActorNodeInputName.W: {
				return vec4.w;
			}
		}
	}
}

enum Vec3ToVec2ActorNodeInputName {
	VEC2 = 'Vector2',
	Z = 'z',
}
const tmpV2 = new Vector2();
export class Vec3ToVec2ActorNode extends BaseVecToActorNode {
	static override type() {
		return 'vec3ToVec2';
	}
	static readonly INPUT_NAME_VEC3 = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(Vec3ToVec2ActorNodeInputName.VEC2, ActorConnectionPointType.VECTOR2),
			new ActorConnectionPoint(Vec3ToVec2ActorNodeInputName.Z, ActorConnectionPointType.FLOAT),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToVec2ActorNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: Vec3ToVec2ActorNodeInputName = Vec3ToVec2ActorNodeInputName.VEC2
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec3 = this._inputValue<ActorConnectionPointType.VECTOR3>(Vec3ToVec2ActorNode.INPUT_NAME_VEC3, context);
		switch (outputName) {
			case Vec3ToVec2ActorNodeInputName.VEC2: {
				tmpV2.set(vec3.x, vec3.y);
				return tmpV2;
			}
			case Vec3ToVec2ActorNodeInputName.Z: {
				return vec3.z;
			}
		}
		return -1;
	}
}

enum Vec3ToVec2ActorNodeInputName {
	VEC3 = 'Vector3',
}
export class Vec2ToVec3ActorNode extends BaseVecToActorNode {
	static override type() {
		return 'vec2ToVec3';
	}
	static readonly INPUT_NAME_VEC2 = 'vec2';
	static readonly INPUT_NAME_Z = 'z';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(Vec3ToVec2ActorNodeInputName.VEC3, ActorConnectionPointType.VECTOR3),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR2, Vec2ToVec3ActorNode.INPUT_NAME_VEC2, components_v2.map((c) => 0) as Number2);
		this.addParam(ParamType.FLOAT, Vec2ToVec3ActorNode.INPUT_NAME_Z, 0);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec2 = this._inputValue<ActorConnectionPointType.VECTOR2>(Vec2ToVec3ActorNode.INPUT_NAME_VEC2, context);
		const z = this._inputValue<ActorConnectionPointType.FLOAT>(Vec2ToVec3ActorNode.INPUT_NAME_Z, context);
		tmpV3.set(vec2.x, vec2.y, z);
		return tmpV3;
	}
}

const tmpV4 = new Vector4();
export class Vec3ToVec4ActorNode extends BaseVecToActorNode {
	static override type() {
		return 'vec3ToVec4';
	}
	static readonly INPUT_NAME_VEC3 = 'vec3';
	static readonly INPUT_NAME_W = 'w';
	static readonly OUTPUT_NAME_VEC4 = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(Vec3ToVec4ActorNode.OUTPUT_NAME_VEC4, ActorConnectionPointType.VECTOR4),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToVec4ActorNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
		this.addParam(ParamType.FLOAT, Vec3ToVec4ActorNode.INPUT_NAME_W, 0);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec3 = this._inputValue<ActorConnectionPointType.VECTOR3>(Vec3ToVec4ActorNode.INPUT_NAME_VEC3, context);
		const w = this._inputValue<ActorConnectionPointType.FLOAT>(Vec3ToVec4ActorNode.INPUT_NAME_W, context);
		tmpV4.set(vec3.x, vec3.y, vec3.z, w);
		return tmpV4;
	}
}
