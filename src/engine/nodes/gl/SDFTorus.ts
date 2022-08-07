/**
 * Function of SDF torus
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
class SDFTorusGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius1 = ParamConfig.FLOAT(1);
	radius2 = ParamConfig.FLOAT(0.1);
	// cap = ParamConfig.BOOLEAN(0);
	// ra = ParamConfig.FLOAT(0.1);
	// rb = ParamConfig.FLOAT(0.2);
}
const ParamsConfig = new SDFTorusGlParamsConfig();
export class SDFTorusGlNode extends TypedGlNode<SDFTorusGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFTorus';
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
		const radius1 = ThreeToGl.float(this.variableForInputParam(this.p.radius1));
		const radius2 = ThreeToGl.float(this.variableForInputParam(this.p.radius2));
		// const cap = ThreeToGl.bool(this.variableForInputParam(this.p.cap));
		// const ra = ThreeToGl.float(this.variableForInputParam(this.p.ra));
		// const rb = ThreeToGl.float(this.variableForInputParam(this.p.rb));

		const float = this.glVarName('float');
		const torus = `sdTorus(${position} - ${center}, vec2(${radius1},${radius2}))`;
		// const torusCapped = `sdCappedTorus(${position} - ${center}, vec2(${radius1},${radius2}), ${ra}, ${rb})`;
		// const bodyLine = `float ${float} = ${cap} ? ${torusCapped} : ${torus}`;
		const bodyLine = `float ${float} = ${torus}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
