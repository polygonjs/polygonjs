/**
 * get an RBD capsule property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {
	_getPhysicsRBDCapsuleRadius,
	_getPhysicsRBDCapsuleHeight,
	RBDCapsuleProperty,
} from '../../../core/physics/shapes/RBDCapsule';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class GetPhysicsRBDCapsulePropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getPhysicsRBDCapsuleproperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(RBDCapsuleProperty.RADIUS, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(RBDCapsuleProperty.HEIGHT, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);

		const _f = (
			propertyName: RBDCapsuleProperty,
			functionName: 'getPhysicsRBDCapsuleRadius' | 'getPhysicsRBDCapsuleHeight',
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

		_f(RBDCapsuleProperty.RADIUS, 'getPhysicsRBDCapsuleRadius', JsConnectionPointType.FLOAT);
		_f(RBDCapsuleProperty.HEIGHT, 'getPhysicsRBDCapsuleHeight', JsConnectionPointType.FLOAT);
	}
}
