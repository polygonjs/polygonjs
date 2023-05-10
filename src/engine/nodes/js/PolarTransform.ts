/**
 * computes a transformation matrix from longitude, latitude and depth
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {Matrix4} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PolarTransformJsParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new PolarTransformJsParamsConfig();

export class PolarTransformJsNode extends TypedJsNode<PolarTransformJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'polarTransform';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.MATRIX4, JsConnectionPointType.MATRIX4, CONNECTION_OPTIONS),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const center = this.variableForInputParam(linesController, this.p.center);
		const longitude = this.variableForInputParam(linesController, this.p.longitude);
		const latitude = this.variableForInputParam(linesController, this.p.latitude);
		const depth = this.variableForInputParam(linesController, this.p.depth);

		const varName = this.jsVarName(JsConnectionPointType.MATRIX4);
		const tmpVarName = linesController.addVariable(this, new Matrix4());

		const func = Poly.namedFunctionsRegister.getFunction('polarTransform', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATRIX4,
				varName,
				value: func.asString(center, longitude, latitude, depth, tmpVarName),
			},
		]);
	}
}
