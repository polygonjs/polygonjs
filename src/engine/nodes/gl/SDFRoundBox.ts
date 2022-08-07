/**
 * Function of SDF round box
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFRoundBoxGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	size = ParamConfig.VECTOR3([1, 1, 1]);
	radius = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDFRoundBoxGlParamsConfig();
export class SDFRoundBoxGlNode extends TypedGlNode<SDFRoundBoxGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRoundBox';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const size = ThreeToGl.vector3(this.variableForInputParam(this.p.size));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName('float');
		const bodyLine = `float ${float} = sdRoundBox(${position} - ${center}, ${size}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
