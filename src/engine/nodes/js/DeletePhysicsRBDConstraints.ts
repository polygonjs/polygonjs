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

class DeletePhysicsRBDConstraintsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DeletePhysicsRBDConstraintsJsParamsConfig();

export class DeletePhysicsRBDConstraintsJsNode extends BaseTriggerAndObjectJsNode<DeletePhysicsRBDConstraintsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deletePhysicsRBDConstraints';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction('physicsRBDDeleteConstraints', this, linesController);

		const bodyLine = func.asString(object3D);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
