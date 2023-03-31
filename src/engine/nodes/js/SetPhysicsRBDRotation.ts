/**
 * Updates a Physics RBD position
 *
 *
 */
import {ParamConfig} from '../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetPhysicsRBDRotationJsParamsConfig extends NodeParamsConfig {
	/** @param target rotation */
	quaternion = ParamConfig.VECTOR4([0, 0, 0, 0], {
		asQuaternion: true,
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPhysicsRBDRotationJsParamsConfig();

export class SetPhysicsRBDRotationJsNode extends TypedJsNode<SetPhysicsRBDRotationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDRotation';
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
		const quaternion = this.variableForInputParam(shadersCollectionController, this.p.quaternion);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsRBDRotation',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, quaternion, lerp);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
