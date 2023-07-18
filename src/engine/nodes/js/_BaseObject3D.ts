import {BaseJsNodeType, wrapIfComputed} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';
import {DecomposedPath} from '../../../core/DecomposedPath';
import {BooleanParam} from '../../params/Boolean';
import {FloatParam} from '../../params/Float';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';
import {Vector3Param} from '../../params/Vector3';
import {Attribute} from '../../../core/geometry/Attribute';
import {ParamPathParam} from '../../params/ParamPath';
import {NodePathParam} from '../../params/NodePath';

function _defaultObject3D(linesController: JsLinesCollectionController): string {
	return linesController.assembler().defaultObject3DVariable();
}
function _defaultObject3DMaterial(linesController: JsLinesCollectionController): string {
	return linesController.assembler().defaultObject3DMaterialVariable();
}
function _defaultPointIndex(node: BaseJsNodeType, linesController: JsLinesCollectionController): string {
	// return linesController.assembler().defaultPointIndexVariable();
	const func = Poly.namedFunctionsRegister.getFunction('getPointIndex', node, linesController);
	return func.asString(inputObject3D(node, linesController));
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

export function inputPointIndex(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const inputPoint = node.io.inputs.named_input(Attribute.POINT_INDEX);
	const object3D = inputPoint
		? node.variableForInput(linesController, Attribute.POINT_INDEX)
		: _defaultPointIndex(node, linesController);
	return object3D;
}

export function setObject3DMaterialOutputLine(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const usedOutputNames = node.io.outputs.used_output_names();

	if (!usedOutputNames.includes(JsConnectionPointType.MATERIAL)) {
		return;
	}

	const material = inputObject3DMaterial(node, linesController);
	const out = node.jsVarName(JsConnectionPointType.MATERIAL);

	linesController.addBodyOrComputed(node, [
		{dataType: JsConnectionPointType.OBJECT_3D, varName: out, value: material},
	]);
}

export function setObject3DOutputLine(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const usedOutputNames = node.io.outputs.used_output_names();

	if (!usedOutputNames.includes(JsConnectionPointType.OBJECT_3D)) {
		return;
	}

	const object3D = inputObject3D(node, linesController);
	const out = node.jsVarName(JsConnectionPointType.OBJECT_3D);

	linesController.addBodyOrComputed(node, [
		{dataType: JsConnectionPointType.OBJECT_3D, varName: out, value: object3D},
	]);
}

export function inputParam(node: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const inputParam = node.io.inputs.named_input(JsConnectionPointType.PARAM);

	const _getParam = (linesController: JsLinesCollectionController) => {
		const paramPathParam = node.params.get(JsConnectionPointType.PARAM) as ParamPathParam;

		// instead of using the path of the found param,
		// or the value of the param,
		// we use the resolved absolute path,
		// so that it works when the js node is not created from the player
		const decomposedPath = new DecomposedPath();
		paramPathParam.value.resolve(node, decomposedPath);
		const absolutePath = decomposedPath.toAbsolutePath();

		const out = node.jsVarName('getParamSinceNoInput');
		// if (foundParam) {
		// do not create the variable only if param has been found,
		// as we also need to handle cases where it will be found later
		const func = Poly.namedFunctionsRegister.getFunction('getParam', node, linesController);
		const bodyLine = func.asString(`'${absolutePath}'`);
		linesController.addBodyOrComputed(node, [
			{dataType: JsConnectionPointType.PARAM, varName: out, value: bodyLine},
		]);
		return wrapIfComputed(out, linesController);
	};

	const param = inputParam
		? node.variableForInput(linesController, JsConnectionPointType.PARAM)
		: _getParam(linesController);
	return param;
}
export function inputNode(jsNode: BaseJsNodeType, linesController: JsLinesCollectionController) {
	const inputNode = jsNode.io.inputs.named_input(JsConnectionPointType.NODE);

	const _getNode = (linesController: JsLinesCollectionController) => {
		const nodePathParam = jsNode.params.get(JsConnectionPointType.NODE) as NodePathParam;

		// instead of using the path of the found param,
		// or the value of the param,
		// we use the resolved absolute path,
		// so that it works when the js node is not created from the player
		const decomposedPath = new DecomposedPath();
		nodePathParam.value.resolve(jsNode, decomposedPath);
		const absolutePath = decomposedPath.toAbsolutePath();

		const out = jsNode.jsVarName('getNodeSinceNoInput');
		// if (foundParam) {
		// do not create the variable only if param has been found,
		// as we also need to handle cases where it will be found later
		const func = Poly.namedFunctionsRegister.getFunction('getNode', jsNode, linesController);
		const bodyLine = func.asString(`'${absolutePath}'`);
		linesController.addBodyOrComputed(jsNode, [
			{dataType: JsConnectionPointType.NODE, varName: out, value: bodyLine},
		]);
		return wrapIfComputed(out, linesController);
	};

	const foundNode = inputNode
		? jsNode.variableForInput(linesController, JsConnectionPointType.NODE)
		: _getNode(linesController);
	return foundNode;
}

export function vector3OutputFromParam(
	node: BaseJsNodeType,
	param: Vector3Param,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = param.name();
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.VECTOR3,
			varName: node.jsVarName(propertyName),
			value: node.variableForInputParam(linesController, param),
		},
	]);
}
export function floatOutputFromParam(
	node: BaseJsNodeType,
	param: FloatParam,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = param.name();
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.FLOAT,
			varName: node.jsVarName(propertyName),
			value: node.variableForInputParam(linesController, param),
		},
	]);
}
export function floatOutputFromInput(
	node: BaseJsNodeType,
	inputName: string,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = inputName;
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.FLOAT,
			varName: node.jsVarName(propertyName),
			value: node.variableForInput(linesController, inputName),
		},
	]);
}
export function integerOutputFromParam(
	node: BaseJsNodeType,
	param: IntegerParam,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = param.name();
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.INT,
			varName: node.jsVarName(propertyName),
			value: node.variableForInputParam(linesController, param),
		},
	]);
}
export function integerOutputFromInput(
	node: BaseJsNodeType,
	inputName: string,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = inputName;
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.INT,
			varName: node.jsVarName(propertyName),
			value: node.variableForInput(linesController, inputName),
		},
	]);
}
export function stringOutputFromParam(
	node: BaseJsNodeType,
	param: StringParam,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = param.name();
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.STRING,
			varName: node.jsVarName(propertyName),
			value: node.variableForInputParam(linesController, param),
		},
	]);
}
export function stringOutputFromInput(
	node: BaseJsNodeType,
	inputName: string,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = inputName;
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.STRING,
			varName: node.jsVarName(propertyName),
			value: node.variableForInput(linesController, inputName),
		},
	]);
}
export function booleanOutputFromParam(
	node: BaseJsNodeType,
	param: BooleanParam,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = param.name();
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.BOOLEAN,
			varName: node.jsVarName(propertyName),
			value: node.variableForInputParam(linesController, param),
		},
	]);
}

export function anyTypeOutputFromInput(
	node: BaseJsNodeType,
	inputName: string,
	linesController: JsLinesCollectionController
) {
	const usedOutputNames = node.io.outputs.used_output_names();

	const propertyName = inputName;
	if (!usedOutputNames.includes(propertyName)) {
		return;
	}
	linesController.addBodyOrComputed(node, [
		{
			dataType: JsConnectionPointType.FLOAT,
			varName: node.jsVarName(propertyName),
			value: node.variableForInput(linesController, inputName),
		},
	]);
}
