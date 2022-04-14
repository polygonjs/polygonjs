/**
 * sends a trigger when the viewer taps or clicks anywhere
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnPointerUpActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnPointerUpActorParamsConfig();

export class OnPointerUpActorNode extends BaseUserInputActorNode<OnPointerUpActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_POINTER_UP;
	}
	userInputEventNames() {
		return ['pointerup'];
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		this.runTrigger(context);
	}
}
