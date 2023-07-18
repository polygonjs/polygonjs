/**
 * gets the intersection of a ray with an object
 *
 * @remarks
 *
 *
 */

import {BaseRayObjectJsNode} from './_BaseRayObject';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum RayIntersectObjectJsNodeInputName {
	RECURSIVE = 'recursive',
}
export class RayIntersectObjectJsNode extends BaseRayObjectJsNode {
	static override type() {
		return 'rayIntersectObject';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);
	}
	protected override _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint(
				RayIntersectObjectJsNodeInputName.RECURSIVE,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
		];
	}
	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ray = this.variableForInput(linesController, JsConnectionPointType.RAY);
		const recursive = this.variableForInput(linesController, RayIntersectObjectJsNodeInputName.RECURSIVE);
		const varName = this.jsVarName(JsConnectionPointType.INTERSECTION);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectObject3D', this, linesController);
		const bodyLine = func.asString(ray, object3D, recursive);
		linesController.addBodyOrComputed(this, [{dataType: JsConnectionPointType.VECTOR3, varName, value: bodyLine}]);
	}
}
