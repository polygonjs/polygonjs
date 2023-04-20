/**
 * Steps through a particles simulation
 *
 *
 */
import {ParamlessBaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

export class ParticlesSystemStepSimulationJsNode extends ParamlessBaseTriggerAndObjectJsNode {
	static override type() {
		return 'particlesSystemStepSimulation';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction(
			'particlesSystemStepSimulation',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
