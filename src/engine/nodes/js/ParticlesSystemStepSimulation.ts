/**
 * Steps through a particles simulation
 *
 *
 */
import {TypedJsNode} from './_Base';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {ParamConfig} from '../utils/params/ParamsConfig';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {GPUComputationConfigRefString} from '../../../core/particles/gpuCompute/GPUComputationRenderer';
import {ConstantJsDefinition} from './utils/JsDefinition';
import {range} from '../../../core/ArrayUtils';
import {StringParam} from '../../params/String';
import {TEXTURE_ALLOCATION_PREFIX} from '../gl/code/utils/TextureAllocation';

function visibleIfTexturessCountAtLeast(index: number) {
	return {
		visibleIf: range(index + 1, 10).map((i) => ({texturesCount: i})),
	};
}

function textureNameParam(index: number) {
	return ParamConfig.STRING('', {
		...visibleIfTexturessCountAtLeast(index),
	});
}

class ParticlesSystemStepSimulationJsParamsConfig extends PolyNodeParamsConfig {
	texturesCount = ParamConfig.INTEGER(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	textureName0 = textureNameParam(0);
	textureName1 = textureNameParam(1);
	textureName2 = textureNameParam(2);
	textureName3 = textureNameParam(3);
	textureName4 = textureNameParam(4);
	textureName5 = textureNameParam(5);
	textureName6 = textureNameParam(6);
	textureName7 = textureNameParam(7);
	textureName8 = textureNameParam(8);
	textureName9 = textureNameParam(9);
}
const ParamsConfig = new ParticlesSystemStepSimulationJsParamsConfig();
export class ParticlesSystemStepSimulationJsNode extends TypedJsNode<ParticlesSystemStepSimulationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'particlesSystemStepSimulation';
	}
	override initializeNode() {
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _textureNameParams(): StringParam[] {
		return [
			this.p.textureName0,
			this.p.textureName1,
			this.p.textureName2,
			this.p.textureName3,
			this.p.textureName4,
			this.p.textureName5,
			this.p.textureName6,
			this.p.textureName7,
			this.p.textureName8,
			this.p.textureName9,
		];
	}

	setTextureName(index: number, textureName: string) {
		const param = this._textureNameParams()[index];
		if (!param) {
			return;
		}
		param.set(textureName);
	}

	private _expectedInputTypes(): JsConnectionPointType[] {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D];
	}
	private _expectedInputName(index: number) {
		return this._expectedInputTypes()[index];
	}

	private _expectedOutputTypes() {
		const count = this.pv.texturesCount;
		return this._expectedInputTypes().concat(range(0, count).map((value, i) => JsConnectionPointType.TEXTURE));
	}

	private _expectedOutputName(index: number) {
		if (index <= 1) {
			return this._expectedInputName(index);
		} else {
			return this._textureNameParams()[index - 2].value;
		}
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
		const count = this.pv.texturesCount;
		const textureParams = this._textureNameParams();
		const textureNames = range(0, count).map((value, i) => `${textureParams[i].value}`);
		//
		const varNames = textureNames.map((textureName) => this.jsVarName(textureName));

		for (const texture of varNames) {
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(this, linesController, JsConnectionPointType.TEXTURE, texture, `null`),
			]);
		}

		const ref: GPUComputationConfigRefString = {};
		for (let i = 0; i < count; i++) {
			const textureName = textureNames[i];
			const textureNameWithPrefix = `${TEXTURE_ALLOCATION_PREFIX}${textureName}`;
			const varName = varNames[i];
			ref[textureNameWithPrefix] = varName;
		}

		return ref;
	}
}
