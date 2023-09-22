/**
 * Sequences output nodes one after the other.
 *
 * @remarks
 * This can be useful to ensure a specific order of events.
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPointType} from '../utils/io/connections/Event';

const INPUT_NAME = 'trigger';
// const OUTPUTS_COUNT = 10;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PassEventParamsConfig extends NodeParamsConfig {
	/** @param number of possible outputs */
	outputsCount = ParamConfig.INTEGER(5, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PassEventParamsConfig();

export class SequenceEventNode extends TypedEventNode<PassEventParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'sequence';
	}
	override initializeNode() {
		// this.io.inputs.setNamedInputConnectionPoints([
		// 	new EventConnectionPoint(INPUT_NAME, EventConnectionPointType.BASE),
		// ]);
		this.io.connection_points.set_input_name_function(() => INPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => [EventConnectionPointType.BASE]);

		// const list: EventConnectionPoint<EventConnectionPointType>[] = new Array(OUTPUTS_COUNT);
		// for (let i = 0; i < OUTPUTS_COUNT; i++) {
		// 	list[i] = new EventConnectionPoint(`trigger${i}`, EventConnectionPointType.BASE);
		// }
		// this.io.outputs.setNamedOutputConnectionPoints(list);
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_output_name_function(this._output_name.bind(this));
	}
	private _expected_output_types() {
		const list: EventConnectionPointType[] = new Array(this.pv.outputsCount);
		list.fill(EventConnectionPointType.BASE);
		return list;
	}
	protected _output_name(index: number) {
		return `out${index}`;
	}

	override processEvent(event_context: EventContext<Event>) {
		const connectionPoints = this.io.outputs.namedOutputConnectionPoints();
		if (!connectionPoints) {
			return;
		}
		for (const connectionPoint of connectionPoints) {
			this.dispatchEventToOutput(connectionPoint.name(), event_context);
		}
	}
}
