/**
 * displays the input value
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {DebugOptions} from '../../functions/_Debug';

interface FunctionOptions {
	linesController: JsLinesCollectionController;
	inputValue?: string;
}

class DebugJsParamsConfig extends NodeParamsConfig {
	displayValue = ParamConfig.BOOLEAN(1);
	displayFrame = ParamConfig.BOOLEAN(1);
	displayTime = ParamConfig.BOOLEAN(0);
	displayNodePath = ParamConfig.BOOLEAN(1);
	message = ParamConfig.STRING('');
	bundleByObject = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new DebugJsParamsConfig();

export class DebugJsNode extends TypedJsNode<DebugJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'debug';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['displayValue']);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): [JsConnectionPointType] {
		const firstType = this.io.connection_points.first_input_connection_type() || JsConnectionPointType.FLOAT;
		return [firstType];
	}

	protected _expectedInputName(index: number): string {
		return [`in`][index];
	}
	protected _expectedOutputName(index: number): string {
		const type = this._expectedOutputTypes()[0];
		return `${type}`;
	}
	protected _expectedOutputTypes() {
		return this._expectedInputTypes();
	}
	override setLines(linesController: JsLinesCollectionController) {
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const inputValue = this.variableForInput(linesController, this._expectedInputName(0));

		linesController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: this._function({
					linesController,
					inputValue,
				}),
			},
		]);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const bodyLine = this._function({
			linesController,
		});
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _function(options: FunctionOptions): string {
		const {linesController, inputValue} = options;
		const object3D = inputObject3D(this, linesController);
		const nodePath = `'${this.path()}'`;
		const debugOptions: DebugOptions = {
			displayValue: this.pv.displayValue,
			displayFrame: this.pv.displayFrame,
			displayTime: this.pv.displayTime,
			displayNodePath: this.pv.displayNodePath,
			message: this.pv.message,
			bundleByObject: this.pv.bundleByObject,
		};
		const func = Poly.namedFunctionsRegister.getFunction('debug', this, linesController);

		return func.asString(object3D, nodePath, inputValue || `''`, JSON.stringify(debugOptions));
	}
}
