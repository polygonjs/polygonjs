/**
 * convert polar coordinates to xyz cartesian
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FunctionGLDefinition} from './utils/GLDefinition';
import PolarGlslLib from './gl/polar.glsl';

const OUTPUT_NAME = 'xyz';
class PolarToCartesianGlParamsConfig extends NodeParamsConfig {
	polar = ParamConfig.VECTOR3([1, 1, 1]);
}

const ParamsConfig = new PolarToCartesianGlParamsConfig();
export class PolarToCartesianGlNode extends TypedGlNode<PolarToCartesianGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'polarToCartesian';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const out = this.glVarName(OUTPUT_NAME);
		const polar = ThreeToGl.vector3(this.variableForInputParam(this.p.polar));

		const bodyLine = `vec3 ${out} = polarToCartesian(${polar})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, PolarGlslLib)]);
	}
}
