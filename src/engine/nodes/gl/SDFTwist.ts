/**
 * twists the position before passing it to and SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFTwistMethods from './gl/raymarching/sdfTwist.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const AXISES = ['x', 'y', 'z'];
const OUTPUT_NAME = 'p';
class SDFTwistGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	twist = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
	axis = ParamConfig.INTEGER(1, {
		menu: {entries: [0, 1, 2].map((i) => ({name: AXISES[i], value: i}))},
	});
}
const ParamsConfig = new SDFTwistGlParamsConfig();
export class SDFTwistGlNode extends BaseSDFGlNode<SDFTwistGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFTwist';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['axis']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const twist = ThreeToGl.float(this.variableForInputParam(this.p.twist));

		const float = this.glVarName(OUTPUT_NAME);
		const functionName = `SDFTwist${this._functionSuffix()}`;
		const bodyLine = `vec3 ${float} = ${functionName}(${position} - ${center}, ${twist})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFTwistMethods)]);
	}
	private _functionSuffix() {
		return AXISES[this.pv.axis].toUpperCase();
	}
}
