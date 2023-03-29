/**
 * revolves P around an axis before using it as an input for an SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFJsNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypeAssert} from '../../poly/Assert';
import {Vector2} from 'three';
import {Poly} from '../../Poly';

enum SDFRevolutionAxis {
	X = 'X',
	Y = 'Y',
	Z = 'Z',
}
const SDF_REVOLUTION_AXISES: SDFRevolutionAxis[] = [SDFRevolutionAxis.X, SDFRevolutionAxis.Y, SDFRevolutionAxis.Z];

const OUTPUT_NAME = 'p';
class SDFRevolutionGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	axis = ParamConfig.INTEGER(SDF_REVOLUTION_AXISES.indexOf(SDFRevolutionAxis.Y), {
		menu: {
			entries: SDF_REVOLUTION_AXISES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new SDFRevolutionGlParamsConfig();
export class SDFRevolutionJsNode extends BaseSDFJsNode<SDFRevolutionGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRevolution';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR2),
		]);
	}
	setAxis(axis: SDFRevolutionAxis) {
		this.p.axis.set(SDF_REVOLUTION_AXISES.indexOf(axis));
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position(shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);

		const out = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addVariable(this, out, new Vector2());
		const func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, shadersCollectionController);
		// const bodyLine = `${func.asString(position, center, radius, out)}`;
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR2,
				varName: out,
				value: func.asString(position, center, radius, out),
			},
		]);
	}
	private _functionName() {
		const axis = SDF_REVOLUTION_AXISES[this.pv.axis];
		switch (axis) {
			case SDFRevolutionAxis.X: {
				return 'SDFRevolutionX';
			}
			case SDFRevolutionAxis.Y: {
				return 'SDFRevolutionY';
			}
			case SDFRevolutionAxis.Z: {
				return 'SDFRevolutionZ';
			}
		}
		TypeAssert.unreachable(axis);
	}
}
