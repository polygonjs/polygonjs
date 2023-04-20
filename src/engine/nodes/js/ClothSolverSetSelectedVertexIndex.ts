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

class ClothSolverSetSelectedVertexIndexJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ClothSolverSetSelectedVertexIndexJsParamsConfig();

export class ClothSolverSetSelectedVertexIndexJsNode extends BaseTriggerAndObjectJsNode<ClothSolverSetSelectedVertexIndexJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clothSolverSetSelectedVertexIndex';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);

		const func = Poly.namedFunctionsRegister.getFunction(
			'clothSolverSetSelectedVertexIndex',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, index);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
