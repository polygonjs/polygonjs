/**
 * get an RBD property
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {RBDProperty, _getRBD} from '../../../core/physics/PhysicsRBD';
import {Vector3} from 'three';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class GetPhysicsRBDPropertyJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getPhysicsRBDproperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(RBDProperty.ANGULAR_VELOCITY, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(RBDProperty.LINEAR_VELOCITY, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(RBDProperty.ANGULAR_DAMPING, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(RBDProperty.LINEAR_DAMPING, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(RBDProperty.IS_MOVING, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(RBDProperty.IS_SLEEPING, JsConnectionPointType.BOOLEAN),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);

		const _v3 = (
			propertyName: RBDProperty,
			functionName: 'getPhysicsRBDAngularVelocity' | 'getPhysicsRBDLinearVelocity',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const out = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, out, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: func.asString(object3D, out),
				},
			]);
		};
		const _p = (
			propertyName: RBDProperty,
			functionName:
				| 'getPhysicsRBDAngularDamping'
				| 'getPhysicsRBDLinearDamping'
				| 'getPhysicsRBDIsSleeping'
				| 'getPhysicsRBDIsMoving',
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

		_v3(RBDProperty.ANGULAR_VELOCITY, 'getPhysicsRBDAngularVelocity', JsConnectionPointType.VECTOR3);
		_v3(RBDProperty.LINEAR_VELOCITY, 'getPhysicsRBDLinearVelocity', JsConnectionPointType.VECTOR3);
		_p(RBDProperty.ANGULAR_DAMPING, 'getPhysicsRBDAngularDamping', JsConnectionPointType.FLOAT);
		_p(RBDProperty.LINEAR_DAMPING, 'getPhysicsRBDLinearDamping', JsConnectionPointType.FLOAT);
		_p(RBDProperty.IS_MOVING, 'getPhysicsRBDIsMoving', JsConnectionPointType.BOOLEAN);
		_p(RBDProperty.IS_SLEEPING, 'getPhysicsRBDIsSleeping', JsConnectionPointType.BOOLEAN);
	}
}
