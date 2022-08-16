/**
 * Function of SDF solid angle
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
class SDFSolidAngleGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	angle = ParamConfig.FLOAT(0.25 * Math.PI, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, false],
		step: 0.00001,
	});
	radius = ParamConfig.FLOAT(0.5);
}
const ParamsConfig = new SDFSolidAngleGlParamsConfig();
export class SDFSolidAngleGlNode extends BaseSDFGlNode<SDFSolidAngleGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFSolidAngle';
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
		const angle = ThreeToGl.vector2(this.variableForInputParam(this.p.angle));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdSolidAngleWrapped(${position} - ${center}, ${angle}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
