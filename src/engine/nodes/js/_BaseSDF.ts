import {TypedJsNode, BaseJsNodeType} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Vector3} from 'three';
import {CoreString} from '../../../core/String';

const POSITION_NAME = 'position';
const VARS = {
	position: POSITION_NAME,
};

class BaseSDFJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}

export function defaultPosition(linesController: JsLinesCollectionController, node: BaseJsNodeType): string {
	const sanitizedNodePath = CoreString.sanitizeName(node.path());
	const varName = `${sanitizedNodePath}_${POSITION_NAME}`;
	linesController.addVariable(node, new Vector3(), varName);
	return `${varName}.copy(${VARS.position})`;
}

export class BaseSDFJsNode<K extends BaseSDFJsParamsConfig> extends TypedJsNode<K> {
	protected position(linesController: JsLinesCollectionController) {
		const inputPosition = this.io.inputs.named_input(POSITION_NAME);
		const position = inputPosition
			? this.variableForInputParam(linesController, this.p.position)
			: defaultPosition(linesController, this);
		return position;
	}
}
