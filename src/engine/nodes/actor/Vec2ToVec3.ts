import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Number2} from '../../../types/GlobalTypes';
import {ParamType} from '../../poly/ParamType';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
import {BaseVecToActorNode} from './_ConversionVecTo';
const components_v2 = ['x', 'y'];
const tmpV3 = new Vector3();

enum Vec2ToVec3ActorNodeOutputName {
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
			new ActorConnectionPoint(Vec2ToVec3ActorNodeOutputName.VEC3, ActorConnectionPointType.VECTOR3),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR2, Vec2ToVec3ActorNode.INPUT_NAME_VEC2, components_v2.map((c) => 0) as Number2);
		this.addParam(ParamType.FLOAT, Vec2ToVec3ActorNode.INPUT_NAME_Z, 0);
	}

	private _defaultVector2 = new Vector2();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec2 =
			this._inputValue<ActorConnectionPointType.VECTOR2>(Vec2ToVec3ActorNode.INPUT_NAME_VEC2, context) ||
			this._defaultVector2;
		const z = this._inputValue<ActorConnectionPointType.FLOAT>(Vec2ToVec3ActorNode.INPUT_NAME_Z, context) || 0;
		tmpV3.set(vec2.x, vec2.y, z);
		return tmpV3;
	}
}
