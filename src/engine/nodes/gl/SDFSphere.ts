/**
 * Function of SDF Sphere
 *
 * @remarks
 *
 * based on [https://iquilezles.org/www/articles/distfunctions/distfunctions.htm](https://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFSphereGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDFSphereGlParamsConfig();
export class SDFSphereGlNode extends TypedGlNode<SDFSphereGlParamsConfig> {
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
		const position = ThreeToGl.vector2(this.variableForInputParam(this.p.position));
		const center = ThreeToGl.vector2(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName('float');
		const body_line = `float ${float} = sdSphere(${position} - ${center}, ${radius})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
