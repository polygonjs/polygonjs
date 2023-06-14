/**
 * TBD
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class SetSoftBodySelectedVertexIndexJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SetSoftBodySelectedVertexIndexJsParamsConfig();

export class SetSoftBodySelectedVertexIndexJsNode extends BaseTriggerAndObjectJsNode<SetSoftBodySelectedVertexIndexJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setSoftBodySelectedVertexIndex';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setSoftBodySelectedVertexIndex',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, index);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
