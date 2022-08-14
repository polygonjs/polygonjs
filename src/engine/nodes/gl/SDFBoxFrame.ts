/**
 * Function of SDF box frame
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFBoxFrameGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	size = ParamConfig.VECTOR3([1, 1, 1]);
	width = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDFBoxFrameGlParamsConfig();
export class SDFBoxFrameGlNode extends BaseSDFGlNode<SDFBoxFrameGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFBoxFrame';
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
		const size = ThreeToGl.vector3(this.variableForInputParam(this.p.size));
		const width = ThreeToGl.vector3(this.variableForInputParam(this.p.width));

		const float = this.glVarName('float');
		const bodyLine = `float ${float} = sdBoxFrame(${position} - ${center}, ${size}, ${width})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
