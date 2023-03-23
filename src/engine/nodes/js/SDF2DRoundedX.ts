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
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDF2DJsNode} from './_BaseSDF2D';
import {sdRoundedX} from './js/sdf/sdf2D';

const OUTPUT_NAME = 'float';
class SDF2DRoundedXJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0], {hidden: true});
	center = ParamConfig.VECTOR2([0, 0]);
	length = ParamConfig.FLOAT(1);
	radius = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDF2DRoundedXJsParamsConfig();
export class SDF2DRoundedXJsNode extends BaseSDF2DJsNode<SDF2DRoundedXJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDF2DRoundedX';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const length = this.variableForInputParam(shadersCollectionController, this.p.length);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);

		const float = this.jsVarName(OUTPUT_NAME);
		const func = new sdRoundedX(this, shadersCollectionController);
		const bodyLine = `const ${float} = ${func.asString(position, center, length, radius)}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
	}
}
