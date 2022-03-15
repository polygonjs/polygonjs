/**
 * sends a trigger from a button param
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseNodeType} from '../_Base';

class ManualTriggerActorParamsConfig extends NodeParamsConfig {
	trigger = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ManualTriggerActorNode.PARAM_CALLBACK_sendTrigger(node as ManualTriggerActorNode);
		},
	});
}
const ParamsConfig = new ManualTriggerActorParamsConfig();

export class ManualTriggerActorNode extends TypedActorNode<ManualTriggerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'manualTrigger';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	static PARAM_CALLBACK_sendTrigger(node: ManualTriggerActorNode) {
		node._triggerWithNode();
	}

	private _triggerWithNode() {
		this.scene().actorsManager.manualActorTriggers.triggerWithNode(this);
	}
}
