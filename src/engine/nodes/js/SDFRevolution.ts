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
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {TypeAssert} from '../../poly/Assert';
import {Vector2} from 'three';
import {Poly} from '../../Poly';

enum SDFRevolutionJsAxis {
	X = 'X',
	Y = 'Y',
	Z = 'Z',
}
const SDF_REVOLUTION_AXISES: SDFRevolutionJsAxis[] = [
	SDFRevolutionJsAxis.X,
	SDFRevolutionJsAxis.Y,
	SDFRevolutionJsAxis.Z,
];

const OUTPUT_NAME = 'p';
class SDFRevolutionJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	axis = ParamConfig.INTEGER(SDF_REVOLUTION_AXISES.indexOf(SDFRevolutionJsAxis.Y), {
		menu: {
			entries: SDF_REVOLUTION_AXISES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new SDFRevolutionJsParamsConfig();
export class SDFRevolutionJsNode extends BaseSDFJsNode<SDFRevolutionJsParamsConfig> {
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
	setAxis(axis: SDFRevolutionJsAxis) {
		this.p.axis.set(SDF_REVOLUTION_AXISES.indexOf(axis));
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
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
			case SDFRevolutionJsAxis.X: {
				return 'SDFRevolutionX';
			}
			case SDFRevolutionJsAxis.Y: {
				return 'SDFRevolutionY';
			}
			case SDFRevolutionJsAxis.Z: {
				return 'SDFRevolutionZ';
			}
		}
		TypeAssert.unreachable(axis);
	}
}
