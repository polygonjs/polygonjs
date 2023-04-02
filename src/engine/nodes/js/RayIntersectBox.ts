/**
 * gets the position where a ray intersects with a box3
 *
 * @remarks
 *
 *
 */

import {BaseRayBox3JsNode} from './_BaseRayBox3';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Vector3} from 'three';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'position';
export class RayIntersectBoxJsNode extends BaseRayBox3JsNode {
	static override type() {
		return 'rayIntersectBox';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const box3 = this.variableForInput(shadersCollectionController, JsConnectionPointType.BOX3);
		const out = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addVariable(this, out, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectBox3', this, shadersCollectionController);
		const bodyLine = func.asString(ray, box3, out);
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
	// 	if (this._processData.box3) {
	// 		this._processData.ray?.intersectBox(this._processData.box3, this._target);
	// 	}
	// 	return this._target;
	// }
}
