/**
 * sends a trigger when the scene plays or pauses
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

class OnScenePlayStateActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnScenePlayStateActorParamsConfig();

export class OnScenePlayStateActorNode extends TypedActorNode<OnScenePlayStateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_SCENE_PLAY_STATE;
	}

	static OUTPUT_NAME_PLAY = `${TRIGGER_CONNECTION_NAME}Play`;
	static OUTPUT_NAME_PAUSE = `${TRIGGER_CONNECTION_NAME}Pause`;
	static OUTPUT_TRIGGER_NAMES = [this.OUTPUT_NAME_PLAY, this.OUTPUT_NAME_PAUSE];

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			OnScenePlayStateActorNode.OUTPUT_TRIGGER_NAMES.map(
				(triggerName) => new ActorConnectionPoint(triggerName, ActorConnectionPointType.TRIGGER)
			)
		);
	}
}
