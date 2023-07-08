/**
 * stretches P before using it as an input for an SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFJsNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {isBooleanTrue} from '../../../core/Type';
import {Vector3} from 'three';
import {Poly} from '../../Poly';

const OUTPUT_NAME = 'p';
class SDFElongateJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	mult = ParamConfig.VECTOR3([0, 0, 0]);
	fast = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SDFElongateJsParamsConfig();
export class SDFElongateJsNode extends BaseSDFJsNode<SDFElongateJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFElongate';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['fast']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const functionName = isBooleanTrue(this.pv.fast) ? 'SDFElongateFast' : 'SDFElongateSlow';
		const position = this.position(linesController);
		const center = this.variableForInputParam(linesController, this.p.center);
		const mult = this.variableForInputParam(linesController, this.p.mult);

		const out = this.jsVarName(OUTPUT_NAME);
		const tmpVarName = linesController.addVariable(this, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR3,
				varName: out,
				value: func.asString(position, center, mult, tmpVarName),
			},
		]);
	}
}
