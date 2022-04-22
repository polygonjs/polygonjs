import {Vector4} from 'three';
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

	private _defaultVector3 = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const vec3 =
			this._inputValue<ActorConnectionPointType.VECTOR3>(Vec3ToVec4ActorNode.INPUT_NAME_VEC3, context) ||
			this._defaultVector3;
		const w = this._inputValue<ActorConnectionPointType.FLOAT>(Vec3ToVec4ActorNode.INPUT_NAME_W, context) || 0;
		tmpV4.set(vec3.x, vec3.y, vec3.z, w);
		return tmpV4;
	}
}
