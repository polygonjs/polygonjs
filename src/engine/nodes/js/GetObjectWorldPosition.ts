/**
 * get an object world position
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetObjectWorldPositionJsNodeInputName {
	worldPosition = 'worldPosition',
}

export class GetObjectWorldPositionJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getObjectWorldPosition';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetObjectWorldPositionJsNodeInputName.worldPosition, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const varName = this.jsVarName(GetObjectWorldPositionJsNodeInputName.worldPosition);

		const variable = createVariable(JsConnectionPointType.VECTOR3);
		const tmpVarName = variable ? shadersCollectionController.addVariable(this, variable) : undefined;
		if (!tmpVarName) {
			return;
		}
		const func = Poly.namedFunctionsRegister.getFunction(
			'getObjectWorldPosition',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName, value: func.asString(object3D, tmpVarName)},
		]);
	}
}
