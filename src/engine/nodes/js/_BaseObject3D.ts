import {BaseJsNodeType} from './_Base';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {EvaluatorConstant} from './code/assemblers/actor/Evaluator';

function _defaultObject3D(): string {
	return EvaluatorConstant.OBJECT_3D;
}
function _defaultObject3DMaterial(): string {
	return EvaluatorConstant.MATERIAL;
}



export function inputObject3D(node: BaseJsNodeType, shadersCollectionController: ShadersCollectionController) {
	const inputObject3D = node.io.inputs.named_input(JsConnectionPointType.OBJECT_3D);
	const object3D = inputObject3D
		? node.variableForInput(shadersCollectionController, JsConnectionPointType.OBJECT_3D)
		: _defaultObject3D();
	return object3D;
}

export function inputObject3DMaterial(node: BaseJsNodeType, shadersCollectionController: ShadersCollectionController) {
	const inputMaterial = node.io.inputs.named_input(JsConnectionPointType.MATERIAL);
	const material = inputMaterial
		? node.variableForInput(shadersCollectionController, JsConnectionPointType.MATERIAL)
		: _defaultObject3DMaterial();
	return material;
}
