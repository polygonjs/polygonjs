/**
 * Allows to trigger touch events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_TOUCH_EVENT_TYPES} from '../../scene/utils/events/TouchEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EVENT_EMITTERS, CoreEventEmitter} from '../../viewers/utils/EventsController';
class TouchEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			TouchEventNode.PARAM_CALLBACK_updateRegister(node as TouchEventNode);
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

	/** @param toggle on to listen to touchstart events */
	touchstart = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to touchmove events */
	touchmove = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to touchend events */
	touchend = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new TouchEventParamsConfig();

export class TouchEventNode extends TypedInputEventNode<TouchEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'touch';
	}
	protected acceptedEventTypes() {
		return ACCEPTED_TOUCH_EVENT_TYPES.map((n) => `${n}`);
	}
	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_TOUCH_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.DRAG);
			})
		);
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				const params = [this.p.touchstart, this.p.touchmove, this.p.touchend];
				this.params.label.init(params, () => {
					return params
						.map((p) => {
							return p.value ? p.name() : undefined;
						})
						.filter((v) => v)
						.join(', ');
				});
			});
		});
	}
	processEvent(event_context: EventContext<TouchEvent>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}
		this.dispatchEventToOutput(event_context.event.type, event_context);
	}
}
