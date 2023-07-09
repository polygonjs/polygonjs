/**
 * TBD
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class DeleteClothConstraintJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DeleteClothConstraintJsParamsConfig();

export class DeleteClothConstraintJsNode extends BaseTriggerAndObjectJsNode<DeleteClothConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deleteClothConstraint';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction('clothDeleteConstraint', this, linesController);

		const bodyLine = func.asString(object3D);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
