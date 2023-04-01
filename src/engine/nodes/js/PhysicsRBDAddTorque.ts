/**
 * Applies an impulse to a Physics RBD
 *
 *
 */
import {ParamConfig} from './../utils/params/ParamsConfig';
import { TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Js';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
import { inputObject3D } from './_BaseObject3D';
import { Poly } from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsRBDAddTorqueJsParamsConfig extends NodeParamsConfig {
	/** @param torque */
	torque = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new PhysicsRBDAddTorqueJsParamsConfig();

export class PhysicsRBDAddTorqueJsNode extends TypedJsNode<PhysicsRBDAddTorqueJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDAddTorque';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.OBJECT_3D,
				JsConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(
				JsConnectionPointType.OBJECT_3D,
				JsConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const torque = this.variableForInputParam(shadersCollectionController, this.p.torque);

		const func = Poly.namedFunctionsRegister.getFunction(
			'physicsRBDAddTorque',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D,torque);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}

	
}
