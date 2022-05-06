/**
 * Allows to trigger drag events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_DRAG_EVENT_TYPES} from '../../scene/utils/events/DragEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EVENT_EMITTERS, CoreEventEmitter} from '../../viewers/utils/ViewerEventsController';
import {EventInputType} from '../../poly/registers/nodes/types/Event';
class DragEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			DragEventNode.PARAM_CALLBACK_updateRegister(node as DragEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		menu: {
			entries: EVENT_EMITTERS.map((name, value) => {
				return {name, value};
			}),
		},
		separatorAfter: true,
	});
	/** @param toggle on to listen to dragover events */
	dragover = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param requires ctrlKey */
	ctrlKey = ParamConfig.BOOLEAN(0, {...EVENT_PARAM_OPTIONS, separatorBefore: true});
	/** @param requires altKey */
	altKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires shiftKey */
	shiftKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param requires metaKey */
	metaKey = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new DragEventParamsConfig();

export class DragEventNode extends TypedInputEventNode<DragEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return EventInputType.DRAG;
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_DRAG_EVENT_TYPES.map((n) => `${n}`));
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_DRAG_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.DRAG);
			})
		);
	}
	override processEvent(event_context: EventContext<DragEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		const event = event_context.event;
		if (event.ctrlKey != isBooleanTrue(this.pv.ctrlKey)) {
			return;
		}
		if (event.shiftKey != isBooleanTrue(this.pv.shiftKey)) {
			return;
		}
		if (event.altKey != isBooleanTrue(this.pv.altKey)) {
			return;
		}
		if (event.metaKey != isBooleanTrue(this.pv.metaKey)) {
			return;
		}

		this.dispatchEventToOutput(event_context.event.type, event_context);
	}
}
