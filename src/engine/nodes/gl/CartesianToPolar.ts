/**
 * convert xyz cartesian coordinates to polar
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

const OUTPUT_NAME = 'polar';
class CartesianToPolarGlParamsConfig extends NodeParamsConfig {
	xyz = ParamConfig.VECTOR3([1, 1, 1]);
}

const ParamsConfig = new CartesianToPolarGlParamsConfig();
export class CartesianToPolarGlNode extends TypedGlNode<CartesianToPolarGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cartesianToPolar';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const out = this.glVarName(OUTPUT_NAME);
		const xyz = ThreeToGl.vector3(this.variableForInputParam(this.p.xyz));

		const bodyLine = `vec3 ${out} = cartesianToPolar(${xyz})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, PolarGlslLib)]);
	}
}
