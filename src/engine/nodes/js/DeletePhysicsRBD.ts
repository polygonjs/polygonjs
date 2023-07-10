/**
 * Deletes a physics RBD object.
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class DeletePhysicsRBDJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DeletePhysicsRBDJsParamsConfig();

export class DeletePhysicsRBDJsNode extends BaseTriggerAndObjectJsNode<DeletePhysicsRBDJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deletePhysicsRBD';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction('physicsRBDDelete', this, linesController);

		const bodyLine = func.asString(object3D);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
