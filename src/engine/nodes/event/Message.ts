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
import {isBooleanTrue} from '../../../core/BooleanValue';

class MessageParamsConfig extends NodeParamsConfig {
	/** @param toggle on for the message to be displayed in a popup */
	alert = ParamConfig.BOOLEAN(0);
	/** @param toggle on for the message to be printed in the console */
	console = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MessageParamsConfig();

export class MessageEventNode extends TypedEventNode<MessageParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'message';
	}
	static readonly OUTPUT = 'output';

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE, this._process_trigger_event.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(MessageEventNode.OUTPUT, EventConnectionPointType.BASE),
		]);
	}

	private trigger_output(context: EventContext<MouseEvent>) {
		this.dispatchEventToOutput(MessageEventNode.OUTPUT, context);
	}

	private _process_trigger_event(context: EventContext<MouseEvent>) {
		if (isBooleanTrue(this.pv.alert)) {
			alert(context);
		}
		if (isBooleanTrue(this.pv.console)) {
			console.log(this.path(), Date.now(), context);
		}
		this.trigger_output(context);
	}
}
