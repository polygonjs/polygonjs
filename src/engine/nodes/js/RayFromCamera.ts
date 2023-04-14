/**
 * gets the ray from a camera
 *
 * @remarks
 *
 * the parameter x and y should be in the [-1,1] range
 *
 * x = 0, y = 0  : canvas center
 * x = -1, y = -1: bottom left corner
 * x = -1, y = 1 : top left corner
 * x = 1, y = -1 : bottom right corner
 * x = 1, y = 1  : top right corner
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Ray} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class RayFromCameraJsParamsConfig extends NodeParamsConfig {
	/** @param x position in screen space  */
	x = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
	/** @param y position in screen space */
	y = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
}
const ParamsConfig = new RayFromCameraJsParamsConfig();
export class RayFromCameraJsNode extends TypedJsNode<RayFromCameraJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.RAY_FROM_CAMERA;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.CAMERA, JsConnectionPointType.CAMERA, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const camera = this.variableForInput(shadersCollectionController, JsConnectionPointType.CAMERA);
		const x = this.variableForInputParam(shadersCollectionController, this.p.x);
		const y = this.variableForInputParam(shadersCollectionController, this.p.y);
		const out = this.jsVarName(JsConnectionPointType.RAY);

		shadersCollectionController.addVariable(this, out, new Ray());
		const func = Poly.namedFunctionsRegister.getFunction('rayFromCamera', this, shadersCollectionController);
		const bodyLine = func.asString(camera, x, y, out);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.FLOAT, varName: out, value: bodyLine},
		]);
	}
}
