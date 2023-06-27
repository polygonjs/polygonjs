/**
 * TBD
 *
 *
 */
import {BaseTriggerJsNode} from './_BaseTrigger';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class DeleteSoftBodyConstraintJsParamsConfig extends NodeParamsConfig {
	id = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new DeleteSoftBodyConstraintJsParamsConfig();

export class DeleteSoftBodyConstraintJsNode extends BaseTriggerJsNode<DeleteSoftBodyConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deleteSoftBodyConstraint';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const id = this.variableForInputParam(shadersCollectionController, this.p.id);

		const func = Poly.namedFunctionsRegister.getFunction(
			'softBodyConstraintDelete',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(id);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
