/**
 * sends a trigger when the performance goes below a threshold
 *
 * @remarks
 *
 * The performance is a number that goes from 0 to 1.
 *
 * It is calculated like this: `performance = current FPS / desired FPS`.
 *
 * Therefore, a performance of 1 means that the scene is running smoothly.
 *
 * A performance of 0.5 means it is quite choppy. (around 30fps, if the desired fps is 60)
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
enum OnPerformanceChangeOutputName {
	aboveThreshold = 'threshold',
	performance = 'performance',
}

class OnPerformanceChangeJsParamsConfig extends NodeParamsConfig {
	threshold = ParamConfig.FLOAT(0.8, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	// delay = ParamConfig.INTEGER(3000, {
	// 	range: [0, 5000],
	// 	rangeLocked: [true, false],
	// });
}
const ParamsConfig = new OnPerformanceChangeJsParamsConfig();

export class OnPerformanceChangeJsNode extends TypedJsNode<OnPerformanceChangeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_PERFORMANCE_CHANGE;
	}
	override isTriggering() {
		return true;
	}

	static OUTPUT_NAME_ABOVE = `${TRIGGER_CONNECTION_NAME}aboveThreshold`;
	static OUTPUT_NAME_BELOW = `${TRIGGER_CONNECTION_NAME}belowThreshold`;
	static OUTPUT_TRIGGER_NAMES = [this.OUTPUT_NAME_ABOVE, this.OUTPUT_NAME_BELOW];

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['threshold', 'delay']);
		this.io.outputs.setNamedOutputConnectionPoints([
			...OnPerformanceChangeJsNode.OUTPUT_TRIGGER_NAMES.map(
				(triggerName) => new JsConnectionPoint(triggerName, JsConnectionPointType.TRIGGER)
			),
			new JsConnectionPoint(OnPerformanceChangeOutputName.aboveThreshold, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(OnPerformanceChangeOutputName.performance, JsConnectionPointType.FLOAT),
		]);
	}
	initOnPlay() {
		this._currentPerfAboveThreshold = undefined;
		this.scene().perfMonitor.addThreshold(this.pv.threshold);
	}
	disposeOnPause() {
		this.scene().perfMonitor.reset();
	}

	protected _currentPerfAboveThreshold: boolean | undefined;
	// private _lastChangeAt: number | undefined;
	// runTriggerIfRequired(context: JsNodeTriggerContext) {
	// 	// const now = performance.now();
	// 	// if (this._lastChangeAt != null && now - this._lastChangeAt < this.pv.delay) {
	// 	// 	return;
	// 	// }
	// 	const perf = this.scene().perfMonitor.performance();
	// 	const perfAboveThreshold = perf > this.pv.threshold;

	// 	if (perfAboveThreshold != this._currentPerfAboveThreshold) {
	// 		this._currentPerfAboveThreshold = perfAboveThreshold;
	// 		// this._lastChangeAt = now;
	// 		const outputIndex = OnPerformanceChangeJsNode.OUTPUT_TRIGGER_NAMES.indexOf(
	// 			perfAboveThreshold
	// 				? OnPerformanceChangeJsNode.OUTPUT_NAME_ABOVE
	// 				: OnPerformanceChangeJsNode.OUTPUT_NAME_BELOW
	// 		);
	// 		this.runTrigger(context, outputIndex);
	// 	}
	// }

	// public override outputValue(
	// 	context: JsNodeTriggerContext,
	// 	outputName: OnPerformanceChangeOutputName
	// ): boolean | number {
	// 	const perf = this.scene().perfMonitor.performance();
	// 	switch (outputName) {
	// 		case OnPerformanceChangeOutputName.aboveThreshold: {
	// 			return this._currentPerfAboveThreshold || true;
	// 		}
	// 		case OnPerformanceChangeOutputName.performance: {
	// 			return perf;
	// 		}
	// 	}
	// 	TypeAssert.unreachable(outputName);
	// }
}
