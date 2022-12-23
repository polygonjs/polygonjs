/**
 * Projects this vector from world space into the camera's normalized device coordinate (NDC) space.
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
class NearestPositionActorParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new NearestPositionActorParamsConfig();
export class NearestPositionActorNode extends TypedActorNode<NearestPositionActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'nearestPosition';
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
				ActorConnectionPointType.VECTOR3_ARRAY,
				ActorConnectionPointType.VECTOR3_ARRAY,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v3 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.Vector3, context);
		const positions = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
			ActorConnectionPointType.VECTOR3_ARRAY,
			context
		);
		if (positions) {
			let currentDist = -1;
			let minDist: number | null = null;
			let nearestPosition: Vector3 | undefined;
			for (let position of positions) {
				currentDist = position.distanceTo(v3);
				if (minDist == null || currentDist < minDist) {
					nearestPosition = position;
					minDist = currentDist;
				}
			}
			if (nearestPosition != null) {
				tmpV3.copy(nearestPosition);
			}
		}

		return tmpV3;
	}
}
