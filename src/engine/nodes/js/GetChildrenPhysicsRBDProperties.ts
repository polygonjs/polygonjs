/**
 * get children RBD properties
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';

import {_getRBD} from '../../../core/physics/PhysicsRBD';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {PrimitiveArray, VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Vector3} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetChildrenPhysicsRBDPropertiesJsNodeInputName {
	linVel = 'linVel',
	angVel = 'angVel',
	linearDamping = 'linearDamping',
	angularDamping = 'angularDamping',
	isSleeping = 'isSleeping',
	isMoving = 'isMoving',
}

export class GetChildrenPhysicsRBDPropertiesJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getChildrenPhysicsRBDProperties';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.linVel,
				JsConnectionPointType.VECTOR3_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.angVel,
				JsConnectionPointType.VECTOR3_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.linearDamping,
				JsConnectionPointType.FLOAT_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.angularDamping,
				JsConnectionPointType.FLOAT_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.isSleeping,
				JsConnectionPointType.BOOLEAN_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPhysicsRBDPropertiesJsNodeInputName.isMoving,
				JsConnectionPointType.BOOLEAN_ARRAY
			),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);
		const _v3 = (
			propertyName: GetChildrenPhysicsRBDPropertiesJsNodeInputName,
			functionName:
				| 'getChildrenPhysicsRBDPropertiesAngularVelocity'
				| 'getChildrenPhysicsRBDPropertiesLinearVelocity',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new VectorArray([new Vector3()]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};
		const _f = (
			propertyName: GetChildrenPhysicsRBDPropertiesJsNodeInputName,
			functionName:
				| 'getChildrenPhysicsRBDPropertiesAngularDamping'
				| 'getChildrenPhysicsRBDPropertiesLinearDamping',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new PrimitiveArray([0]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};
		const _b = (
			propertyName: GetChildrenPhysicsRBDPropertiesJsNodeInputName,
			functionName: 'getChildrenPhysicsRBDPropertiesIsSleeping' | 'getChildrenPhysicsRBDPropertiesIsMoving',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new PrimitiveArray([0]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};

		_v3(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.angVel,
			'getChildrenPhysicsRBDPropertiesAngularVelocity',
			JsConnectionPointType.VECTOR3_ARRAY
		);
		_v3(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.linVel,
			'getChildrenPhysicsRBDPropertiesLinearVelocity',
			JsConnectionPointType.VECTOR3_ARRAY
		);
		_f(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.angularDamping,
			'getChildrenPhysicsRBDPropertiesAngularDamping',
			JsConnectionPointType.FLOAT_ARRAY
		);
		_f(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.linearDamping,
			'getChildrenPhysicsRBDPropertiesLinearDamping',
			JsConnectionPointType.FLOAT_ARRAY
		);
		_b(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.isMoving,
			'getChildrenPhysicsRBDPropertiesIsMoving',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
		_b(
			GetChildrenPhysicsRBDPropertiesJsNodeInputName.isSleeping,
			'getChildrenPhysicsRBDPropertiesIsSleeping',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
	}
}
