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
import {JsType} from '../../poly/registers/nodes/types/Js';

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
		return JsType.SDF_REVOLUTION;
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

	override setLines(linesController: JsLinesCollectionController) {
		const position = this.position(linesController);
		const center = this.variableForInputParam(linesController, this.p.center);
		const radius = this.variableForInputParam(linesController, this.p.radius);

		const out = this.jsVarName(OUTPUT_NAME);
		const tmpVarName = linesController.addVariable(this, new Vector2());
		const func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR2,
				varName: out,
				value: func.asString(position, center, radius, tmpVarName),
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
