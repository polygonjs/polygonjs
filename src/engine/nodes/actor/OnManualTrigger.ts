/**
 * sends a trigger from a button param
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseNodeType} from '../_Base';

class OnManualTriggerActorParamsConfig extends NodeParamsConfig {
	trigger = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			OnManualTriggerActorNode.PARAM_CALLBACK_sendTrigger(node as OnManualTriggerActorNode);
		},
	});
}
const ParamsConfig = new OnManualTriggerActorParamsConfig();

export class OnManualTriggerActorNode extends TypedActorNode<OnManualTriggerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'onManualTrigger';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	static PARAM_CALLBACK_sendTrigger(node: OnManualTriggerActorNode) {
		node._triggerWithNode();
	}

	private _triggerWithNode() {
		this.scene().actorsManager.manualTriggerController.setNodeToRunTriggerFrom(this);
	}
}
