/**
 * sends a trigger on every frame
 *
 *
 */

import {ActorNodeTriggerContext, BaseActorNodeType, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

class OnEventTickActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnEventTickActorParamsConfig();

export class OnEventTickActorNode extends TypedActorNode<OnEventTickActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_TICK;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint('time', ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint('delta', ActorConnectionPointType.FLOAT),
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
