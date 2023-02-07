/**
 * sends a trigger when the mapbox camera starts moving
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

class OnMapboxCameraMoveStartActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnMapboxCameraMoveStartActorParamsConfig();

export class OnMapboxCameraMoveStartActorNode extends TypedActorNode<OnMapboxCameraMoveStartActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_MAPBOX_CAMERA_MOVE_START;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}
}
