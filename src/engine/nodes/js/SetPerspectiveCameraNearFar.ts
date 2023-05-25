/**
 * Update the camera near/far
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPerspectiveCameraNearFarJsParamsConfig extends NodeParamsConfig {
	/** @param near */
	near = ParamConfig.FLOAT(1);
	/** @param far */
	far = ParamConfig.FLOAT(100);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the projection matrix should be updated as the animation progresses */
	updateProjectionMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPerspectiveCameraNearFarJsParamsConfig();

export class SetPerspectiveCameraNearFarJsNode extends TypedJsNode<SetPerspectiveCameraNearFarJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPerspectiveCameraNearFar';
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
		const near = this.variableForInputParam(shadersCollectionController, this.p.near);
		const far = this.variableForInputParam(shadersCollectionController, this.p.far);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateProjectionMatrix = this.variableForInputParam(
			shadersCollectionController,
			this.p.updateProjectionMatrix
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPerspectiveCameraNearFar',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, near, far, lerp, updateProjectionMatrix);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
