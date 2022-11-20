/**
 * forwards the trigger after a delay
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

class TriggerDelayActorParamsConfig extends NodeParamsConfig {
	/** @param delay (in milliseconds) */
	delay = ParamConfig.FLOAT(1000, {
		range: [0, 10000],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TriggerDelayActorParamsConfig();

export class TriggerDelayActorNode extends TypedActorNode<TriggerDelayActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerDelay';
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
		const delay = this._inputValueFromParam<ParamType.FLOAT>(this.p.delay, context);
		setTimeout(() => {
			this.runTrigger(context);
		}, delay);
	}
}
