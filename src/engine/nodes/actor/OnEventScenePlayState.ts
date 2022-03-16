/**
 * sends a trigger when the scene plays or pauses
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

class OnEventScenePlayStateActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnEventScenePlayStateActorParamsConfig();

export class OnEventScenePlayStateActorNode extends TypedActorNode<OnEventScenePlayStateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_SCENE_PLAY_STATE;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(`${TRIGGER_CONNECTION_NAME}Play`, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint(`${TRIGGER_CONNECTION_NAME}Pause`, ActorConnectionPointType.TRIGGER),
		]);
	}
}
