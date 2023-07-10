/**
 * Deletes a soft body constraint
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {inputObject3D} from './_BaseObject3D';

class DeleteSoftBodyConstraintJsParamsConfig extends NodeParamsConfig {
	id = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new DeleteSoftBodyConstraintJsParamsConfig();

export class DeleteSoftBodyConstraintJsNode extends BaseTriggerAndObjectJsNode<DeleteSoftBodyConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deleteSoftBodyConstraint';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const id = this.variableForInputParam(shadersCollectionController, this.p.id);

		const func = Poly.namedFunctionsRegister.getFunction(
			'softBodyConstraintDelete',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, id);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
