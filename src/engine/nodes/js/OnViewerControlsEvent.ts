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
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
// import {triggerableMethodCalls} from './code/assemblers/actor/ActorAssemblerUtils';
import {InitFunctionJsDefinition, TriggeringJsDefinition} from './utils/JsDefinition';
import {
	getConnectedOutputNodes,
	getOutputIndices,
	nodeMethodName,
	triggerInputIndex,
} from './code/assemblers/actor/ActorAssemblerUtils';
import {setToArray} from '../../../core/SetUtils';
import {EvaluatorMethodName} from './code/assemblers/actor/ActorEvaluator';
import {CAMERA_CONTROLS_EVENTS, CameraControlsEvent} from '../../viewers/utils/ViewerControlsController';
// enum OnPerformanceChangeOutputName {
// 	aboveThreshold = 'threshold',
// 	performance = 'performance',
// }

function _outputName(eventName: CameraControlsEvent) {
	return `${TRIGGER_CONNECTION_NAME}${eventName}`;
}

class OnViewerControlsEventJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnViewerControlsEventJsParamsConfig();

export class OnViewerControlsEventJsNode extends TypedJsNode<OnViewerControlsEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_VIEWER_CONTROLS_EVENT;
	}
	override isTriggering() {
		return true;
	}

	static OUTPUT_NAME_START = _outputName(CameraControlsEvent.start);
	static OUTPUT_NAME_END = _outputName(CameraControlsEvent.end);

	override initializeNode() {
		// this.io.connection_points.spare_params.setInputlessParamNames(['threshold', 'delay']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OnViewerControlsEventJsNode.OUTPUT_NAME_START, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(OnViewerControlsEventJsNode.OUTPUT_NAME_END, JsConnectionPointType.TRIGGER),
			// new JsConnectionPoint(OnPerformanceChangeOutputName.aboveThreshold, JsConnectionPointType.BOOLEAN),
			// new JsConnectionPoint(OnPerformanceChangeOutputName.performance, JsConnectionPointType.FLOAT),
		]);
	}

	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string): void {
		const listeners: Record<CameraControlsEvent, string> = {
			[CameraControlsEvent.start]: '',
			[CameraControlsEvent.end]: '',
		};
		CAMERA_CONTROLS_EVENTS.forEach((eventName) => {
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
			linesController.addDefinitions(this, [
				new TriggeringJsDefinition(this, linesController, dataType, _nodeMethodName, value, {
					triggeringMethodName: eventName as any as EvaluatorMethodName,
					gatherable: false,
					nodeMethodName: _nodeMethodName,
				}),
			]);
		});

		const func = Poly.namedFunctionsRegister.getFunction('onViewerControlsEvent', this, linesController);
		const bodyLine = func.asString(JSON.stringify(listeners).replace(/\"/g, ''), `this`);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);
	}
}

function triggerMethod(node: OnViewerControlsEventJsNode, outputName: string): string {
	const outputIndex = getOutputIndices(node, (c) => c.name() == outputName)[0];
	const triggerableNodes = new Set<BaseJsNodeType>();
	getConnectedOutputNodes({
		node,
		triggerOutputIndices: [outputIndex],
		triggerableNodes,
		recursive: false,
	});
	const triggerableMethodNames = setToArray(triggerableNodes, []).map((triggerableNode) => {
		const argIndex = triggerInputIndex(node, triggerableNode);
		const m = nodeMethodName(triggerableNode);
		return `this.${m}(${argIndex})`;
	});
	return `${triggerableMethodNames.join(';')}`;
}
