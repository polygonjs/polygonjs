/**
 * Function of SDF Tube/Cylinder
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDFGlNode} from './_BaseSDF';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'float';
class SDFTubeGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	capped = ParamConfig.BOOLEAN(1);
	radius = ParamConfig.FLOAT(0.1);
	height = ParamConfig.FLOAT(1, {
		visibleIf: {capped: 1},
	});
}
const ParamsConfig = new SDFTubeGlParamsConfig();
export class SDFTubeGlNode extends BaseSDFGlNode<SDFTubeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFTube';
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
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		if (isBooleanTrue(this.pv.capped)) {
			const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
			const bodyLine = `float ${float} = sdTubeCapped(${position} - ${center}, ${height}, ${radius})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		} else {
			const bodyLine = `float ${float} = sdTube(${position} - ${center}, ${radius})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		}

		this._addSDFMethods(shadersCollectionController);
	}
}
