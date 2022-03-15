/**
 * sends a trigger when the scene is back at the start frame
 *
 *
 */

import {ActorNodeTriggerContext, BaseActorNodeType, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

class OnEventSceneResetActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnEventSceneResetActorParamsConfig();

export class OnEventSceneResetActorNode extends TypedActorNode<OnEventSceneResetActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_SCENE_RESET;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	override runTrigger(context: ActorNodeTriggerContext) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(0);
		if (!triggerConnections) {
			return;
		}
		triggerConnections.forEach((triggerConnection) => {
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}
}
