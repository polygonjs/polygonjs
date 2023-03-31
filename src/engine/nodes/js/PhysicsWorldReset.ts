/**
 * Initializes a physics simulation
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

export class PhysicsWorldResetJsNode extends BaseTriggerAndObjectJsNode {
	static override type() {
		return 'physicsWorldReset';
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction('physicsWorldReset', this, shadersCollectionController);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
