import {ObjectNamedFunction2} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Object3D} from 'three';
import {ActorEvaluatorDebugOptions} from '../scene/utils/DispatchController';
import {JsDataType} from '../nodes/utils/io/connections/Js';
import {Ref} from '@vue/reactivity';
import {CoreType} from '../../core/Type';
import {ref} from '../../core/reactivity/CoreReactivity';
import {PolyScene} from '../scene/PolyScene';

const options: ActorEvaluatorDebugOptions = {
	object3D: new Object3D(),
	nodePath: '',
	value: 0,
};

export interface DebugLine {
	objectName: string;
	value: JsDataType;
	displayableValue: string;
}

interface DebugDataController {
	lastProcessedFrame: number;
	debugContentByFrameByNodePath: Ref<Record<string, DebugLine[]>>;
	arrayByNodePath: Map<string, Array<DebugLine>>;
}
const _debugDataController: DebugDataController = {
	lastProcessedFrame: -1,
	debugContentByFrameByNodePath: ref({}),
	arrayByNodePath: new Map(),
};
function _getarrayByNodePath(nodePath: string, controller: DebugDataController) {
	let array = controller.arrayByNodePath.get(nodePath);
	if (!array) {
		array = [];
		controller.arrayByNodePath.set(nodePath, array);
	}
	return array;
}

function _displayableValue(value: JsDataType): string {
	try {
		if (CoreType.isBoolean(value) || CoreType.isString(value)) {
			return `${value}`;
		}
		if (CoreType.isNumber(value)) {
			return `${value.toFixed(6)}`;
		}

		if (CoreType.isColor(value)) {
			return value
				.toArray()
				.map((e) => e.toFixed(4))
				.join(', ');
		}
		if (CoreType.isVector(value)) {
			return value
				.toArray()
				.map((e) => e.toFixed(4))
				.join(', ');
		}

		if (CoreType.isArray(value)) {
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

function _flushDebugNode(nodePath: string, debugLines: DebugLine[]) {
	logBlue('------------');
	console.log(`${nodePath}:`);
	console.table(tableContent(debugLines));
	logBlue('------------');
}
export function optionsToDebugLines(
	scene: PolyScene,
	options: ActorEvaluatorDebugOptions,
	debugDataController: DebugDataController
) {
	const currentFrame = scene.frame();
	if (currentFrame != debugDataController.lastProcessedFrame) {
		// flush
		const nodePaths = Object.keys(debugDataController.debugContentByFrameByNodePath.value);
		for (const nodePath of nodePaths) {
			const debugLines = debugDataController.debugContentByFrameByNodePath.value[nodePath];
			_flushDebugNode(nodePath, debugLines);
		}
		// reset
		debugDataController.debugContentByFrameByNodePath.value = {};
		debugDataController.lastProcessedFrame = currentFrame;
	}

	const {object3D, nodePath, value} = options;
	const displayableValue = _displayableValue(value);
	const objectName = object3D.name || 'no name';
	let currentValue = debugDataController.debugContentByFrameByNodePath.value[nodePath];
	if (!currentValue) {
		currentValue = _getarrayByNodePath(nodePath, debugDataController);
		currentValue.length = 0;
		debugDataController.debugContentByFrameByNodePath.value[nodePath] = currentValue;
	}
	currentValue.push({
		objectName,
		value,
		displayableValue,
	});
	return currentValue;
}
function _optionsToDebugLines(scene: PolyScene, options: ActorEvaluatorDebugOptions) {
	return optionsToDebugLines(scene, options, _debugDataController);
}
export function tableContent(debugLines: DebugLine[]) {
	const entries = debugLines.map((debugLine, i) => {
		return {
			objectName: debugLine.objectName,
			value: debugLine.value,
		};
	});
	return entries;
}
function logBlue(message: string) {
	console.log('%c' + message, 'color:blue; font-weight:bold;');
}

export class debug<T extends JsDataType> extends ObjectNamedFunction2<[string, T]> {
	static override type() {
		return 'debug';
	}
	override func(object3D: Object3D, nodePath: string, input: T): T {
		if (this.scene.dispatchController.emitAllowed()) {
			options.object3D = object3D;
			options.nodePath = nodePath;
			options.value = input;
			this.scene.dispatchController.actorEvaluatorDebug(options);

			_optionsToDebugLines(this.scene, options);
		}
		return input;
	}
}
