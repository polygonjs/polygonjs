/**
 * stretches P before using it as an input for an SDF
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

enum SDFExtrudeAxis {
	X = 'X',
	Y = 'Y',
	Z = 'Z',
}
const SDF_Extrude_AXISES: SDFExtrudeAxis[] = [SDFExtrudeAxis.X, SDFExtrudeAxis.Y, SDFExtrudeAxis.Z];

const OUTPUT_NAME = 'd';
class SDFExtrudeGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	height = ParamConfig.FLOAT(1);
	d = ParamConfig.FLOAT(1);
	axis = ParamConfig.INTEGER(SDF_Extrude_AXISES.indexOf(SDFExtrudeAxis.Z), {
		menu: {
			entries: SDF_Extrude_AXISES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new SDFExtrudeGlParamsConfig();
export class SDFExtrudeGlNode extends BaseSDFGlNode<SDFExtrudeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFExtrude';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}
	setAxis(axis: SDFExtrudeAxis) {
		this.p.axis.set(SDF_Extrude_AXISES.indexOf(axis));
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const height = ThreeToGl.float(this.variableForInputParam(this.p.height));
		const d = ThreeToGl.float(this.variableForInputParam(this.p.d));

		const out = this.glVarName(OUTPUT_NAME);
		const functionName = this._functionName();
		const bodyLine = `float ${out} = ${functionName}(${position} - ${center}, ${d}, ${height})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
	private _functionName() {
		const axis = SDF_Extrude_AXISES[this.pv.axis];
		return `SDFExtrude${axis}`;
	}
}
