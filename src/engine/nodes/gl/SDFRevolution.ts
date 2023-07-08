/**
 * revolves P around an axis before using it as an input for an SDF
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

enum SDFRevolutionGlAxis {
	X = 'X',
	Y = 'Y',
	Z = 'Z',
}
const SDF_REVOLUTION_AXISES: SDFRevolutionGlAxis[] = [
	SDFRevolutionGlAxis.X,
	SDFRevolutionGlAxis.Y,
	SDFRevolutionGlAxis.Z,
];

const OUTPUT_NAME = 'p';
class SDFRevolutionGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	axis = ParamConfig.INTEGER(SDF_REVOLUTION_AXISES.indexOf(SDFRevolutionGlAxis.Y), {
		menu: {
			entries: SDF_REVOLUTION_AXISES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new SDFRevolutionGlParamsConfig();
export class SDFRevolutionGlNode extends BaseSDFGlNode<SDFRevolutionGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_REVOLUTION;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}
	setAxis(axis: SDFRevolutionGlAxis) {
		this.p.axis.set(SDF_REVOLUTION_AXISES.indexOf(axis));
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));

		const out = this.glVarName(OUTPUT_NAME);
		const functionName = this._functionName();
		const bodyLine = `vec2 ${out} = ${functionName}(${position} - ${center}, ${radius})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);

		this._addSDFMethods(shadersCollectionController);
	}
	private _functionName() {
		const axis = SDF_REVOLUTION_AXISES[this.pv.axis];
		return `SDFRevolution${axis}`;
	}
}
