/**
 * Function of SDF cone
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFCapsuleGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	start = ParamConfig.VECTOR3([0, 0, 0]);
	end = ParamConfig.VECTOR3([0, 1, 0]);
	radius = ParamConfig.FLOAT(0.2, {
		range: [0, 1],
		rangeLocked: [true, false],
		step: 0.00001,
	});
}
const ParamsConfig = new SDFCapsuleGlParamsConfig();
export class SDFCapsuleGlNode extends BaseSDFGlNode<SDFCapsuleGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFCapsule';
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
		const startPos = ThreeToGl.vector3(this.variableForInputParam(this.p.start));
		const endPos = ThreeToGl.vector3(this.variableForInputParam(this.p.end));
		const radius = ThreeToGl.vector2(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdCapsule(${position} - ${center}, ${startPos}, ${endPos}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
