/**
 * gets the position where a ray intersects with a plane
 *
 * @remarks
 *
 *
 */

import {Vector3} from 'three';
import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseRayPlaneJsNode} from './_BaseRayPlane';

const OUTPUT_NAME = 'position';
export class RayIntersectPlaneJsNode extends BaseRayPlaneJsNode {
	static override type() {
		return 'rayIntersectPlane';
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
		shadersCollectionController.addVariable(this, out, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectPlane', this, shadersCollectionController);
		const bodyLine = func.asString(ray, plane, out);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
