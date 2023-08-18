import {ObjectNamedFunction3} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Object3D} from 'three';
import {JsDataType} from '../nodes/utils/io/connections/Js';
import {Ref} from '@vue/reactivity';
import {isVector, isColor, isBoolean, isNumber, isString, isArray} from '../../core/Type';
import {ref} from '../../core/reactivity/CoreReactivity';
import {PolyScene} from '../scene/PolyScene';

export interface ActorEvaluatorDebugOptions {
	object3D: Object3D;
	nodePath: string;
	value: JsDataType;
}
export interface DebugLine {
	objectName: string;
	value: JsDataType;
	displayableValue: string;
}

const options: ActorEvaluatorDebugOptions = {
	object3D: new Object3D(),
	nodePath: '',
	value: 0,
};

interface DebugDataController {
	lastProcessedFrameByNodePath: Map<string, number>;
	debugContentByFrameByNodePath: Ref<Record<string, DebugLine[]>>;
	// arrayByNodePath: Map<string, Array<DebugLine>>;
}
const _debugDataController: DebugDataController = {
	lastProcessedFrameByNodePath: new Map(),
	debugContentByFrameByNodePath: ref({}),
	// arrayByNodePath: new Map(),
};
// function _getarrayByNodePath(nodePath: string, controller: DebugDataController) {
// 	let array = controller.arrayByNodePath.get(nodePath);
// 	if (!array) {
// 		array = [];
// 		controller.arrayByNodePath.set(nodePath, array);
// 	}
// 	return array;
// }

function _displayableValue(value: JsDataType): string {
	try {
		if (isBoolean(value) || isString(value)) {
			return `${value}`;
		}
		if (isNumber(value)) {
			return `${value.toFixed(6)}`;
		}

		if (isColor(value)) {
			return value
				.toArray()
				.map((e) => e.toFixed(4))
				.join(', ');
		}
		if (isVector(value)) {
			return value
				.toArray()
				.map((e) => e.toFixed(4))
				.join(', ');
		}

		if (isArray(value)) {
			const firstElement = value[0];
			const firstElementAsString = _displayableValue(firstElement);
			return `[${firstElementAsString},...] (length: ${value.length})`;
		}

		return 'value not displayabled, see dev console';
	} catch (err) {
		console.warn('error trying to display value:', value);
		return '';
	}
}

export function tableContent(debugLines: DebugLine[]) {
	const entries = debugLines.map((debugLine, i) => {
		return {
			objectName: debugLine.objectName,
			value: isVector(debugLine.value) || isColor(debugLine.value) ? debugLine.value.toArray() : debugLine.value,
		};
	});
	return entries;
}
function logBlue(message: string) {
	console.log('%c' + message, 'color:blue; font-weight:bold;');
}
function _flushDebugNode(nodePath: string, debugLines: DebugLine[]) {
	logBlue('------------');
	console.log(`${nodePath}:`);
	console.table(tableContent(debugLines));
	logBlue('------------');
}
function optionsToDebugLines(
	scene: PolyScene,
	options: ActorEvaluatorDebugOptions,
	debugDataController: DebugDataController
) {
	const {object3D, nodePath, value} = options;
	const displayableValue = _displayableValue(value);
	const objectName = object3D.name || 'no name';
	const currentFrame = scene.frame();

	let currentValue = debugDataController.debugContentByFrameByNodePath.value[nodePath];
	if (!currentValue) {
		currentValue = []; //_getarrayByNodePath(nodePath, debugDataController);
		// currentValue.length = 0;
		debugDataController.debugContentByFrameByNodePath.value[nodePath] = currentValue;
	}

	currentValue.push({
		objectName,
		value,
		displayableValue,
	});

	// console.log({options, displayableValue, objectName, currentValue, currentFrame});
	const lastProcessedFrame = debugDataController.lastProcessedFrameByNodePath.get(nodePath) || -1;
	if (!lastProcessedFrame) {
		debugDataController.lastProcessedFrameByNodePath.set(nodePath, lastProcessedFrame);
	}

	if (currentFrame != lastProcessedFrame) {
		// flush for current node
		_flushDebugNode(nodePath, currentValue);
		if (scene.dispatchController.emitAllowed()) {
			scene.dispatchController.actorEvaluatorDebug({nodePath, debugLines: currentValue});
		}
		currentValue.length = 0;

		debugDataController.lastProcessedFrameByNodePath.set(nodePath, currentFrame);
	}

	return currentValue;
}
function _optionsToDebugLines(scene: PolyScene, options: ActorEvaluatorDebugOptions) {
	return optionsToDebugLines(scene, options, _debugDataController);
}

export interface DebugOptions {
	displayValue: boolean;
	displayFrame: boolean;
	displayTime: boolean;
	displayNodePath: boolean;
	message: string;
	bundleByObject: boolean;
}

export class debug<T extends JsDataType> extends ObjectNamedFunction3<[string, T, DebugOptions]> {
	static override type() {
		return 'debug';
	}
	override func(object3D: Object3D, nodePath: string, input: T, debugOptions: DebugOptions): T {
		const messageElements: any[] = [];
		if (debugOptions.displayFrame) {
			messageElements.push(`${this.scene.frame()}`);
		}
		if (debugOptions.displayTime) {
			messageElements.push(`${this.scene.time()}`);
		}
		if (debugOptions.message) {
			messageElements.push(debugOptions.message);
		}
		if (debugOptions.displayNodePath) {
			messageElements.push(nodePath);
		}
		const message = messageElements.join(' ');

		if (debugOptions.bundleByObject) {
			options.object3D = object3D;
			options.nodePath = message;
			options.value = input;

			_optionsToDebugLines(this.scene, options);
		} else {
			if (debugOptions.displayValue) {
				messageElements.push(input);
			}
			console.log(...messageElements);
		}
		return input;
	}
}
