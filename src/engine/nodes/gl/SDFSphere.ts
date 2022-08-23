/**
 * Function of SDF Sphere
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseSDFGlNode} from './_BaseSDF';

const OUTPUT_NAME = 'float';
class SDFSphereGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDFSphereGlParamsConfig();
export class SDFSphereGlNode extends BaseSDFGlNode<SDFSphereGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFSphere';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector2(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const body_line = `float ${float} = sdSphere(${position} - ${center}, ${radius})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
