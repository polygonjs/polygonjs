/**
 * dispatches the received trigger in 1 of the 2 outputs depending on the condition
 *
 *
 *
 */
import {ParamType} from '../../poly/ParamType';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class TriggerTwoWaySwitchActorParamsConfig extends NodeParamsConfig {
	/** @param condition */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new TriggerTwoWaySwitchActorParamsConfig();

export class TriggerTwoWaySwitchActorNode extends TypedActorNode<TriggerTwoWaySwitchActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerTwoWaySwitch';
	}

	static OUTPUT_NAME_IF_TRUE = `${TRIGGER_CONNECTION_NAME}IfTrue`;
	static OUTPUT_NAME_IF_FALSE = `${TRIGGER_CONNECTION_NAME}IfFalse`;

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				TriggerTwoWaySwitchActorNode.OUTPUT_NAME_IF_TRUE,
				ActorConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				TriggerTwoWaySwitchActorNode.OUTPUT_NAME_IF_FALSE,
				ActorConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const condition = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.condition, context);
		if (condition) {
			this.runTrigger(context, 0);
		} else {
			this.runTrigger(context, 1);
		}
	}
}
