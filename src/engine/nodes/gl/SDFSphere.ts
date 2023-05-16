/**
 * Function of SDF Sphere
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
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT_NAME = 'float';
class SDFSphereGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDFSphereGlParamsConfig();
export class SDFSphereGlNode extends BaseSDFGlNode<SDFSphereGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_SPHERE;
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
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdSphere(${position} - ${center}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
