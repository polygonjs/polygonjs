/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {WrappedBodyLines} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';
import {RefJsDefinition} from './utils/JsDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
// import {EvaluatorMethodName} from './code/assemblers/actor/Evaluator';
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

	override isTriggering() {
		return true;
	}
	override eventEmitter() {
		return CoreEventEmitter.CANVAS;
	}

	protected _addHoveredRef(shadersCollectionController: ShadersCollectionController) {
		const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);

		shadersCollectionController.addDefinitions(this, [
			new RefJsDefinition(this, shadersCollectionController, JsConnectionPointType.BOOLEAN, outHovered, `false`),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		this._addHoveredRef(shadersCollectionController);
	}

	// this ref() is not named after the node's name
	// but is instead using a constant name,
	// so that multiple onObjectHover do not require multiple raycast tests.
	// override jsVarName(name: string) {
	// 	return `v_POLY_${name}`;
	// }
	// abstract methodName(): EvaluatorMethodName;
}

export function setLinesWithHoverCheck(
	node: BaseOnObjectPointerEventJsNode,
	shadersCollectionController: ShadersCollectionController,
	bodyLines: string[]
): WrappedBodyLines {
	const object3D = inputObject3D(node, shadersCollectionController);
	const traverseChildren = node.variableForInputParam(shadersCollectionController, node.p.traverseChildren);
	const lineThreshold = node.variableForInputParam(shadersCollectionController, node.p.lineThreshold);
	const pointsThreshold = node.variableForInputParam(shadersCollectionController, node.p.pointsThreshold);
	const func = Poly.namedFunctionsRegister.getFunction('getObjectHoveredState', node, shadersCollectionController);
	const bodyLine = func.asString(object3D, traverseChildren, lineThreshold, pointsThreshold);

	const methodName = node.wrappedBodyLinesMethodName();
	//
	const wrappedLines: string = `${methodName}(){
			if( !${bodyLine} ){
				return
			}
			${bodyLines.join('\n')}
		}`;
	return {methodNames: [methodName], wrappedLines};
}
