/**
 * outputs its input without any change
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

class NullJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullJsParamsConfig();

export class NullJsNode extends TypedJsNode<NullJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): [JsConnectionPointType] {
		const firstType = this.io.connection_points.first_input_connection_type() || JsConnectionPointType.FLOAT_ARRAY;
		return [firstType];
	}

	protected _expectedInputName(index: number): string {
		return 'in';
	}
	protected _expectedOutputName(index: number): string {
		return 'out';
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		return [firstType];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputValue = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: inputValue,
			},
		]);
	}
}
