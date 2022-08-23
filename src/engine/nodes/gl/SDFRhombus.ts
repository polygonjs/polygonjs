/**
 * Function of SDF box
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFRhombusGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	length1 = ParamConfig.FLOAT(1);
	length2 = ParamConfig.FLOAT(0.5);
	height = ParamConfig.FLOAT(0.2);
	radius = ParamConfig.FLOAT(0.05);
}
const ParamsConfig = new SDFRhombusGlParamsConfig();
export class SDFRhombusGlNode extends BaseSDFGlNode<SDFRhombusGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRhombus';
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
		const length1 = ThreeToGl.float(this.variableForInputParam(this.p.length1));
		const length2 = ThreeToGl.float(this.variableForInputParam(this.p.length2));
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdRhombus(${position} - ${center}, ${length1}, ${length2}, ${height}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
