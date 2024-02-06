/**
 * Sets a limit to how many events can be processed.
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';

enum LimitEventInput {
	TRIGGER = 'trigger',
	RESET = 'reset',
}
enum LimitEventOutput {
	OUT = 'out',
	LAST = 'last',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../../core/event/EventContextType';
class LimitEventParamsConfig extends NodeParamsConfig {
	/** @param max number of events that can be processed */
	maxCount = ParamConfig.INTEGER(5, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param resets the count */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LimitEventNode.PARAM_CALLBACK_reset(node as LimitEventNode);
		},
	});
}
const ParamsConfig = new LimitEventParamsConfig();

export class LimitEventNode extends TypedEventNode<LimitEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'limit';
	}

	private _processCount: number = 0;
	private _lastDispatched: boolean = false;
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				LimitEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this.processEventTrigger.bind(this)
			),
			new EventConnectionPoint(
				LimitEventInput.RESET,
				EventConnectionPointType.BASE,
				this.processEventReset.bind(this)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(LimitEventOutput.OUT, EventConnectionPointType.BASE),
			new EventConnectionPoint(LimitEventOutput.LAST, EventConnectionPointType.BASE),
		]);
	}

	override processEvent(eventContext: EventContext<Event>) {}

	private processEventTrigger(eventContext: EventContext<Event>) {
		if (this._processCount < this.pv.maxCount) {
			this._processCount += 1;
			this.dispatchEventToOutput(LimitEventOutput.OUT, eventContext);
		} else {
			if (!this._lastDispatched) {
				this._lastDispatched = true;
				this.dispatchEventToOutput(LimitEventOutput.LAST, eventContext);
			}
		}
	}
	private processEventReset(eventContext: EventContext<Event>) {
		this._processCount = 0;
		this._lastDispatched = false;
	}

	static PARAM_CALLBACK_reset(node: LimitEventNode) {
		node.processEventReset({});
	}
}
