/**
 * Function of SDF Sphere hollow
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
class SDFSphereHollowGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	height = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	thickness = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new SDFSphereHollowGlParamsConfig();
export class SDFSphereHollowGlNode extends BaseSDFGlNode<SDFSphereHollowGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_SPHERE_HOLLOW
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
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
		const thickness = ThreeToGl.float(this.variableForInputParam(this.p.thickness));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = sdCutHollowSphere(${position} - ${center}, ${radius}, ${height}, ${thickness})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
