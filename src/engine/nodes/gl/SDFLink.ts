/**
 * Function of SDF box
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

const OUTPUT_NAME = 'float';
class SDFLinkGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	halfLength = ParamConfig.FLOAT(1);
	radius1 = ParamConfig.FLOAT(0.5);
	radius2 = ParamConfig.FLOAT(0.2);
}
const ParamsConfig = new SDFLinkGlParamsConfig();
export class SDFLinkGlNode extends BaseSDFGlNode<SDFLinkGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFLink';
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
		const halfLength = ThreeToGl.float(this.variableForInputParam(this.p.halfLength));
		const radius1 = ThreeToGl.float(this.variableForInputParam(this.p.radius1));
		const radius2 = ThreeToGl.float(this.variableForInputParam(this.p.radius2));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdLink(${position} - ${center}, ${halfLength}, ${radius1}, ${radius2})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
