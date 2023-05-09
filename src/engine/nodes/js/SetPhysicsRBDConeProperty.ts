/**
 * Updates a Physics RBD cone property
 *
 *
 */
import {ParamConfig} from '../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPhysicsRBDConePropertyJsParamsConfig extends NodeParamsConfig {
	/** @param target radius */
	radius = ParamConfig.FLOAT(1);
	/** @param target height */
	height = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPhysicsRBDConePropertyJsParamsConfig();

export class SetPhysicsRBDConePropertyJsNode extends TypedJsNode<SetPhysicsRBDConePropertyJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDConeProperty';
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

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);
		const height = this.variableForInputParam(shadersCollectionController, this.p.height);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(shadersCollectionController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsRBDConeProperty',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, radius, height, lerp, updateMatrix);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
