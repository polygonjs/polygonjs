/**
 * get an RBD cylinder property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {RBDCommonProperty} from '../../../core/physics/shapes/_CommonHeightRadius';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class GetPhysicsRBDCylinderPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getPhysicsRBDCylinderproperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(RBDCommonProperty.RADIUS, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(RBDCommonProperty.HEIGHT, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);

		const _f = (
			propertyName: RBDCommonProperty,
			functionName: 'getPhysicsRBDCylinderRadius' | 'getPhysicsRBDCylinderHeight',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D),
				},
			]);
		};

		_f(RBDCommonProperty.RADIUS, 'getPhysicsRBDCylinderRadius', JsConnectionPointType.FLOAT);
		_f(RBDCommonProperty.HEIGHT, 'getPhysicsRBDCylinderHeight', JsConnectionPointType.FLOAT);
	}
}
