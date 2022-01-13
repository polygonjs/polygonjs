/**
 * Allows to trigger window events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_WINDOW_EVENT_TYPES} from '../../scene/utils/events/WindowEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
class WindowEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			WindowEventNode.PARAM_CALLBACK_updateRegister(node as WindowEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(0, {
		hidden: true,
	});
	/** @param toggle on to listen to resize events */
	resize = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new WindowEventParamsConfig();

export class WindowEventNode extends TypedInputEventNode<WindowEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'window';
	}
	protected acceptedEventTypes() {
		return new Set(ACCEPTED_WINDOW_EVENT_TYPES.map((n) => `${n}`));
	}
	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			ACCEPTED_WINDOW_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.POINTER);
			})
		);
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				const params = [this.p.resize];
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
	processEvent(event_context: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		if (!event_context.event) {
			return;
		}

		this.dispatchEventToOutput(event_context.event.type, event_context);
	}
}
