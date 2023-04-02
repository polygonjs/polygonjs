/**
 * gets the position where a ray intersects with a sphere
 *
 * @remarks
 *
 *
 */

import {Vector3} from 'three';
import {BaseRaySphereJsNode} from './_BaseRaySphere';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'position';
export class RayIntersectSphereJsNode extends BaseRaySphereJsNode {
	static override type() {
		return 'rayIntersectSphere';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const sphere = this.variableForInput(shadersCollectionController, JsConnectionPointType.SPHERE);
		const out = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addVariable(this, out, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectSphere', this, shadersCollectionController);
		const bodyLine = func.asString(ray, sphere, out);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
	// protected _expectedOutputName(index: number) {
	// 	return OUTPUT_NAME;
	// }
	// protected _expectedOutputType(): ActorConnectionPointType.VECTOR3 {
	// 	return ActorConnectionPointType.VECTOR3;
	// }
	// private _target = new Vector3();
	// protected _processRayData() {
	// 	if (this._processData.sphere) {
	// 		this._processData.ray?.intersectSphere(this._processData.sphere, this._target) || false;
	// 	}
	// 	return this._target;
	// }
}
