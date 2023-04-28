/**
 * created a 3D box
 *
 * @remarks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Box3} from 'three';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class Box3SetFromObjectJsParamsConfig extends NodeParamsConfig {
	/** @param precise */
	precise = ParamConfig.BOOLEAN(false);
}
const ParamsConfig = new Box3SetFromObjectJsParamsConfig();
export class Box3SetFromObjectJsNode extends TypedJsNode<Box3SetFromObjectJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'box3SetFromObject';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.BOX3, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const precise = this.variableForInputParam(linesController, this.p.precise);
		const out = this.jsVarName(JsConnectionPointType.BOX3);

		const tmpVarName = linesController.addVariable(this, new Box3());
		const func = Poly.namedFunctionsRegister.getFunction('box3SetFromObject', this, linesController);
		const bodyLine = func.asString(object3D, precise, tmpVarName);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
