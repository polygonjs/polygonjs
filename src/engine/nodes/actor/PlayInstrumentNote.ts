/**
 * Play a note
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PlayInstrumentNoteActorParamsConfig extends NodeParamsConfig {
	/** @param note */
	note = ParamConfig.STRING('');
}
const ParamsConfig = new PlayInstrumentNoteActorParamsConfig();

export class PlayInstrumentNoteActorNode extends TypedActorNode<PlayInstrumentNoteActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playInstrumentNote';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {}
}
