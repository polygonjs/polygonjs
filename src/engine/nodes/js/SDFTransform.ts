/**
 * transforms the position before passing it to and SDF
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFJsNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {Vector3} from 'three';

const OUTPUT_NAME = 'p';
class SDFTransformJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	t = ParamConfig.VECTOR3([0, 0, 0]);
	r = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SDFTransformJsParamsConfig();
export class SDFTransformJsNode extends BaseSDFJsNode<SDFTransformJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_TRANSFORM;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const position = this.position(linesController);
		const t = this.variableForInputParam(linesController, this.p.t);
		const r = this.variableForInputParam(linesController, this.p.r);

		const out = this.jsVarName(OUTPUT_NAME);
		const tmpVarName = linesController.addVariable(this, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('SDFTransform', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: out,
				value: func.asString(position, t, r, tmpVarName),
			},
		]);
	}
}
