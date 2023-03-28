/**
 * Function of SDF Sphere
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
import {Poly} from '../../Poly';
const OUTPUT_NAME = 'float';
class SDFSphereJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SDFSphereJsParamsConfig();
export class SDFSphereJsNode extends BaseSDFJsNode<SDFSphereJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFSphere';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position(shadersCollectionController);
		const center = this.variableForInputParam(shadersCollectionController, this.p.center); //this.jsVarName(VARIABLE_NAME_CENTER);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);

		const out = this.jsVarName(OUTPUT_NAME);
		const func = Poly.namedFunctionsRegister.getFunction('SDFSphere', this, shadersCollectionController);
		const bodyLine = `const ${out} = ${func.asString(position, center, radius)}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
	}
}
