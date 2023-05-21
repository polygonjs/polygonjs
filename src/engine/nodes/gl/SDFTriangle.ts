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
class SDFTriangleGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	a = ParamConfig.VECTOR3([0, 0, 0]);
	b = ParamConfig.VECTOR3([0, 1, 0]);
	c = ParamConfig.VECTOR3([0, 0, 1]);
	thickness = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDFTriangleGlParamsConfig();
export class SDFTriangleGlNode extends BaseSDFGlNode<SDFTriangleGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_TRIANGLE
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
		const a = ThreeToGl.float(this.variableForInputParam(this.p.a));
		const b = ThreeToGl.float(this.variableForInputParam(this.p.b));
		const c = ThreeToGl.float(this.variableForInputParam(this.p.c));
		const thickness = ThreeToGl.float(this.variableForInputParam(this.p.thickness));

		const float = this.glVarName(OUTPUT_NAME);
		const bodyLine = `float ${float} = udTriangle(${position} - ${center}, ${a}, ${b}, ${c}, ${thickness})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
}
