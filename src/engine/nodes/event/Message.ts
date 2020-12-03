import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class MessageParamsConfig extends NodeParamsConfig {
	alert = ParamConfig.BOOLEAN(0);
	console = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MessageParamsConfig();

export class MessageEventNode extends TypedEventNode<MessageParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'message';
	}
	static readonly OUTPUT = 'output';

	initialize_node() {
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
