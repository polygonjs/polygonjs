/**
 * Steps through a cloth simulation
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ConstantJsDefinition} from './utils/JsDefinition';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum ClothSolverStepSimulationOutput {
	TEXTURE_SIZE = 'tSize',
	TEXTURE_POSITION0 = 'tPosition0',
	TEXTURE_POSITION1 = 'tPosition1',
	TEXTURE_NORMAL = 'tNormal',
}
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
export class ClothSolverStepSimulationJsNode extends TypedJsNode<ClothSolverStepSimulationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clothSolverStepSimulation';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(ClothSolverStepSimulationOutput.TEXTURE_SIZE, JsConnectionPointType.VECTOR2),
			new JsConnectionPoint(ClothSolverStepSimulationOutput.TEXTURE_POSITION0, JsConnectionPointType.TEXTURE),
			new JsConnectionPoint(ClothSolverStepSimulationOutput.TEXTURE_POSITION1, JsConnectionPointType.TEXTURE),
			new JsConnectionPoint(ClothSolverStepSimulationOutput.TEXTURE_NORMAL, JsConnectionPointType.TEXTURE),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		this._addRefs(linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const stepsCount = this.variableForInputParam(linesController, this.p.stepsCount);
		const selectedVertexInfluence = this.variableForInputParam(linesController, this.p.selectedVertexInfluence);
		const viscosity = this.variableForInputParam(linesController, this.p.viscosity);
		const spring = this.variableForInputParam(linesController, this.p.spring);

		const {tSize, tPosition0, tPosition1, tNormal} = this._addRefs(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('clothSolverStepSimulation', this, linesController);

		const bodyLine = func.asString(
			object3D,
			stepsCount,
			selectedVertexInfluence,
			viscosity,
			spring,
			`this.${tSize}`,
			`this.${tPosition0}`,
			`this.${tPosition1}`,
			`this.${tNormal}`
		);
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _addRefs(linesController: JsLinesCollectionController) {
		const tSize = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_SIZE);
		const tPosition0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION0);
		const tPosition1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION1);
		const tNormal = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_NORMAL);
		// If those are Ref<>, it seems to not update the uniforms later,
		// so we have constants for now
		linesController.addDefinitions(this, [
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.VECTOR2, tSize, `null`),
		]);
		linesController.addDefinitions(this, [
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, tPosition0, `null`),
		]);
		linesController.addDefinitions(this, [
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, tPosition1, `null`),
		]);
		linesController.addDefinitions(this, [
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, tNormal, `null`),
		]);
		return {tSize, tPosition0, tPosition1, tNormal};
	}
}
