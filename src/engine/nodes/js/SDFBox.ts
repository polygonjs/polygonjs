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
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseSDFJsNode} from './_BaseSDF';
import {sdBox} from './js/sdf/sdf';
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

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position(shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const size = this.variableForInputParam(shadersCollectionController, this.p.size);
		const sizes = this.variableForInputParam(shadersCollectionController, this.p.sizes);

		const float = this.jsVarName(OUTPUT_NAME);
		const bodyLine = `const ${float} = ${sdBox.name}(${position}.sub(${center}), ${sizes}.multiplyScalar(${size}))`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addFunction(this, sdBox);
	}
}
