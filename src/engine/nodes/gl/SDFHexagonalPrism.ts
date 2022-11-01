/**
 * Function of SDF Hexagonal Prism
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDFGlNode} from './_BaseSDF';

const OUTPUT_NAME = 'float';
class SDFHexagonalPrismGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(0.1);
	height = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDFHexagonalPrismGlParamsConfig();
export class SDFHexagonalPrismGlNode extends BaseSDFGlNode<SDFHexagonalPrismGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFHexagonalPrism';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdHexPrism(${position} - ${center}, vec2(${radius},${height}))`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
