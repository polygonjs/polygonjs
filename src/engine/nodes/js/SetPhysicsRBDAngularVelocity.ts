/**
 * Updates a Physics RBD position
 *
 *
 */
import {ParamConfig} from './../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDAngularVelocityJsParamsConfig extends NodeParamsConfig {
	/** @param target velocity */
	velocity = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPhysicsRBDAngularVelocityJsParamsConfig();

export class SetPhysicsRBDAngularVelocityJsNode extends TypedJsNode<SetPhysicsRBDAngularVelocityJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDAngularVelocity';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const velocity = this.variableForInputParam(shadersCollectionController, this.p.velocity);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsRBDAngularVelocity',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, velocity, lerp);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
