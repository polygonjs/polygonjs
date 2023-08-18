/**
 * Update the camera fov
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

class SetCameraViewOffsetJsParamsConfig extends NodeParamsConfig {
	/** @param min */
	min = ParamConfig.VECTOR2([0, 0]);
	/** @param max */
	max = ParamConfig.VECTOR2([1, 1]);
}
const ParamsConfig = new SetCameraViewOffsetJsParamsConfig();

export class SetCameraViewOffsetJsNode extends TypedJsNode<SetCameraViewOffsetJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'SetCameraViewOffset';
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
		const min = this.variableForInputParam(shadersCollectionController, this.p.min);
		const max = this.variableForInputParam(shadersCollectionController, this.p.max);

		const func = Poly.namedFunctionsRegister.getFunction('setCameraViewOffset', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, min, max);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
