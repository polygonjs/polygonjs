/**
 * sends a trigger from a button param
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseNodeType} from '../_Base';

class OnEventManualTriggerActorParamsConfig extends NodeParamsConfig {
	trigger = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			OnEventManualTriggerActorNode.PARAM_CALLBACK_sendTrigger(node as OnEventManualTriggerActorNode);
		},
	});
}
const ParamsConfig = new OnEventManualTriggerActorParamsConfig();

export class OnEventManualTriggerActorNode extends TypedActorNode<OnEventManualTriggerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'onEventManualTrigger';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	static PARAM_CALLBACK_sendTrigger(node: OnEventManualTriggerActorNode) {
		node._triggerWithNode();
	}

	private _triggerWithNode() {
		this.scene().actorsManager.manualActorTriggers.setNodeToRunTriggerFrom(this);
	}
}
