/**
 * gets the intersection of a ray with an object
 *
 * @remarks
 *
 *
 */

import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class RayIntersectObjectJsParamsConfig extends NodeParamsConfig {
	recursive = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new RayIntersectObjectJsParamsConfig();
export class RayIntersectObjectJsNode extends TypedJsNode<RayIntersectObjectJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rayIntersectObject';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ray = this.variableForInput(linesController, JsConnectionPointType.RAY);
		const recursive = this.variableForInputParam(linesController, this.p.recursive);
		const varName = this.jsVarName(JsConnectionPointType.INTERSECTION);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectObject3D', this, linesController);
		const bodyLine = func.asString(ray, object3D, recursive);
		linesController.addBodyOrComputed(this, [{dataType: JsConnectionPointType.VECTOR3, varName, value: bodyLine}]);
	}
}
