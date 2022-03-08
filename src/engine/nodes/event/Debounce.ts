/**
 * Throttles input events
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {TypedEventNode} from './_Base';
import debounce from 'lodash/debounce';
import type {DebouncedFunc} from 'lodash';
import {BaseNodeType} from '../_Base';

const callbackOption = {
	callback: (node: BaseNodeType) => {
		DebounceEventNode.PARAM_CALLBACK_resetDebouncedFunc(node as DebounceEventNode);
	},
};

class DebounceEventParamsConfig extends NodeParamsConfig {
	/** @param max wait time between each event, in milliseconds */
	maxwait = ParamConfig.INTEGER(100, {
		range: [0, 1000],
		rangeLocked: [true, false],
		...callbackOption,
	});
	/** @param defines if event is dispatched on the leading edge of the timeout */
	leading = ParamConfig.BOOLEAN(false, callbackOption);
	/** @param defines if event is trailing on the leading edge of the timeout */
	trailing = ParamConfig.BOOLEAN(true, callbackOption);
}
const ParamsConfig = new DebounceEventParamsConfig();

export class DebounceEventNode extends TypedEventNode<DebounceEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'debounce';
	}
	static readonly OUTPUT_NAME = 'output';

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(DebounceEventNode.OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}

	private _debouncedFunc: DebouncedFunc<() => void> | undefined;
	private _lastEventContextReceived: EventContext<Event> | undefined;
	override processEvent(eventContext: EventContext<Event>) {
		this._lastEventContextReceived = eventContext;
		this._debouncedFunc = this._debouncedFunc || this._buildDebouncedFunc();
		this._debouncedFunc();
	}
	private _buildDebouncedFunc() {
		const {leading, trailing, maxwait} = this.pv;
		const func = () => {
			if (this._lastEventContextReceived) {
				this.dispatchEventToOutput(DebounceEventNode.OUTPUT_NAME, this._lastEventContextReceived);
			}
		};
		return debounce(func, maxwait, {leading, trailing});
	}
	private _resetDebouncedFunc() {
		this._debouncedFunc = undefined;
	}

	static PARAM_CALLBACK_resetDebouncedFunc(node: DebounceEventNode) {
		node._resetDebouncedFunc();
	}
}
