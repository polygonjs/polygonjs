/**
 * Steps through a cloth simulation
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

export class ClothSolverStepSimulationJsNode extends BaseTriggerAndObjectJsNode {
	static override type() {
		return 'clothSolverStepSimulation';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction(
			'clothSolverStepSimulation',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
