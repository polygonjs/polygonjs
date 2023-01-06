/**
 * gets the ray from a camera
 *
 * @remarks
 *
 * the parameter x and y should be in the [-1,1] range
 *
 * x = 0, y = 0  : canvas center
 * x = -1, y = -1: bottom left corner
 * x = -1, y = 1 : top left corner
 * x = 1, y = -1 : bottom right corner
 * x = 1, y = 1  : top right corner
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {OrthographicCamera, PerspectiveCamera, Raycaster, Vector2} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
const raycaster = new Raycaster();
const rayPosition = new Vector2();

class RayFromCameraActorParamsConfig extends NodeParamsConfig {
	/** @param x position in screen space  */
	x = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
	/** @param y position in screen space */
	y = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
}
const ParamsConfig = new RayFromCameraActorParamsConfig();
export class RayFromCameraActorNode extends TypedActorNode<RayFromCameraActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.RAY_FROM_CAMERA;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.CAMERA,
				ActorConnectionPointType.CAMERA,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.RAY, ActorConnectionPointType.RAY),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.RAY] | undefined {
		const camera =
			this._inputValue<ActorConnectionPointType.CAMERA>(ActorConnectionPointType.CAMERA, context) ||
			context.Object3D;

		if (camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera) {
			rayPosition.set(this.pv.x, this.pv.y);
			raycaster.setFromCamera(rayPosition, camera);
		}
		return raycaster.ray;
	}
}
