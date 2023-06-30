/**
 * Steps through a soft body solver simulation
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SoftBodySolverStepSimulationJsParamsConfig extends NodeParamsConfig {
	subSteps = ParamConfig.INTEGER(10, {
		range: [1, 100],
		rangeLocked: [true, false],
	});
	/** @param edgeCompliance */
	edgeCompliance = ParamConfig.FLOAT(0, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param volumeCompliance */
	volumeCompliance = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SoftBodySolverStepSimulationJsParamsConfig();
export class SoftBodySolverStepSimulationJsNode extends TypedJsNode<SoftBodySolverStepSimulationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'softBodySolverStepSimulation';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const subSteps = this.variableForInputParam(linesController, this.p.subSteps);
		const edgeCompliance = this.variableForInputParam(linesController, this.p.edgeCompliance);
		const volumeCompliance = this.variableForInputParam(linesController, this.p.volumeCompliance);

		const func = Poly.namedFunctionsRegister.getFunction('softBodySolverStepSimulation', this, linesController);

		const bodyLine = func.asString(object3D, subSteps, edgeCompliance, volumeCompliance);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
