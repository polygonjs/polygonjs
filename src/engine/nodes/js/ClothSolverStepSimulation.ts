/**
 * Steps through a cloth simulation
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ConstantJsDefinition} from './utils/JsDefinition';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ClothMaterialUniformConfigRefString} from '../../../core/cloth/modules/ClothFBOController';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum ClothSolverStepSimulationOutput {
	TEXTURE_SIZE = 'tSize',
	TEXTURE_POSITION0 = 'tPosition0',
	TEXTURE_POSITION1 = 'tPosition1',
	TEXTURE_NORMAL = 'tNormal',
	//
	TEXTURE_ORIGINAL_RT = 'tOriginalRT',
	TEXTURE_VISCOSITY_SPRING_T = 'tViscositySpringT',
	TEXTURE_PREVIOUS_RT0 = 'tPreviousRT0',
	TEXTURE_PREVIOUS_RT1 = 'tPreviousRT1',
	TEXTURE_TARGET_RT0 = 'targetRT0',
	TEXTURE_TARGET_RT1 = 'targetRT1',
	TEXTURE_NORMALS_RT = 'tNormalsRT',
	TEXTURE_POSITION_RT0 = 'tPositionRT0',
	TEXTURE_POSITION_RT1 = 'tPositionRT1',
	TEXTURE_ADJACENT_RT0 = 'tAdjacentsRT0',
	TEXTURE_ADJACENT_RT1 = 'tAdjacentsRT1',
	TEXTURE_DISTANCE_RT0 = 'tDistanceRT0',
	TEXTURE_DISTANCE_RT1 = 'tDistanceRT1',
	//
	MATERIAL_INTEGRATION = 'integrationMat',
}
// const ADDITIONAL_TEXTURE_OUTPUTS: ClothSolverStepSimulationOutput[] = [
// 	ClothSolverStepSimulationOutput.TEXTURE_ORIGINAL_RT,
// 	ClothSolverStepSimulationOutput.TEXTURE_VISCOSITY_SPRING_T,
// 	ClothSolverStepSimulationOutput.TEXTURE_PREVIOUS_RT0,
// 	ClothSolverStepSimulationOutput.TEXTURE_PREVIOUS_RT1,

// 	ClothSolverStepSimulationOutput.TEXTURE_TARGET_RT0,
// 	ClothSolverStepSimulationOutput.TEXTURE_TARGET_RT1,

// 	ClothSolverStepSimulationOutput.TEXTURE_NORMALS_RT,

// 	ClothSolverStepSimulationOutput.TEXTURE_POSITION_RT0,
// 	ClothSolverStepSimulationOutput.TEXTURE_POSITION_RT1,

// 	ClothSolverStepSimulationOutput.TEXTURE_ADJACENT_RT0,
// 	ClothSolverStepSimulationOutput.TEXTURE_ADJACENT_RT1,

// 	ClothSolverStepSimulationOutput.TEXTURE_DISTANCE_RT0,
// 	ClothSolverStepSimulationOutput.TEXTURE_DISTANCE_RT1,
// ];
class ClothSolverStepSimulationJsParamsConfig extends NodeParamsConfig {
	stepsCount = ParamConfig.INTEGER(40, {
		range: [1, 100],
		rangeLocked: [true, false],
	});
	constraintInfluence = ParamConfig.FLOAT(0.1, {
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
			new JsConnectionPoint(ClothSolverStepSimulationOutput.MATERIAL_INTEGRATION, JsConnectionPointType.MATERIAL),
			//
			// ...ADDITIONAL_TEXTURE_OUTPUTS.map(
			// 	(outputName) => new JsConnectionPoint(outputName, JsConnectionPointType.TEXTURE)
			// ),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		this._addRefs(linesController);
		setObject3DOutputLine(this, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const stepsCount = this.variableForInputParam(linesController, this.p.stepsCount);
		const constraintInfluence = this.variableForInputParam(linesController, this.p.constraintInfluence);
		const viscosity = this.variableForInputParam(linesController, this.p.viscosity);
		const spring = this.variableForInputParam(linesController, this.p.spring);

		const configRef = this._addRefs(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('clothSolverStepSimulation', this, linesController);

		const bodyLine = func.asString(
			object3D,
			stepsCount,
			constraintInfluence,
			viscosity,
			spring,
			this._refToString(configRef)
		);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
	private _refToString(refs: ClothMaterialUniformConfigRefString): string {
		const keys = Object.keys(refs);
		const data: string[] = [];
		for (const key of keys) {
			data.push(`${key}:this.${(refs as any)[key]}`);
		}
		return `{${data.join(',')}}`;
	}

	private _addRefs(linesController: JsLinesCollectionController): ClothMaterialUniformConfigRefString {
		const tSize = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_SIZE);
		const tPosition0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION0);
		const tPosition1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION1);
		const tNormal = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_NORMAL);
		//
		const tOriginalRT = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_ORIGINAL_RT);
		const tViscositySpringT = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_VISCOSITY_SPRING_T);
		const tPreviousRT0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_PREVIOUS_RT0);
		const tPreviousRT1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_PREVIOUS_RT1);
		const tTargetRT0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_TARGET_RT0);
		const tTargetRT1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_TARGET_RT1);

		const tNormalsRT = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_NORMALS_RT);
		const tPositionRT0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION_RT0);
		const tPositionRT1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_POSITION_RT1);

		const tAdjacentsRT0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_ADJACENT_RT0);
		const tAdjacentsRT1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_ADJACENT_RT1);
		const tDistanceRT0 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_DISTANCE_RT0);
		const tDistanceRT1 = this.jsVarName(ClothSolverStepSimulationOutput.TEXTURE_DISTANCE_RT1);

		const integrationMat = this.jsVarName(ClothSolverStepSimulationOutput.MATERIAL_INTEGRATION);

		// If those are Ref<>, it seems to not update the uniforms later,
		// so we have constants for now
		linesController.addDefinitions(this, [
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.VECTOR2, tSize, `null`),
		]);

		const textures = [
			tPosition0,
			tPosition1,
			tNormal,
			//
			tOriginalRT,
			tViscositySpringT,
			tPreviousRT0,
			tPreviousRT1,
			tTargetRT0,
			tTargetRT1,
			tNormalsRT,
			tPositionRT0,
			tPositionRT1,
			tAdjacentsRT0,
			tAdjacentsRT1,
			tDistanceRT0,
			tDistanceRT1,
		];
		const materials = [integrationMat];
		for (const texture of textures) {
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, texture, `null`),
			]);
		}

		for (const material of materials) {
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(this, linesController, JsConnectionPointType.MATERIAL, material, `null`),
			]);
		}

		const ref: ClothMaterialUniformConfigRefString = {
			tSize,
			tPosition0,
			tPosition1,
			tNormal,
			tOriginalRT,
			tViscositySpringT,
			tPreviousRT0,
			tPreviousRT1,
			tTargetRT0,
			tTargetRT1,
			tNormalsRT,
			tPositionRT0,
			tPositionRT1,
			tAdjacentsRT0,
			tAdjacentsRT1,
			tDistanceRT0,
			tDistanceRT1,
			integrationMat,
		};
		return ref;
	}
}
