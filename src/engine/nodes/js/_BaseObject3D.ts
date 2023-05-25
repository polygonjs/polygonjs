import {BaseJsNodeType} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';

function _defaultObject3D(linesController: JsLinesCollectionController): string {
	return linesController.assembler().defaultObject3DVariable();
}
function _defaultObject3DMaterial(linesController: JsLinesCollectionController): string {
	return linesController.assembler().defaultObject3DMaterialVariable();
}

export function inputObject3D(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const inputObject3D = node.io.inputs.named_input(JsConnectionPointType.OBJECT_3D);
	const object3D = inputObject3D
		? node.variableForInput(linesController, JsConnectionPointType.OBJECT_3D)
		: _defaultObject3D(linesController);
	return object3D;
}

export function inputObject3DMaterial(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const inputMaterial = node.io.inputs.named_input(JsConnectionPointType.MATERIAL);
	const material = inputMaterial
		? node.variableForInput(linesController, JsConnectionPointType.MATERIAL)
		: _defaultObject3DMaterial(linesController);
	return material;
}

export function setObject3DOutputLine(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const object3D = inputObject3D(node, linesController);
	const out = node.jsVarName(JsConnectionPointType.OBJECT_3D);

	linesController.addBodyOrComputed(node, [
		{dataType: JsConnectionPointType.OBJECT_3D, varName: out, value: object3D},
	]);
}
