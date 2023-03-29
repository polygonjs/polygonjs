/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';
import {RefJsDefinition} from './utils/JsDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
// import {getObjectHoveredState} from './js/event';
// import {JsType} from '../../poly/registers/nodes/types/Js';

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

	override eventEmitter() {
		return CoreEventEmitter.CANVAS;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);

		shadersCollectionController.addDefinitions(this, [
			new RefJsDefinition(this, shadersCollectionController, JsConnectionPointType.BOOLEAN, outHovered, `false`),
		]);
	}

	// this ref() is not named after the node's name
	// but is instead using a constant name,
	// so that multiple onObjectHover do not require multiple raycast tests.
	// override jsVarName(name: string) {
	// 	return `v_POLY_${name}`;
	// }
}
