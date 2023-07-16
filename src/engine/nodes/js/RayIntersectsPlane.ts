/**
 * returns true if the ray intersects with a plane, false if not
 *
 * @remarks
 *
 *
 */

import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseRayPlaneJsNode} from './_BaseRayPlane';

const OUTPUT_NAME = 'intersects';
export class RayIntersectsPlaneJsNode extends BaseRayPlaneJsNode {
	static override type() {
		return 'rayIntersectsPlane';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const plane = this.variableForInput(shadersCollectionController, JsConnectionPointType.PLANE);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectsPlane', this, shadersCollectionController);
		const bodyLine = func.asString(ray, plane);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
