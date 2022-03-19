/**
 * only forwards the trigger received if the condition is true
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
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class TriggerFilterActorParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new TriggerFilterActorParamsConfig();

export class TriggerFilterActorNode extends TypedActorNode<TriggerFilterActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerFilter';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const condition = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.condition, context);
		if (condition == true) {
			this.runTrigger(context);
		}
	}
}
