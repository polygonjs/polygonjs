/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';

export enum OnObjectHoverJsNodeOutputName {
	hovered = 'hovered',
}
class OnObjectHoverJsParamsConfig extends NodeParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new OnObjectHoverJsParamsConfig();

export abstract class BaseOnObjectPointerEventJsNode extends BaseUserInputJsNode<OnObjectHoverJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override isTriggering() {
		return true;
	}
	override eventEmitter() {
		return CoreEventEmitter.CANVAS;
	}
}
