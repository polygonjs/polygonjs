import {Number4} from '../../../types/GlobalTypes';
import {ActorNodeTriggerContext} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {BaseVecToActorNode} from './_ConversionVecTo';

const components_v4 = ['x', 'y', 'z', 'w'];

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

	private _defaultVector4 = new Vector4();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: Vec4ToVec3ActorNodeInputName = Vec4ToVec3ActorNodeInputName.VEC3
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec4 =
			this._inputValue<ActorConnectionPointType.VECTOR4>(Vec4ToVec3ActorNode.INPUT_NAME_VEC4, context) ||
			this._defaultVector4;
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
