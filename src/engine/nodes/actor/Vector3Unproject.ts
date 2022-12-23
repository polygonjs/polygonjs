/**
 * Projects this vector from the camera's normalized device coordinate (NDC) space into world space.
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

const OUTPUT_NAME = 'position';
const tmpV3 = new Vector3();
class Vector3UnprojectActorParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3UnprojectActorParamsConfig();
export class Vector3UnprojectActorNode extends TypedActorNode<Vector3UnprojectActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3Unproject';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.VECTOR3,
				ActorConnectionPointType.VECTOR3,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.CAMERA,
				ActorConnectionPointType.CAMERA,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v3 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.Vector3, context);
		const camera =
			this._inputValue<ActorConnectionPointType.CAMERA>(ActorConnectionPointType.CAMERA, context) ||
			this.scene().root().mainCameraController.dummyPerspectiveCamera();
		tmpV3.copy(v3);
		tmpV3.unproject(camera);
		return tmpV3;
	}
}
