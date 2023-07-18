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
// import { Vector3 } from 'three';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'intersects';

enum RayIntersectsObjectJsNodeInputName {
	RECURSIVE = 'recursive',
}
export class RayIntersectsObjectJsNode extends BaseRayObjectJsNode {
	static override type() {
		return 'rayIntersectsObject';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS),
		]);
	}
	protected override _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint(
				RayIntersectsObjectJsNodeInputName.RECURSIVE,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
		];
	}
	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ray = this.variableForInput(linesController, JsConnectionPointType.RAY);
		const recursive = this.variableForInput(linesController, RayIntersectsObjectJsNodeInputName.RECURSIVE);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectsObject3D', this, linesController);
		const bodyLine = func.asString(ray, object3D, recursive);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
