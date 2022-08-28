/**
 * mirrors an SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMirrorMethods from './gl/raymarching/sdfMirror.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'p';
class SDFMirrorGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	smooth = ParamConfig.BOOLEAN(0);
	smoothFactor = ParamConfig.FLOAT(0, {
		visibleIf: {smooth: 1},
		step: 0.0001,
	});
	mirrorX = ParamConfig.BOOLEAN(1);
	mirrorY = ParamConfig.BOOLEAN(1);
	mirrorZ = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SDFMirrorGlParamsConfig();
export class SDFMirrorGlNode extends BaseSDFGlNode<SDFMirrorGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFMirror';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['mirrorX', 'mirrorY', 'mirrorZ']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));

		const output = this.glVarName(OUTPUT_NAME);
		const suffix = this._functionSuffix();
		const bodyLines: string[] = [];
		if (suffix) {
			const functionName = `SDFMirror${suffix}`;
			const args = [`${position} - ${center}`];
			if (isBooleanTrue(this.pv.smooth)) {
				const smoothFactor = ThreeToGl.float(this.variableForInputParam(this.p.smoothFactor));
				args.push(smoothFactor);
			}
			const bodyLine = `vec3 ${output} = ${functionName}(${args.join(',')})`;
			bodyLines.push(bodyLine);
		} else {
			const bodyLine = `vec3 ${output} = ${position} - ${center}`;
			bodyLines.push(bodyLine);
		}
		shadersCollectionController.addBodyLines(this, bodyLines);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMirrorMethods)]);
	}
	private _functionSuffix() {
		const x = isBooleanTrue(this.pv.mirrorX);
		const y = isBooleanTrue(this.pv.mirrorY);
		const z = isBooleanTrue(this.pv.mirrorZ);
		if (!(x || y || z)) {
			return null;
		}
		const args: string[] = [];
		if (x) args.push('X');
		if (y) args.push('Y');
		if (z) args.push('Z');

		if (isBooleanTrue(this.pv.smooth)) {
			args.push('Smooth');
		}

		return args.join('');
	}
}
