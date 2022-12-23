/**
 * Converts the vector from world space to this object's local space.
 *
 *
 *
 */
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {ParamType} from '../../poly/ParamType';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'local';
const tmpV3 = new Vector3();
class Object3DWorldToLocalActorParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Object3DWorldToLocalActorParamsConfig();
export class Object3DWorldToLocalActorNode extends TypedActorNode<Object3DWorldToLocalActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'Object3DWorldToLocal';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.VECTOR3,
				ActorConnectionPointType.VECTOR3,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const v3 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.Vector3, context);

		tmpV3.copy(v3);
		Object3D.worldToLocal(tmpV3);
		return tmpV3;
	}
}
