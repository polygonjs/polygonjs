/**
 * Creates a cloth constraint
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class CreateClothConstraintJsParamsConfig extends NodeParamsConfig {
	index = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CreateClothConstraintJsParamsConfig();

export class CreateClothConstraintJsNode extends BaseTriggerAndObjectJsNode<CreateClothConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createClothConstraint';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const index = this.variableForInputParam(linesController, this.p.index);

		const func = Poly.namedFunctionsRegister.getFunction('clothCreateConstraint', this, linesController);

		const bodyLine = func.asString(object3D, index);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
