/**
 * Function of SDF box
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'float';
class SDFBoxGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	size = ParamConfig.FLOAT(1);
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new SDFBoxGlParamsConfig();
export class SDFBoxGlNode extends BaseSDFGlNode<SDFBoxGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFBox';
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
		const size = ThreeToGl.float(this.variableForInputParam(this.p.size));
		const sizes = ThreeToGl.vector3(this.variableForInputParam(this.p.sizes));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdBox(${position} - ${center}, ${sizes}*${size})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
