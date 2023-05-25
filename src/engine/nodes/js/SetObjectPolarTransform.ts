/**
 * applies a polar transform to the object
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

class SetObjectPolarTransformJsParamsConfig extends NodeParamsConfig {
	/** @param center of the transform */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param moves the objects along the longitude, which is equivalent to a rotation on the y axis */
	longitude = ParamConfig.FLOAT(0, {
		range: [-360, 360],
	});
	/** @param moves the objects along the latitude, which is equivalent to a rotation on the z or x axis */
	latitude = ParamConfig.FLOAT(0, {
		range: [-180, 180],
	});
	/** @param moves the point aways from the center */
	depth = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});
	/** @param lerp factor */
	// lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	// updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectPolarTransformJsParamsConfig();

export class SetObjectPolarTransformJsNode extends TypedJsNode<SetObjectPolarTransformJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectPolarTransform';
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
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const center = this.variableForInputParam(linesController, this.p.center);
		const longitude = this.variableForInputParam(linesController, this.p.longitude);
		const latitude = this.variableForInputParam(linesController, this.p.latitude);
		const depth = this.variableForInputParam(linesController, this.p.depth);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectPolarTransform', this, linesController);
		const bodyLine = func.asString(object3D, center, longitude, latitude, depth);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
