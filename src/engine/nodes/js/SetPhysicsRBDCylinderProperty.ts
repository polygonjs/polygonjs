/**
 * Updates a Physics RBD cylinder property
 *
 *
 */
import {ParamConfig} from '../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDCylinderPropertyJsParamsConfig extends NodeParamsConfig {
	/** @param target radius */
	radius = ParamConfig.FLOAT(1);
	/** @param target height */
	height = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPhysicsRBDCylinderPropertyJsParamsConfig();

export class SetPhysicsRBDCylinderPropertyJsNode extends TypedJsNode<SetPhysicsRBDCylinderPropertyJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDCylinderProperty';
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
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);
		const height = this.variableForInputParam(shadersCollectionController, this.p.height);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(shadersCollectionController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsRBDCylinderProperty',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, radius, height, lerp, updateMatrix);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
