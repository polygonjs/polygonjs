/**
 * repeats an SDF, allowing fractal effects
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFRepeatMethods from './gl/raymarching/sdfRepeat.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'p';
class SDFRepeatGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	period = ParamConfig.VECTOR3([1, 1, 1]);
	repeatX = ParamConfig.BOOLEAN(1);
	repeatY = ParamConfig.BOOLEAN(1);
	repeatZ = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SDFRepeatGlParamsConfig();
export class SDFRepeatGlNode extends BaseSDFGlNode<SDFRepeatGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRepeat';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['repeatX', 'repeatY', 'repeatZ']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const period = ThreeToGl.vector3(this.variableForInputParam(this.p.period));
		// const repeatX = ThreeToGl.bool(this.variableForInputParam(this.p.repeatX));

		const float = this.glVarName(OUTPUT_NAME);
		const functionName = `SDFRepeat${this._functionSuffix()}`;
		const bodyLine = `vec3 ${float} = ${functionName}(${position} - ${center}, ${period})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFRepeatMethods)]);
	}
	private _functionSuffix() {
		const x = isBooleanTrue(this.pv.repeatX);
		const y = isBooleanTrue(this.pv.repeatY);
		const z = isBooleanTrue(this.pv.repeatZ);
		if (x && y && z) {
			return '';
		}
		const args: string[] = [];
		if (x) args.push('X');
		if (y) args.push('Y');
		if (z) args.push('Z');
		return args.join('');
	}
}
