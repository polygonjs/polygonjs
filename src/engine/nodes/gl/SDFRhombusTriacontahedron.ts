/**
 * Function of Rhombus Triacontahedron
 *
 * @remarks
 *
 * based on [https://www.youtube.com/watch?v=0RWaR7zApEo&t=714s](https://www.youtube.com/watch?v=0RWaR7zApEo&t=714s)
 *
 * Learn more [https://en.wikipedia.org/wiki/Rhombus](https://en.wikipedia.org/wiki/Rhombus)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import GL_CODE from './gl/raymarching/sdfRhombusTriacontahedron.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SDFRhombusTriacontahedronGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	m1 = ParamConfig.FLOAT(0.2);
	m2 = ParamConfig.FLOAT(0.75);
	f = ParamConfig.FLOAT(2, {
		range: [0, 4],
	});
}
const ParamsConfig = new SDFRhombusTriacontahedronGlParamsConfig();
export class SDFRhombusTriacontahedronGlNode extends BaseSDFGlNode<SDFRhombusTriacontahedronGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRhombusTriacontahedron';
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
		const m1 = ThreeToGl.float(this.variableForInputParam(this.p.m1));
		const m2 = ThreeToGl.float(this.variableForInputParam(this.p.m2));
		const f = ThreeToGl.float(this.variableForInputParam(this.p.f));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdRhombusTriacontahedron(${position} - ${center}, ${m1}, ${m2}, ${f})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [
			new FunctionGLDefinition(this, SDFMethods),
			new FunctionGLDefinition(this, GL_CODE),
		]);
	}
}
