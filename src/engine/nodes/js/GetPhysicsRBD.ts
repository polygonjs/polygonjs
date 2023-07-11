/**
 * get an RBD property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {_getRBD} from '../../../core/physics/PhysicsRBD';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetPhysicsRBDJsNodeOutput {
	RBD_ID = 'RBDId',
}

export class GetPhysicsRBDJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getPhysicsRBD';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(GetPhysicsRBDJsNodeOutput.RBD_ID, JsConnectionPointType.STRING, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const rbdId = this.variableForInput(linesController, GetPhysicsRBDJsNodeOutput.RBD_ID);

		const out = this.jsVarName(JsConnectionPointType.OBJECT_3D);
		const func = Poly.namedFunctionsRegister.getFunction('getPhysicsRBD', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.OBJECT_3D,
				varName: out,
				value: func.asString(object3D, rbdId),
			},
		]);
	}
}
