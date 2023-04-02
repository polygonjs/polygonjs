/**
 * returns the distance between the ray origin and the plane
 *
 * @remarks
 *
 *
 */

import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseRayPlaneJsNode} from './_BaseRayPlane';

const OUTPUT_NAME = 'distance';
export class RayDistanceToPlaneJsNode extends BaseRayPlaneJsNode {
	static override type() {
		return 'rayDistanceToPlane';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const plane = this.variableForInput(shadersCollectionController, JsConnectionPointType.PLANE);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayDistanceToPlane', this, shadersCollectionController);
		const bodyLine = func.asString(ray, plane);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.FLOAT, varName: out, value: bodyLine},
		]);
	}

	// protected _expectedOutputName(index: number) {
	// 	return OUTPUT_NAME;
	// }
	// protected _expectedOutputType(): ActorConnectionPointType.FLOAT {
	// 	return ActorConnectionPointType.FLOAT;
	// }
	// protected _processRayData() {
	// 	if (this._processData.ray && this._processData.plane) {
	// 		return this._processData.ray.distanceToPlane(this._processData.plane);
	// 	} else {
	// 		return 0;
	// 	}
	// }
}
