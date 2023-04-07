/**
 * applies a polar transform to the object
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
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const latitude = this.variableForInputParam(shadersCollectionController, this.p.latitude);
		const longitude = this.variableForInputParam(shadersCollectionController, this.p.longitude);
		const depth = this.variableForInputParam(shadersCollectionController, this.p.depth);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setObjectPolarTransform',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, center, latitude, longitude, depth);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
