/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';
import {JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint} from '../utils/io/connections/Js';
import {Constructor} from '../../../types/GlobalTypes';
import {
	ButtonAndModifierOptionsAsString,
	DEFAULT_MODIFIER_OPTION,
	POINTER_EVENT_MODIFIER_MENU_OPTIONS,
} from '../../scene/utils/actors/rayObjectIntersection/Common';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const INPUT_LESS_PARAM_NAMES = ['element'];

export function PointerEventConfigParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		buttonLeft = ParamConfig.BOOLEAN(1, {separatorBefore: true});
		buttonMiddle = ParamConfig.BOOLEAN(1);
		buttonRight = ParamConfig.BOOLEAN(1);
		ctrl = ParamConfig.INTEGER(DEFAULT_MODIFIER_OPTION, POINTER_EVENT_MODIFIER_MENU_OPTIONS);
		shift = ParamConfig.INTEGER(DEFAULT_MODIFIER_OPTION, POINTER_EVENT_MODIFIER_MENU_OPTIONS);
		alt = ParamConfig.INTEGER(DEFAULT_MODIFIER_OPTION, POINTER_EVENT_MODIFIER_MENU_OPTIONS);
	};
}
export class BaseConfigParamsConfig extends PointerEventConfigParamConfig(NodeParamsConfig) {}
const baseConfigParamsConfig = new BaseConfigParamsConfig();

export class BaseOnObjectPointerEventBaseJsParamsConfig extends NodeParamsConfig {
	/** @param blockObjectsBehind */
	blockObjectsBehind = ParamConfig.BOOLEAN(1);
	/** @param skipIfObjectsInFront */
	skipIfObjectsInFront = ParamConfig.BOOLEAN(0);
}
export class CPUOnObjectPointerEventJsParamsConfig extends BaseOnObjectPointerEventBaseJsParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const CPUParamsConfig = new CPUOnObjectPointerEventJsParamsConfig();
export class GPUOnObjectPointerEventJsParamsConfig extends BaseOnObjectPointerEventBaseJsParamsConfig {
	/** @param alpha test */
	// alphaTest = ParamConfig.FLOAT(0.1);
}
const GPUParamsConfig = new GPUOnObjectPointerEventJsParamsConfig();

export abstract class ExtendableOnObjectPointerEventJsNode<
	T extends BaseOnObjectPointerEventBaseJsParamsConfig
> extends BaseUserInputJsNode<T> {
	override isTriggering() {
		return true;
	}
	override eventEmitter() {
		return CoreEventEmitter.CANVAS;
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(INPUT_LESS_PARAM_NAMES);
	}
	protected _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [];
	}
}
export abstract class BaseOnObjectPointerEventJsNode extends ExtendableOnObjectPointerEventJsNode<CPUOnObjectPointerEventJsParamsConfig> {
	override readonly paramsConfig = CPUParamsConfig;
}

export abstract class BaseOnObjectPointerGPUEventJsNode extends ExtendableOnObjectPointerEventJsNode<GPUOnObjectPointerEventJsParamsConfig> {
	override readonly paramsConfig = GPUParamsConfig;
}

export abstract class BaseConfigJsNode extends BaseUserInputJsNode<BaseConfigParamsConfig> {
	override readonly paramsConfig = baseConfigParamsConfig;
}
export function pointerEventConfig(
	node: BaseConfigJsNode,
	linesController: JsLinesCollectionController
): ButtonAndModifierOptionsAsString {
	const left = node.variableForInputParam(linesController, node.p.buttonLeft);
	const middle = node.variableForInputParam(linesController, node.p.buttonMiddle);
	const right = node.variableForInputParam(linesController, node.p.buttonRight);
	const ctrl = node.variableForInputParam(linesController, node.p.ctrl);
	const shift = node.variableForInputParam(linesController, node.p.shift);
	const alt = node.variableForInputParam(linesController, node.p.alt);
	return {
		button: {
			left,
			middle,
			right,
		},
		modifier: {
			ctrl,
			shift,
			alt,
		},
	};
}

export enum OnObjectPointerEventGPUJsNodeInputName {
	worldPosMaterial = 'worldPosMaterial',
}

export enum OnObjectPointerEventGPUJsNodeOutputName {
	distance = 'distance',
}
