import {Vector2} from 'three';
import {Vector3} from 'three';
import {Number3} from '../../../types/GlobalTypes';
import {ParamType} from '../../poly/ParamType';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
import {BaseVecToActorNode} from './_ConversionVecTo';

const components_v3 = ['x', 'y', 'z'];

enum Vec3ToVec2ActorNodeOutputName {
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
			new ActorConnectionPoint(Vec3ToVec2ActorNodeOutputName.VEC2, ActorConnectionPointType.VECTOR2),
			new ActorConnectionPoint(Vec3ToVec2ActorNodeOutputName.Z, ActorConnectionPointType.FLOAT),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToVec2ActorNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
	}

	private _defaultVector3 = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: Vec3ToVec2ActorNodeOutputName = Vec3ToVec2ActorNodeOutputName.VEC2
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const vec3 =
			this._inputValue<ActorConnectionPointType.VECTOR3>(Vec3ToVec2ActorNode.INPUT_NAME_VEC3, context) ||
			this._defaultVector3;
		switch (outputName) {
			case Vec3ToVec2ActorNodeOutputName.VEC2: {
				tmpV2.set(vec3.x, vec3.y);
				return tmpV2;
			}
			case Vec3ToVec2ActorNodeOutputName.Z: {
				return vec3.z;
			}
		}
	}
}
