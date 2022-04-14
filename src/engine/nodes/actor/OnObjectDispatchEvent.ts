/**
 * sends a trigger when the listened object dispatches an event
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
class OnObjectDispatchEventActorParamsConfig extends NodeParamsConfig {
	/** @param event name */
	eventName = ParamConfig.STRING('my-event');
}
const ParamsConfig = new OnObjectDispatchEventActorParamsConfig();

export class OnObjectDispatchEventActorNode extends TypedActorNode<OnObjectDispatchEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'onObjectDispatchEvent';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		const eventName = this._inputValueFromParam<ParamType.STRING>(this.p.eventName, context);
		Object3D.addEventListener(eventName, () => {
			this.runTrigger(context);
		});
	}
}
