/**
 * Allows to trigger pointer events.
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ACCEPTED_POINTER_EVENT_TYPES} from '../../scene/utils/events/PointerEventsController';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
class PointerEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			PointerEventNode.PARAM_CALLBACK_update_register(node as PointerEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
	/** @param toggle on to listen to click events */
	pointerdown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to pointermove events */
	pointermove = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
	/** @param toggle on to listen to pointerup events */
	pointerup = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new PointerEventParamsConfig();

export class PointerEventNode extends TypedInputEventNode<PointerEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'pointer';
	}
	protected accepted_event_types() {
		return ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`);
	}
	initialize_node() {
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_POINTER_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.POINTER);
			})
		);
	}
}
