/**
 * Receives multiple events
 *
 * @remarks
 * This is useful when you want to allow an downstream node to be triggered by multiple possible events
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPointType} from '../utils/io/connections/Event';

const OUTPUT_NAME = 'event';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class AnyEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to ensure events are transfered */
	active = ParamConfig.BOOLEAN(1);
	/** @param number of possible events */
	inputsCount = ParamConfig.INTEGER(5, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new AnyEventParamsConfig();

export class AnyEventNode extends TypedEventNode<AnyEventParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'any';
	}
	initializeNode() {
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_input_name_function(this._input_name.bind(this));
		this.io.connection_points.set_output_name_function(() => OUTPUT_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [EventConnectionPointType.BASE]);
	}
	private _expected_input_types() {
		const list: EventConnectionPointType[] = new Array(this.pv.inputsCount);
		list.fill(EventConnectionPointType.BASE);
		return list;
	}
	protected _input_name(index: number) {
		return `trigger${index}`;
	}

	async process_event(event_context: EventContext<Event>) {
		if (this.p.active.isDirty()) {
			await this.p.active.compute();
		}
		if (isBooleanTrue(this.pv.active)) {
			this.dispatch_event_to_output(OUTPUT_NAME, event_context);
		}
	}
}
