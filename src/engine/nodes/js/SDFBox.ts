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
		return 'SDFBox';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const position = this.position(shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const size = this.variableForInputParam(shadersCollectionController, this.p.size);
		const sizes = this.variableForInputParam(shadersCollectionController, this.p.sizes);

		const float = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFBox', this, shadersCollectionController);
		// const bodyLine = `const ${float} = ${func.asString(position, center, sizes, size)}`;
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.FLOAT,
				varName: float,
				value: func.asString(position, center, sizes, size),
			},
		]);
	}
}
