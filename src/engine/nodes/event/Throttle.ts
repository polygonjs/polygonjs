/**
 * Throttles input events
 *
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {TypedEventNode} from './_Base';
import throttle from 'lodash-es/throttle';
import {DebouncedFunc} from 'lodash-es';
import {BaseNodeType} from '../_Base';

const callbackOption = {
	callback: (node: BaseNodeType) => {
		ThrottleEventNode.PARAM_CALLBACK_resetDebouncedFunc(node as ThrottleEventNode);
	},
};

class ThrottleEventParamsConfig extends NodeParamsConfig {
	/** @param max time between each event */
	time = ParamConfig.INTEGER(100, {
		range: [0, 1000],
		rangeLocked: [true, false],
		...callbackOption,
	});
	/** @param defines if event is dispatched on the leading edge of the timeout */
	leading = ParamConfig.BOOLEAN(true, callbackOption);
	/** @param defines if event is trailing on the leading edge of the timeout */
	trailing = ParamConfig.BOOLEAN(true, callbackOption);
}
const ParamsConfig = new ThrottleEventParamsConfig();

export class ThrottleEventNode extends TypedEventNode<ThrottleEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'throttle';
	}
	static readonly OUTPUT_NAME = 'output';

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(ThrottleEventNode.OUTPUT_NAME, EventConnectionPointType.BASE),
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
		const {leading, trailing, time} = this.pv;
		const func = () => {
			if (this._lastEventContextReceived) {
				this.dispatchEventToOutput(ThrottleEventNode.OUTPUT_NAME, this._lastEventContextReceived);
			}
		};
		return throttle(func, time, {leading, trailing});
	}
	private _resetDebouncedFunc() {
		this._debouncedFunc = undefined;
	}

	static PARAM_CALLBACK_resetDebouncedFunc(node: ThrottleEventNode) {
		node._resetDebouncedFunc();
	}
}
