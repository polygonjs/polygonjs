/**
 * Adds a delay to trigger received events
 *
 *
 *
 */
import {TypedEventNode} from './_Base';

const INPUT_NAME = 'in';
const OUTPUT_NAME = 'out';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
class DelayEventParamsConfig extends NodeParamsConfig {
	/** @param delay before dispatching */
	delay = ParamConfig.INTEGER(1000, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new DelayEventParamsConfig();

export class DelayEventNode extends TypedEventNode<DelayEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'delay';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(INPUT_NAME, EventConnectionPointType.BASE, this._process_input.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	private _process_input(event_context: EventContext<Event>) {
		setTimeout(() => {
			this.dispatchEventToOutput(OUTPUT_NAME, event_context);
		}, this.pv.delay);
	}
}
