/**
 * Function of SDF Rounded X
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions2d/](https://iquilezles.org/articles/distfunctions2d/)
 */

// import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseSDF2DJsNode} from './_BaseSDF2D';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';

const OUTPUT_NAME = 'float';
class SDF2DCircleJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDF2DCircleJsParamsConfig();
export class SDF2DCircleJsNode extends BaseSDF2DJsNode<SDF2DCircleJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_2D_CIRCLE;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);

		const float = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDF2DCircle', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: float,
				value: func.asString(position, center, radius),
			},
		]);
	}
}
