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

enum NoiseImprovedJsNodeInputName {
	POSITION = 'position',
	AMP = 'amp',
	FREQ = 'freq',
	OFFSET = 'offset',
	OCTAVES = 'octaves',
	AMP_MULT = 'ampMult',
	FREQ_MULT = 'freqMult',
}
const DefaultValues: PolyDictionary<number> = {
	[NoiseImprovedJsNodeInputName.POSITION]: 0,
	[NoiseImprovedJsNodeInputName.AMP]: 1,
	[NoiseImprovedJsNodeInputName.FREQ]: 1,
	[NoiseImprovedJsNodeInputName.OFFSET]: 0,
	[NoiseImprovedJsNodeInputName.OCTAVES]: 3,
	[NoiseImprovedJsNodeInputName.AMP_MULT]: 0.5,
	[NoiseImprovedJsNodeInputName.FREQ_MULT]: 2,
};
const OUTPUT_NAME = 'noise';
const ALLOWED_INPUT_TYPES: JsConnectionPointType[] = [JsConnectionPointType.VECTOR3];
function functionNameByType(type: JsConnectionPointType) {
	switch (type) {
		case JsConnectionPointType.VECTOR3: {
			return 'noiseImprovedVector3';
		}
	}
}

export class NoiseImprovedJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'noiseImproved';
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
		];
	}
	protected _expectedOutputTypes() {
		const type = JsConnectionPointType.FLOAT; //this._firstType()
		return [type];
	}
	protected _expectedInputName(index: number) {
		return [
			NoiseImprovedJsNodeInputName.POSITION,
			NoiseImprovedJsNodeInputName.AMP,
			NoiseImprovedJsNodeInputName.FREQ,
			NoiseImprovedJsNodeInputName.OFFSET,
			NoiseImprovedJsNodeInputName.OCTAVES,
			NoiseImprovedJsNodeInputName.AMP_MULT,
			NoiseImprovedJsNodeInputName.FREQ_MULT,
		][index];
	}
	protected _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const position = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.POSITION);
		const amp = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.AMP);
		const freq = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.FREQ);
		const offset = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.OFFSET);
		const octaves = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.OCTAVES);
		const ampMult = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.AMP_MULT);
		const freqMult = this.variableForInput(shadersCollectionController, NoiseImprovedJsNodeInputName.FREQ_MULT);
		const varName = this.jsVarName(this._expectedOutputName(0));

		const inputType = this._expectedInputTypes()[0];
		const functionName = functionNameByType(inputType);
		if (functionName) {
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: inputType,
					varName,
					value: func.asString(position, amp, freq, offset, octaves, ampMult, freqMult),
				},
			]);
			return;
		}
	}
}
