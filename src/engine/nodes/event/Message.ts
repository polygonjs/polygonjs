/**
 * Prints a message to the console or a popup.
 *
 * @remarks
 * This can be useful to debug events
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class MessageParamsConfig extends NodeParamsConfig {
	/** @param toggle on for the message to be displayed in a popup */
	alert = ParamConfig.BOOLEAN(0);
	/** @param toggle on for the message to be printed in the console */
	console = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MessageParamsConfig();

export class MessageEventNode extends TypedEventNode<MessageParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'message';
	}
	static readonly OUTPUT = 'output';

	initializeNode() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE, this._process_trigger_event.bind(this)),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(MessageEventNode.OUTPUT, EventConnectionPointType.BASE),
		]);
	}

	trigger_output(context: EventContext<MouseEvent>) {
		this.dispatch_event_to_output(MessageEventNode.OUTPUT, context);
	}

	private _process_trigger_event(context: EventContext<MouseEvent>) {
		if (this.pv.alert) {
			alert(context);
		}
		if (this.pv.console) {
			console.log(context);
		}
		this.trigger_output(context);
	}
}
