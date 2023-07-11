/**
 * applies an easing function to the input
 *
 *
 *
 */
import {isJsConnectionPointPrimitive, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedJsNode} from './_Base';
import {EASING_NAMES} from '../../../core/math/Easing';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {_vectorFunctionName_1} from '../../functions/_MathGeneric';

type AllowedInputType =
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;
const ALLOWED_INPUTS: AllowedInputType[] = [
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

const INPUT_NAME = 'in';
const OUTPUT_NAME = 'out';
const defaultEaseType = EASING_NAMES.indexOf('easeIO3');
class EasingJsParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(defaultEaseType, {
		menu: {
			entries: EASING_NAMES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	// input = ParamConfig.FLOAT(0);
}
const ParamsConfig = new EasingJsParamsConfig();

export class EasingJsNode extends TypedJsNode<EasingJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'easing';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	private _expectedInputTypes() {
		const type = (this.io.connection_points.first_input_connection_type() ||
			JsConnectionPointType.FLOAT) as AllowedInputType;
		if (ALLOWED_INPUTS.includes(type)) {
			return [type];
		} else {
			return [JsConnectionPointType.FLOAT];
		}
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	private _expectedInputName(index: number): string {
		return INPUT_NAME;
	}
	private _expectedOutputName(index: number): string {
		return OUTPUT_NAME;
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const varName = this.jsVarName(this._expectedOutputName(0));

		const inputType = this._expectedInputTypes()[0];
		const variable = createVariable(inputType);
		const tmpVarName = variable ? shadersCollectionController.addVariable(this, variable) : undefined;

		const inputValue = this.variableForInput(shadersCollectionController, INPUT_NAME);
		const functionName = EASING_NAMES[this.pv.type];
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);

		const isPrimitive = isJsConnectionPointPrimitive(inputType);

		// primitive
		if (isPrimitive) {
			return shadersCollectionController.addBodyOrComputed(this, [
				{dataType: JsConnectionPointType.FLOAT, varName, value: func.asString(inputValue)},
			]);
		}

		// color / vector
		const vectorFunctionName = _vectorFunctionName_1(inputType);
		if (vectorFunctionName && tmpVarName) {
			func.asString('');
			const vectorFunc = Poly.namedFunctionsRegister.getFunction(
				vectorFunctionName,
				this,
				shadersCollectionController
			);
			return shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.FLOAT,
					varName,
					value: vectorFunc.asString(...[functionName, inputValue, tmpVarName]),
				},
			]);
		}
	}
}
