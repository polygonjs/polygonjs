/**
 * stretches P before using it as an input for an SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'p';
class SDFElongateGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	mult = ParamConfig.VECTOR3([0, 0, 0]);
	fast = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SDFElongateGlParamsConfig();
export class SDFElongateGlNode extends BaseSDFGlNode<SDFElongateGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFElongate';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['fast']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const mult = ThreeToGl.vector3(this.variableForInputParam(this.p.mult));

		const float = this.glVarName(OUTPUT_NAME);
		const functionName = isBooleanTrue(this.pv.fast) ? 'SDFElongateFast' : 'SDFElongateSlow';
		const suffix = isBooleanTrue(this.pv.fast) ? '.xyz' : '.xyz';
		const bodyLine = `vec3 ${float} = ${functionName}(${position} - ${center}, ${mult})${suffix}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
