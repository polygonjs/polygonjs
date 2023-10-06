/**
 * Function of SDF Box
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

// import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseSDFJsNode} from './_BaseSDF';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';
const OUTPUT_NAME = 'float';
class SDFBoxJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	size = ParamConfig.FLOAT(1);
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new SDFBoxJsParamsConfig();
export class SDFBoxJsNode extends BaseSDFJsNode<SDFBoxJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_BOX;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const position = this.position(linesController);
		const center = this.variableForInputParam(linesController, this.p.center);
		const size = this.variableForInputParam(linesController, this.p.size);
		const sizes = this.variableForInputParam(linesController, this.p.sizes);

		const float = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFBox', this, linesController);
		// const bodyLine = `const ${float} = ${func.asString(position, center, sizes, size)}`;
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: float,
				value: func.asString(position, center, sizes, size),
			},
		]);
	}
}
