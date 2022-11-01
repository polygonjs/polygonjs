/**
 * Function of SDF torus
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
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'float';
class SDFTorusGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius1 = ParamConfig.FLOAT(1);
	radius2 = ParamConfig.FLOAT(0.1);
	capped = ParamConfig.BOOLEAN(0);
	angle = ParamConfig.FLOAT(0.5 * Math.PI, {
		range: [0, Math.PI],
		rangeLocked: [true, true],
		step: 0.0001,
		visibleIf: {capped: 1},
	});
}
const ParamsConfig = new SDFTorusGlParamsConfig();
export class SDFTorusGlNode extends BaseSDFGlNode<SDFTorusGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFTorus';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['capped']);

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const radius1 = ThreeToGl.float(this.variableForInputParam(this.p.radius1));
		const radius2 = ThreeToGl.float(this.variableForInputParam(this.p.radius2));

		const float = this.glVarName(OUTPUT_NAME);
		if (isBooleanTrue(this.pv.capped)) {
			const angle = ThreeToGl.float(this.variableForInputParam(this.p.angle));
			// const rb = ThreeToGl.float(this.variableForInputParam(this.p.rb));
			// const torus = `sdTorus(${position} - ${center}, vec2(${radius1},${radius2}))`;
			const torusCapped = `sdCappedTorus(${position} - ${center}, ${angle}, ${radius1}, ${radius2})`;
			const bodyLine = `float ${float} = ${torusCapped}`;
			// const bodyLine = `float ${float} = ${torus}`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		} else {
			const torus = `sdTorus(${position} - ${center}, vec2(${radius1}, ${radius2}))`;
			// const torusCapped = `sdCappedTorus(${position} - ${center}, vec2(${radius1},${radius2}), ${ra}, ${rb})`;
			// const bodyLine = `float ${float} = ${cap} ? ${torusCapped} : ${torus}`;
			const bodyLine = `float ${float} = ${torus}`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		}

		this._addSDFMethods(shadersCollectionController);
	}
}
