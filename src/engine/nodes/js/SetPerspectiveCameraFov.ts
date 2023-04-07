/**
 * Update the camera fov
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetPerspectiveCameraFovJsParamsConfig extends NodeParamsConfig {
	/** @param focal length */
	fov = ParamConfig.FLOAT(50);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the projection matrix should be updated as the animation progresses */
	updateProjectionMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetPerspectiveCameraFovJsParamsConfig();

export class SetPerspectiveCameraFovJsNode extends TypedJsNode<SetPerspectiveCameraFovJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setPerspectiveCameraFov';
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
		const fov = this.variableForInputParam(shadersCollectionController, this.p.fov);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateProjectionMatrix = this.variableForInputParam(
			shadersCollectionController,
			this.p.updateProjectionMatrix
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setPerspectiveCameraFov',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, fov, lerp, updateProjectionMatrix);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
