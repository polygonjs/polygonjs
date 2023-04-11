import {computed, ref, watch} from '../../core/reactivity/CoreReactivity';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/Evaluator';
import {NamedFunction3} from './_Base';

export enum PerformanceChangeEvent {
	aboveThreshold = 'aboveThreshold',
	belowThreshold = 'belowThreshold',
}
export const PERFORMANCE_CHANGE_EVENTS: PerformanceChangeEvent[] = [
	PerformanceChangeEvent.aboveThreshold,
	PerformanceChangeEvent.belowThreshold,
];
type CallbackByPerformanceEvent = Record<PerformanceChangeEvent, Function>;

export class onPerformanceChange extends NamedFunction3<[number, CallbackByPerformanceEvent, ActorEvaluator]> {
	static override type() {
		return 'onPerformanceChange';
	}
	func(threshold: number, callbacks: CallbackByPerformanceEvent, evaluator: ActorEvaluator): void {
		const performanceRef = this.scene.perfMonitor.ref();

		const watchFallsBelow = () => {
			const isAboveThresholdRef = ref(true);
			const _isBelowThreshold = computed(() => performanceRef.value < threshold);

			const stopWatch1 = watch(_isBelowThreshold, () => {
				if (_isBelowThreshold.value == true) {
					isAboveThresholdRef.value = false;
				}
			});
			const stopWatch2 = watch(isAboveThresholdRef, () => {
				callbacks.belowThreshold();
			});

			evaluator.onDispose(() => {
				stopWatch1();
				stopWatch2();
			});
		};

		const watchFallsAbove = () => {
			const isBelowThresholdRef = ref(true);
			const _isAboveThreshold = computed(() => performanceRef.value > threshold);

			const stopWatch1 = watch(_isAboveThreshold, (newVal, oldVal) => {
				if (_isAboveThreshold.value == true) {
					isBelowThresholdRef.value = false;
				}
			});
			const stopWatch2 = watch(isBelowThresholdRef, () => {
				callbacks.aboveThreshold();
			});

			evaluator.onDispose(() => {
				stopWatch1();
				stopWatch2();
			});
		};

		watchFallsBelow();
		watchFallsAbove();
	}
}
