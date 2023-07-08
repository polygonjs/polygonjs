/**
 * Creates hollow SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const OUTPUT_NAME = 'onion';
class SDFOnionJsParamsConfig extends NodeParamsConfig {
	sdf = ParamConfig.FLOAT(0);
	thickness = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SDFOnionJsParamsConfig();
export class SDFOnionJsNode extends TypedJsNode<SDFOnionJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_ONION;
	}
	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const sdf = this.variableForInputParam(linesController, this.p.sdf);
		const thickness = this.variableForInputParam(linesController, this.p.thickness);

		const out = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFOnion', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: out,
				value: func.asString(sdf, thickness),
			},
		]);
	}
}
