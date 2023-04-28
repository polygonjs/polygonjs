/**
 * converts a cursor position to uv coordinates, which can be used by nodes like js/renderPixel
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {Vector2} from 'three';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum CursorToUvJsNodeOutputName {
	uv = 'uv',
}

class CursorToUvJsParamsConfig extends NodeParamsConfig {
	cursor = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CursorToUvJsParamsConfig();

export class CursorToUvJsNode extends TypedJsNode<CursorToUvJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cursorToUv';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(CursorToUvJsNodeOutputName.uv, JsConnectionPointType.VECTOR2, CONNECTION_OPTIONS),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const cursor = this.variableForInputParam(linesController, this.p.cursor);
		const varName = this.jsVarName(CursorToUvJsNodeOutputName.uv);
		const tmpVarName = linesController.addVariable(this, new Vector2());
		const func = Poly.namedFunctionsRegister.getFunction('cursorToUv', this, linesController);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR2, varName, value: func.asString(cursor, tmpVarName)},
		]);
	}
}
