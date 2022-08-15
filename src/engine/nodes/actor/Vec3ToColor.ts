/**
 * converts a vector3 to a color
 *
 *
 */
import {Vector3, Color} from 'three';
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

enum Vec3ToColorActorNodeOutputName {
	COLOR = 'Color',
}
const tmpColor = new Color();
export class Vec3ToColorActorNode extends BaseVecToActorNode {
	static override type() {
		return 'vec3ToColor';
	}
	static readonly INPUT_NAME_VEC3 = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(Vec3ToColorActorNodeOutputName.COLOR, ActorConnectionPointType.COLOR),
		]);
	}
	override createParams() {
		this.addParam(ParamType.VECTOR3, Vec3ToColorActorNode.INPUT_NAME_VEC3, components_v3.map((c) => 0) as Number3);
	}

	private _defaultVector3 = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: Vec3ToColorActorNodeOutputName = Vec3ToColorActorNodeOutputName.COLOR
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const vec3 =
			this._inputValue<ActorConnectionPointType.VECTOR3>(Vec3ToColorActorNode.INPUT_NAME_VEC3, context) ||
			this._defaultVector3;

		tmpColor.r = vec3.x;
		tmpColor.g = vec3.y;
		tmpColor.b = vec3.z;
		return tmpColor;
	}
}
