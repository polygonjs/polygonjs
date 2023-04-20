/**
 * Steps through a cloth simulation
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class ClothSolverStepSimulationJsParamsConfig extends NodeParamsConfig {
	stepsCount = ParamConfig.INTEGER(40, {
		range: [1, 100],
		rangeLocked: [true, false],
	});
	selectedVertexInfluence = ParamConfig.FLOAT(0.1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	viscosity = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	spring = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ClothSolverStepSimulationJsParamsConfig();
export class ClothSolverStepSimulationJsNode extends BaseTriggerAndObjectJsNode<ClothSolverStepSimulationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clothSolverStepSimulation';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const stepsCount = this.variableForInputParam(shadersCollectionController, this.p.stepsCount);
		const selectedVertexInfluence = this.variableForInputParam(
			shadersCollectionController,
			this.p.selectedVertexInfluence
		);
		const viscosity = this.variableForInputParam(shadersCollectionController, this.p.viscosity);
		const spring = this.variableForInputParam(shadersCollectionController, this.p.spring);

		const func = Poly.namedFunctionsRegister.getFunction(
			'clothSolverStepSimulation',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, stepsCount, selectedVertexInfluence, viscosity, spring);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
