/**
 * returns a noise value
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

enum NoiseSimplexJsNodeInputName {
	POSITION = 'position',
	AMP = 'amp',
	FREQ = 'freq',
	OFFSET = 'offset',
	OCTAVES = 'octaves',
	AMP_MULT = 'ampMult',
	FREQ_MULT = 'freqMult',
	SEED = 'seed',
}
const DefaultValues: PolyDictionary<number> = {
	[NoiseSimplexJsNodeInputName.POSITION]: 0,
	[NoiseSimplexJsNodeInputName.AMP]: 1,
	[NoiseSimplexJsNodeInputName.FREQ]: 1,
	[NoiseSimplexJsNodeInputName.OFFSET]: 0,
	[NoiseSimplexJsNodeInputName.OCTAVES]: 3,
	[NoiseSimplexJsNodeInputName.AMP_MULT]: 0.5,
	[NoiseSimplexJsNodeInputName.FREQ_MULT]: 2,
	[NoiseSimplexJsNodeInputName.SEED]: 0,
};
const OUTPUT_NAME = 'noise';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.VECTOR2: {
			return 'noiseSimplexVector2';
		}
		case JsConnectionPointType.VECTOR3: {
			return 'noiseSimplexVector3';
		}
		case JsConnectionPointType.VECTOR4: {
			return 'noiseSimplexVector4';
		}
	}
}

export class NoiseSimplexJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'noiseSimplex';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	private _firstType() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type = firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : JsConnectionPointType.VECTOR3;
		return type;
	}
	protected _expectedInputTypes() {
		const type = this._firstType();
		return [
			type,
			JsConnectionPointType.FLOAT,
			type,
			type,
			JsConnectionPointType.INT,
			JsConnectionPointType.FLOAT,
			JsConnectionPointType.FLOAT,
			JsConnectionPointType.FLOAT,
		];
	}
	protected _expectedOutputTypes() {
		const type = JsConnectionPointType.FLOAT; //this._firstType()
		return [type];
	}
	protected _expectedInputName(index: number) {
		return [
			NoiseSimplexJsNodeInputName.POSITION,
			NoiseSimplexJsNodeInputName.AMP,
			NoiseSimplexJsNodeInputName.FREQ,
			NoiseSimplexJsNodeInputName.OFFSET,
			NoiseSimplexJsNodeInputName.OCTAVES,
			NoiseSimplexJsNodeInputName.AMP_MULT,
			NoiseSimplexJsNodeInputName.FREQ_MULT,
			NoiseSimplexJsNodeInputName.SEED,
		][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const position = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.POSITION);
		const amp = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.AMP);
		const freq = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.FREQ);
		const offset = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.OFFSET);
		const octaves = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.OCTAVES);
		const ampMult = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.AMP_MULT);
		const freqMult = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.FREQ_MULT);
		const seed = this.variableForInput(shadersCollectionController, NoiseSimplexJsNodeInputName.SEED);
		const varName = this.jsVarName(this._expectedOutputName(0));

		const inputType = this._expectedInputTypes()[0];
		const functionName = functionNameByType(inputType);
		if (functionName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: inputType,
					varName,
					value: func.asString(position, amp, freq, offset, octaves, ampMult, freqMult, seed),
				},
			]);
			return;
		}
	}
}
