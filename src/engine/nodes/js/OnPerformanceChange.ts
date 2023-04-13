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

import {BaseJsNodeType, TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
// import {triggerableMethodCalls} from './code/assemblers/actor/ActorAssemblerUtils';
import {InitFunctionJsDefinition, TriggeringJsDefinition} from './utils/JsDefinition';
import {PerformanceChangeEvent, PERFORMANCE_CHANGE_EVENTS} from '../../functions/_Performance';
import {
	getConnectedOutputNodes,
	getOutputIndices,
	nodeMethodName,
	triggerInputIndex,
} from './code/assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../core/SetUtils';
import {EvaluatorMethodName} from './code/assemblers/actor/Evaluator';
// enum OnPerformanceChangeOutputName {
// 	aboveThreshold = 'threshold',
// 	performance = 'performance',
// }

function _outputName(eventName: PerformanceChangeEvent) {
	return `${TRIGGER_CONNECTION_NAME}${eventName}`;
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

	static OUTPUT_NAME_ABOVE = _outputName(PerformanceChangeEvent.aboveThreshold);
	static OUTPUT_NAME_BELOW = _outputName(PerformanceChangeEvent.belowThreshold);
	// static OUTPUT_TRIGGER_NAMES = [this.OUTPUT_NAME_ABOVE, this.OUTPUT_NAME_BELOW];

	override initializeNode() {
		// this.io.connection_points.spare_params.setInputlessParamNames(['threshold', 'delay']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OnPerformanceChangeJsNode.OUTPUT_NAME_ABOVE, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(OnPerformanceChangeJsNode.OUTPUT_NAME_BELOW, JsConnectionPointType.TRIGGER),
			// new JsConnectionPoint(OnPerformanceChangeOutputName.aboveThreshold, JsConnectionPointType.BOOLEAN),
			// new JsConnectionPoint(OnPerformanceChangeOutputName.performance, JsConnectionPointType.FLOAT),
		]);
	}

	override setTriggeringLines(
		shadersCollectionController: ShadersCollectionController,
		triggeredMethods: string
	): void {
		const listeners: Record<PerformanceChangeEvent, string> = {
			[PerformanceChangeEvent.aboveThreshold]: '',
			[PerformanceChangeEvent.belowThreshold]: '',
		};
		PERFORMANCE_CHANGE_EVENTS.forEach((eventName) => {
			const triggeredMethods = triggerMethod(this, _outputName(eventName));

			const _nodeMethodName = nodeMethodName(this, _outputName(eventName));
			listeners[eventName] = `this.${_nodeMethodName}.bind(this)`;

			// const gatherable = options?.gatherable != null ? options.gatherable : false;
			// const triggeringMethodName =
			// 	options?.triggeringMethodName != null ? options.triggeringMethodName : (node.type() as EvaluatorMethodName);

			const value = triggeredMethods; //triggeringLines.join('\n');//
			// const varName = videoEvent; //nodeMethodName(node); //.wrappedBodyLinesMethodName();
			const dataType = JsConnectionPointType.BOOLEAN; // unused
			// if (!EVALUATOR_METHOD_NAMES.includes(triggeringMethodName as EvaluatorMethodName)) {
			// 	console.warn(`method '${triggeringMethodName}' is not included`);
			// }
			shadersCollectionController.addDefinitions(this, [
				new TriggeringJsDefinition(this, shadersCollectionController, dataType, _nodeMethodName, value, {
					triggeringMethodName: eventName as any as EvaluatorMethodName,
					gatherable: false,
					nodeMethodName: _nodeMethodName,
				}),
			]);
		});

		const threshold = this.variableForInputParam(shadersCollectionController, this.p.threshold);
		const func = Poly.namedFunctionsRegister.getFunction('onPerformanceChange', this, shadersCollectionController);
		const bodyLine = func.asString(threshold, JSON.stringify(listeners).replace(/\"/g, ''), `this`);
		shadersCollectionController.addDefinitions(this, [
			new InitFunctionJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.OBJECT_3D,
				this.path(),
				bodyLine
			),
		]);

		// shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
		// 	gatherable: true,
		// });
	}

	// initOnPlay() {
	// 	this._currentPerfAboveThreshold = undefined;
	// 	this.scene().perfMonitor.addThreshold(this.pv.threshold);
	// }
	// disposeOnPause() {
	// 	this.scene().perfMonitor.reset();
	// }

	// protected _currentPerfAboveThreshold: boolean | undefined;
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

function triggerMethod(node: OnPerformanceChangeJsNode, outputName: string): string {
	const outputIndex = getOutputIndices(node, (c) => c.name() == outputName)[0];
	const triggerableNodes = new Set<BaseJsNodeType>();
	getConnectedOutputNodes({
		node,
		triggerOutputIndices: [outputIndex],
		triggerableNodes,
		recursive: false,
	});
	const triggerableMethodNames = SetUtils.toArray(triggerableNodes).map((triggerableNode) => {
		const argIndex = triggerInputIndex(node, triggerableNode);
		const m = nodeMethodName(triggerableNode);
		return `this.${m}(${argIndex})`;
	});
	return `${triggerableMethodNames.join(';')}`;
}
