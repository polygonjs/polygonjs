/**
 * Updates a Physics RBD sphere property
 *
 *
 */
import {ParamConfig} from '../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// Note:
// we cannot have height and radius separate,
// as there is currently no way to then transfer that
// to the scale
class SetPhysicsRBDCapsulePropertyJsParamsConfig extends NodeParamsConfig {
	/** @param target scale */
	scale = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPhysicsRBDCapsulePropertyJsParamsConfig();

export class SetPhysicsRBDCapsulePropertyJsNode extends TypedJsNode<SetPhysicsRBDCapsulePropertyJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPhysicsRBDCapsuleProperty';
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
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const scale = this.variableForInputParam(shadersCollectionController, this.p.scale);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(shadersCollectionController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPhysicsRBDCapsuleProperty',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, scale, lerp, updateMatrix);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
