/**
 * Updates a physics world gravity
 *
 *
 */
import {PHYSICS_GRAVITY_DEFAULT} from './../../../core/physics/PhysicsWorld';
import {ParamConfig} from './../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsWorldGravityJsParamsConfig extends NodeParamsConfig {
	gravity = ParamConfig.VECTOR3(PHYSICS_GRAVITY_DEFAULT);
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SetPhysicsWorldGravityJsParamsConfig();

export class SetPhysicsWorldGravityJsNode extends TypedJsNode<SetPhysicsWorldGravityJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsWorldGravity';
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
		const gravity = this.variableForInputParam(shadersCollectionController, this.p.gravity);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsWorldGravity',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, gravity, lerp);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
