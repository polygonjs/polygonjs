/**
 * returns true if the ray intersects with a sphere, false if not
 *
 * @remarks
 *
 *
 */

import {BaseRaySphereJsNode} from './_BaseRaySphere';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'intersects';
export class RayIntersectsSphereJsNode extends BaseRaySphereJsNode {
	static override type() {
		return 'rayIntersectsSphere';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const sphere = this.variableForInput(shadersCollectionController, JsConnectionPointType.SPHERE);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectsSphere', this, shadersCollectionController);
		const bodyLine = func.asString(ray, sphere);
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
	// 	if (this._processData.sphere) {
	// 		return this._processData.ray?.intersectsSphere(this._processData.sphere) || false;
	// 	} else {
	// 		return false;
	// 	}
	// }
}
