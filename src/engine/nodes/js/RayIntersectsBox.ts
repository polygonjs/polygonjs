/**
 * returns true if the ray intersects with a box3, false if not
 *
 * @remarks
 *
 *
 */

import {BaseRayBox3JsNode} from './_BaseRayBox3';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'intersects';
export class RayIntersectsBoxJsNode extends BaseRayBox3JsNode {
	static override type() {
		return 'rayIntersectsBox';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const box3 = this.variableForInput(shadersCollectionController, JsConnectionPointType.BOX3);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('rayIntersectsBox3', this, shadersCollectionController);
		const bodyLine = func.asString(ray, box3);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
