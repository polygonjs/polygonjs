/**
 * repeats an SDF in polar coordinates, allowing fractal effects
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFRepeatMethods from './gl/raymarching/sdfRepeat.glsl';
import SDFRepeatPolarMethods from './gl/raymarching/sdfRepeatPolar.glsl';
import PolarGlslLib from './gl/polar.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
// import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'p';
class SDFRepeatPolarGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	// repeatLon = ParamConfig.BOOLEAN(1);
	periodLon = ParamConfig.FLOAT(1, {
		// visibleIf: {repeatLon: true},
		range: [0, Math.PI],
	});
	// repeatLat = ParamConfig.BOOLEAN(1);
	// periodLat = ParamConfig.FLOAT(1, {
	// 	visibleIf: {repeatLat: true},
	// 	range: [0, 0.5 * Math.PI],
	// });
	// repeatDepth = ParamConfig.BOOLEAN(1);
	// periodDepth = ParamConfig.FLOAT(1, {
	// 	visibleIf: {repeatDepth: true},
	// });
}
const ParamsConfig = new SDFRepeatPolarGlParamsConfig();
export class SDFRepeatPolarGlNode extends BaseSDFGlNode<SDFRepeatPolarGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRepeatPolar';
	}

	override initializeNode() {
		super.initializeNode();
		// this.io.connection_points.spare_params.setInputlessParamNames(['repeatLon', 'repeatLat', 'repeatDepth']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const periodLon = ThreeToGl.float(this.variableForInputParam(this.p.periodLon));
		// const periodLat = ThreeToGl.float(this.variableForInputParam(this.p.periodLat));
		// const periodDepth = ThreeToGl.float(this.variableForInputParam(this.p.periodDepth));

		const float = this.glVarName(OUTPUT_NAME);
		const functionName = 'SDFRepeatPolarZ'; //`SDFRepeatPolar${this._functionSuffix()}`;
		// const period = `vec3(${periodDepth}, ${periodLat}, ${periodLon})`;
		const bodyLine = `vec3 ${float} = ${functionName}(${position} - ${center}, ${periodLon})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [
			new FunctionGLDefinition(this, PolarGlslLib),
			new FunctionGLDefinition(this, SDFRepeatMethods),
			new FunctionGLDefinition(this, SDFRepeatPolarMethods),
		]);
	}
	// protected _functionSuffix() {
	// 	const lon = isBooleanTrue(this.pv.repeatLon);
	// 	const lat = isBooleanTrue(this.pv.repeatLat);
	// 	const d = isBooleanTrue(this.pv.repeatDepth);
	// 	if (lon && lat && d) {
	// 		return '';
	// 	}
	// 	const args: string[] = [];
	// 	if (d) args.push('X');
	// 	if (lat) args.push('Y');
	// 	if (lon) args.push('Z');
	// 	return args.join('');
	// }
}
