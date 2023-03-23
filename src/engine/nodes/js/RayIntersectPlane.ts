/**
 * gets the position where a ray intersects with a plane
 *
 * @remarks
 *
 *
 */

import {Vector3} from 'three';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {rayIntersectPlane} from './js/ray';
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

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const plane = this.variableForInput(shadersCollectionController, JsConnectionPointType.PLANE);
		const out = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addVariable(this, out, new Vector3());

		const func = new rayIntersectPlane(this, shadersCollectionController);
		const bodyLine = func.asString(ray, plane, out);
		shadersCollectionController.addBodyOrComputed(this, JsConnectionPointType.VECTOR3, out, bodyLine);
	}
}
