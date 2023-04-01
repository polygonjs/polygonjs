/**
 * Update the object material
 *
 *
 */

import {ParamlessTypedJsNode, TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class SetObjectMaterialJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'setObjectMaterial';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const material = this.variableForInput(shadersCollectionController, JsConnectionPointType.MATERIAL);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectMaterial', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, material);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
