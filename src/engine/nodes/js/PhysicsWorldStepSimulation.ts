/**
 * Steps through a physics simulation
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

export class PhysicsWorldStepSimulationJsNode extends BaseTriggerAndObjectJsNode {
	static override type() {
		return 'physicsWorldStepSimulation';
	}

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction(
			'physicsWorldStepSimulation',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
