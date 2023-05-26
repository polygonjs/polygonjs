/**
 * Steps through a particles simulation
 *
 *
 */
import {TypedJsNode, TRIGGER_CONNECTION_NAME} from './_Base';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {ParamConfig} from '../utils/params/ParamsConfig';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {GPUComputationConfigRefString} from '../../../core/particles/gpuCompute/GPUComputationRenderer';
import {ConstantJsDefinition} from './utils/JsDefinition';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const DEBUG_NAME = 'texture_position';

class ParticlesSystemStepSimulationJsParamsConfig extends PolyNodeParamsConfig {
	texturesCount = ParamConfig.INTEGER(1, {
		range: [1, 5],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ParticlesSystemStepSimulationJsParamsConfig();
export class ParticlesSystemStepSimulationJsNode extends TypedJsNode<ParticlesSystemStepSimulationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'particlesSystemStepSimulation';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(DEBUG_NAME, JsConnectionPointType.TEXTURE),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		this._addRefs(linesController);
		setObject3DOutputLine(this, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const configRef = this._addRefs(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('particlesSystemStepSimulation', this, linesController);
		const bodyLine = func.asString(object3D, this._refToString(configRef));
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _refToString(refs: GPUComputationConfigRefString): string {
		const keys = Object.keys(refs);
		const data: string[] = [];
		for (const key of keys) {
			data.push(`${key}:this.${(refs as any)[key]}`);
		}
		return `{${data.join(',')}}`;
	}
	private _addRefs(linesController: JsLinesCollectionController): GPUComputationConfigRefString {
		//
		const t0 = this.jsVarName(DEBUG_NAME);

		const textures = [t0];
		for (const texture of textures) {
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, texture, `null`),
			]);
		}

		const ref: GPUComputationConfigRefString = {
			[DEBUG_NAME]: t0,
		};
		return ref;
	}
}
