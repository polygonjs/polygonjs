/**
 * displays the input value
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

class DebugJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DebugJsParamsConfig();

export class DebugJsNode extends TypedJsNode<DebugJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'debug';
	}
	override initializeNode() {
		super.initializeNode();
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
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const nodePath = `'${this.path()}'`;
		const inputValue = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const func = Poly.namedFunctionsRegister.getFunction('debug', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(object3D, nodePath, inputValue),
			},
		]);
	}
}
