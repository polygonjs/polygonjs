/**
 * Function of SDF Horse Shoe
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDFGlNode} from './_BaseSDF';

const OUTPUT_NAME = 'float';
class SDFHorseShoeGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	angle = ParamConfig.FLOAT(1, {
		range: [0, Math.PI],
		rangeLocked: [true, true],
		step: 0.00001,
	});
	radius = ParamConfig.FLOAT(1);
	length = ParamConfig.FLOAT(1);
	thickness = ParamConfig.FLOAT(0.1);
	width = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDFHorseShoeGlParamsConfig();
export class SDFHorseShoeGlNode extends BaseSDFGlNode<SDFHorseShoeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFHorseShoe';
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
		const angle = ThreeToGl.float(this.variableForInputParam(this.p.angle));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));
		const length = ThreeToGl.float(this.variableForInputParam(this.p.length));
		const thickness = ThreeToGl.float(this.variableForInputParam(this.p.thickness));
		const width = ThreeToGl.float(this.variableForInputParam(this.p.width));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdHorseshoe(${position} - ${center}, ${angle}, ${radius}, ${length}, vec2(${thickness}, ${width}))`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
