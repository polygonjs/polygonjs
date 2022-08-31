/**
 * transforms the position before passing it to and SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFQuaternionMethods from './gl/quaternion.glsl';
import SDFTransformMethods from './gl/raymarching/sdfTransform.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'p';
class SDFTransformGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	t = ParamConfig.VECTOR3([0, 0, 0]);
	r = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SDFTransformGlParamsConfig();
export class SDFTransformGlNode extends BaseSDFGlNode<SDFTransformGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFTransform';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['axis']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const t = ThreeToGl.vector3(this.variableForInputParam(this.p.t));
		const r = ThreeToGl.vector3(this.variableForInputParam(this.p.r));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `vec3 ${float} = SDFTransform(${position}, ${t}, ${r})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFQuaternionMethods)]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFTransformMethods)]);
	}
}
