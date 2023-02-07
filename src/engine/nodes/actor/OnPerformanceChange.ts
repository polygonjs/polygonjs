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

import {TRIGGER_CONNECTION_NAME, TypedActorNode, ActorNodeTriggerContext} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {TypeAssert} from '../../poly/Assert';
enum OnPerformanceChangeOutputName {
	aboveThreshold = 'threshold',
	performance = 'performance',
}

class OnPerformanceChangeActorParamsConfig extends NodeParamsConfig {
	threshold = ParamConfig.FLOAT(0.8, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	// delay = ParamConfig.INTEGER(3000, {
	// 	range: [0, 5000],
	// 	rangeLocked: [true, false],
	// });
}
const ParamsConfig = new OnPerformanceChangeActorParamsConfig();

export class OnPerformanceChangeActorNode extends TypedActorNode<OnPerformanceChangeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_PERFORMANCE_CHANGE;
	}

	static OUTPUT_NAME_ABOVE = `${TRIGGER_CONNECTION_NAME}aboveThreshold`;
	static OUTPUT_NAME_BELOW = `${TRIGGER_CONNECTION_NAME}belowThreshold`;
	static OUTPUT_TRIGGER_NAMES = [this.OUTPUT_NAME_ABOVE, this.OUTPUT_NAME_BELOW];

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['threshold', 'delay']);
		this.io.outputs.setNamedOutputConnectionPoints([
			...OnPerformanceChangeActorNode.OUTPUT_TRIGGER_NAMES.map(
				(triggerName) => new ActorConnectionPoint(triggerName, ActorConnectionPointType.TRIGGER)
			),
			new ActorConnectionPoint(OnPerformanceChangeOutputName.aboveThreshold, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(OnPerformanceChangeOutputName.performance, ActorConnectionPointType.FLOAT),
		]);
	}
	initOnPlay() {
		this._currentPerfAboveThreshold = undefined;
		this.scene().perfMonitor.addThreshold(this.pv.threshold);
	}
	disposeOnPause() {
		this.scene().perfMonitor.reset();
	}

	private _currentPerfAboveThreshold: boolean | undefined;
	// private _lastChangeAt: number | undefined;
	runTriggerIfRequired(context: ActorNodeTriggerContext) {
		// const now = performance.now();
		// if (this._lastChangeAt != null && now - this._lastChangeAt < this.pv.delay) {
		// 	return;
		// }
		const perf = this.scene().perfMonitor.performance();
		const perfAboveThreshold = perf > this.pv.threshold;

		if (perfAboveThreshold != this._currentPerfAboveThreshold) {
			this._currentPerfAboveThreshold = perfAboveThreshold;
			// this._lastChangeAt = now;
			const outputIndex = OnPerformanceChangeActorNode.OUTPUT_TRIGGER_NAMES.indexOf(
				perfAboveThreshold
					? OnPerformanceChangeActorNode.OUTPUT_NAME_ABOVE
					: OnPerformanceChangeActorNode.OUTPUT_NAME_BELOW
			);
			this.runTrigger(context, outputIndex);
		}
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: OnPerformanceChangeOutputName
	): boolean | number {
		const perf = this.scene().perfMonitor.performance();
		switch (outputName) {
			case OnPerformanceChangeOutputName.aboveThreshold: {
				return this._currentPerfAboveThreshold || true;
			}
			case OnPerformanceChangeOutputName.performance: {
				return perf;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
