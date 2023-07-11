/**
 * Deletes a constraint attached to a physics RBD object.
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class DeletePhysicsRBDKinematicConstraintJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DeletePhysicsRBDKinematicConstraintJsParamsConfig();

export class DeletePhysicsRBDKinematicConstraintJsNode extends BaseTriggerAndObjectJsNode<DeletePhysicsRBDKinematicConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deletePhysicsRBDKinematicConstraint';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction(
			'deletePhysicsRBDKinematicConstraint',
			this,
			linesController
		);

		const bodyLine = func.asString(object3D);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
