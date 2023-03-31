/**
 * Resets a particles simulation
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

export class ParticlesSystemResetJsNode extends BaseTriggerAndObjectJsNode {
	static override type() {
		return 'particlesSystemReset';
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction('particlesSystemReset', this, shadersCollectionController);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
