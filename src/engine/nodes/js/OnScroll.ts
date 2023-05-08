/**
 * sends a trigger on scroll
 *
 *
 */

import {BaseJsNodeType, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {SCROLL_EVENTS, ScrollEvent, CreateScrollTriggerOptionsSerialized} from '../../functions/_Scroll';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {InitFunctionJsDefinition, RefJsDefinition, TriggeringJsDefinition} from './utils/JsDefinition';
import {Poly} from '../../Poly';
import {
	getConnectedOutputNodes,
	getOutputIndices,
	nodeMethodName,
	triggerInputIndex,
} from './code/assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../core/SetUtils';
import {EvaluatorMethodName} from './code/assemblers/actor/ActorEvaluator';

export enum OnScrollInputName {
	attribName = 'attribName',
}
export enum OnScrollOutputName {
	progress = 'progress',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnScrollJsParamsConfig extends NodeParamsConfig {
	element = ParamConfig.STRING('#checkpoint1');
	useViewport = ParamConfig.BOOLEAN(false);
	scroller = ParamConfig.STRING('#scroll-container', {
		visibleIf: {
			useViewport: false,
		},
	});
	displayMarkers = ParamConfig.BOOLEAN(false);
}
const ParamsConfig = new OnScrollJsParamsConfig();

export class OnScrollJsNode extends TypedJsNode<OnScrollJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_SCROLL;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			...SCROLL_EVENTS.map((triggerName) => new JsConnectionPoint(triggerName, JsConnectionPointType.TRIGGER)),
			new JsConnectionPoint(OnScrollOutputName.progress, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(OnScrollOutputName.progress)) {
			this._addProgressRef(linesController);
		}
		if (usedOutputNames.length > 0) {
			this._addCreateScrollListenerLines(linesController);
		}
	}

	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string): void {
		this._addCreateScrollListenerLines(linesController);
	}
	private _addCreateScrollListenerLines(linesController: JsLinesCollectionController) {
		const element = this.variableForInputParam(linesController, this.p.element);
		const scroller = this.variableForInputParam(linesController, this.p.scroller);
		const useViewport = this.variableForInputParam(linesController, this.p.useViewport);
		const displayMarkers = this.variableForInputParam(linesController, this.p.displayMarkers);

		const outProgress = this._addProgressRef(linesController);

		const listeners: Record<ScrollEvent, string> = {
			[ScrollEvent.onUpdate]: '',
			[ScrollEvent.onToggle]: '',
			[ScrollEvent.onEnter]: '',
			[ScrollEvent.onLeave]: '',
			[ScrollEvent.onEnterBack]: '',
			[ScrollEvent.onLeaveBack]: '',
		};
		const createOptions: CreateScrollTriggerOptionsSerialized = {
			element,
			useViewport,
			scroller,
			displayMarkers,
			nodePath: `'${this.path()}'`,
		};
		SCROLL_EVENTS.forEach((eventName) => {
			const triggeredMethods = triggerMethod(this, eventName);

			const _nodeMethodName = nodeMethodName(this, eventName);
			listeners[eventName] = `this.${_nodeMethodName}.bind(this)`;

			const value = triggeredMethods;
			const dataType = JsConnectionPointType.BOOLEAN; // unused
			linesController.addDefinitions(this, [
				new TriggeringJsDefinition(this, linesController, dataType, _nodeMethodName, value, {
					triggeringMethodName: eventName as any as EvaluatorMethodName,
					gatherable: false,
					nodeMethodName: _nodeMethodName,
				}),
			]);
		});

		const func = Poly.namedFunctionsRegister.getFunction('createScrollListener', this, linesController);
		const bodyLine = func.asString(
			shallowJSONStringify(createOptions),
			JSON.stringify(listeners).replace(/\"/g, ''),
			`this`,
			`this.${outProgress}`
		);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);
	}
	private _addProgressRef(linesController: JsLinesCollectionController) {
		const outProgress = this.jsVarName(OnScrollOutputName.progress);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.FLOAT, outProgress, `0`),
		]);
		return outProgress;
	}
}

function triggerMethod(node: OnScrollJsNode, outputName: string): string {
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

function shallowJSONStringify(options: CreateScrollTriggerOptionsSerialized) {
	const keys = Object.keys(options);
	const values: string[] = keys.map((key) => `${key}:${(options as any)[key]}`);
	return `{${values}}`;
}
// function trimLeftRight(str: string) {
// 	return str.substring(1, str.length - 1);
// }
