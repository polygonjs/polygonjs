import {BaseJsNodeType} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {EvaluatorConstant} from './code/assemblers/actor/Evaluator';

export function inputObject3D(node: BaseJsNodeType, shadersCollectionController: ShadersCollectionController) {
	const inputObject3D = node.io.inputs.named_input(JsConnectionPointType.OBJECT_3D);
	const object3D = inputObject3D
		? node.variableForInput(shadersCollectionController, JsConnectionPointType.OBJECT_3D)
		: _defaultObject3D(node);
	return object3D;
}
function _defaultObject3D(node: BaseJsNodeType): string {
	return EvaluatorConstant.OBJECT_3D;
}
