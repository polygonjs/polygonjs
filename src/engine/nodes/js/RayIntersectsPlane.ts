/**
 * returns true if the ray intersects with a plane, false if not
 *
 * @remarks
 *
 *
 */

import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
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

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const plane = this.variableForInput(shadersCollectionController, JsConnectionPointType.PLANE);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectsPlane', this, shadersCollectionController);
		const bodyLine = func.asString(ray, plane);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
	// protected _expectedOutputName(index: number) {
	// 	return OUTPUT_NAME;
	// }
	// protected _expectedOutputType(): ActorConnectionPointType.BOOLEAN {
	// 	return ActorConnectionPointType.BOOLEAN;
	// }
	// protected _processRayData() {
	// 	if (this._processData.plane) {
	// 		return this._processData.ray?.intersectsPlane(this._processData.plane) || false;
	// 	} else {
	// 		return false;
	// 	}
	// }
}
