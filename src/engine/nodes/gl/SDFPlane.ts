/**
 * Function of SDF plane
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
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT_NAME = 'float';
class SDFPlaneGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	offset = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new SDFPlaneGlParamsConfig();
export class SDFPlaneGlNode extends BaseSDFGlNode<SDFPlaneGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_PLANE;
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
		const normal = ThreeToGl.vector3(this.variableForInputParam(this.p.normal));
		const offset = ThreeToGl.float(this.variableForInputParam(this.p.offset));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdPlane(${position}-${center}, ${normal}, ${offset})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
