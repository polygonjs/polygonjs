/**
 * Function of SDF box
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
class SDFBoxGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	size = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new SDFBoxGlParamsConfig();
export class SDFBoxGlNode extends TypedGlNode<SDFBoxGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFBox';
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
		const size = ThreeToGl.vector3(this.variableForInputParam(this.p.size));

		const float = this.glVarName('float');
		const body_line = `float ${float} = sdBox(${position} - ${center}, ${size})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
