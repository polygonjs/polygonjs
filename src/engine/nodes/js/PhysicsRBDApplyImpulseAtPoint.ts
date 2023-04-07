/**
 * Applies an impulse to a Physics RBD
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

class PhysicsRBDApplyImpulseAtPointJsParamsConfig extends NodeParamsConfig {
	/** @param impulse */
	impulse = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param point */
	point = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new PhysicsRBDApplyImpulseAtPointJsParamsConfig();

export class PhysicsRBDApplyImpulseAtPointJsNode extends TypedJsNode<PhysicsRBDApplyImpulseAtPointJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDApplyImpulseAtPoint';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const impulse = this.variableForInputParam(shadersCollectionController, this.p.impulse);
		const point = this.variableForInputParam(shadersCollectionController, this.p.point);

		const func = Poly.namedFunctionsRegister.getFunction(
			'physicsRBDApplyImpulseAtPoint',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, impulse, point);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
