/**
 * gets the intersection of a ray with an object
 *
 * @remarks
 *
 *
 */

import {BaseRayObjectJsNode} from './_BaseRayObject';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import { Vector3 } from 'three';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'intersects';
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
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const ray = this.variableForInput(shadersCollectionController, JsConnectionPointType.RAY);
		const object3D = this.variableForInput(shadersCollectionController, JsConnectionPointType.OBJECT_3D);
		const out = this.jsVarName(OUTPUT_NAME);
		// shadersCollectionController.addVariable(this, out, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction(
			'rayIntersectsObject3D',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(ray, object3D);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}

	// protected _expectedOutputName(index: number) {
	// 	return ActorConnectionPointType.INTERSECTION;
	// }
	// protected _expectedOutputType(): ActorConnectionPointType.INTERSECTION {
	// 	return ActorConnectionPointType.INTERSECTION;
	// }
	// private _raycaster = new Raycaster();
	// protected _processRayData(context: ActorNodeTriggerContext) {
	// 	if (this._processData.ray && this._processData.Object3D) {
	// 		this._raycaster.ray.copy(this._processData.ray);
	// 		const intersections = this._raycaster.intersectObject(this._processData.Object3D);
	// 		const intersection = intersections[0];
	// 		if (intersection) {
	// 			return intersection;
	// 		}
	// 	}
	// 	return _defaultIntersection(context);
	// }
}
