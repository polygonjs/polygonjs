import {Poly} from '../../Poly';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamlessTypedJsNode} from './_Base';

// const OUTPUT_NAME = 'val';
export type AllowedType = JsConnectionPointType.BOOLEAN | JsConnectionPointType.BOOLEAN_ARRAY;
const ALLOWED_TYPES: AllowedType[] = [JsConnectionPointType.BOOLEAN, JsConnectionPointType.BOOLEAN_ARRAY];

export abstract class BaseLogicOperationJsNode extends ParamlessTypedJsNode {
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return `${type}${index}`;
	}

	protected _expectedInputTypes(): AllowedType[] {
		const firstInputType = this.io.connection_points.first_input_connection_type();
		const type =
			firstInputType != null && ALLOWED_TYPES.includes(firstInputType as AllowedType)
				? (firstInputType as AllowedType)
				: JsConnectionPointType.BOOLEAN;

		const currentConnections = this.io.connections.existingInputConnections();
		const expectedCount = currentConnections ? Math.max(currentConnections.length + 1, 2) : 2;
		const expectedInputTypes: AllowedType[] = [];
		for (let i = 0; i < expectedCount; i++) {
			expectedInputTypes.push(type);
		}
		return expectedInputTypes;
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.BOOLEAN];
	}
	protected abstract _expectedOutputName(index: number): string;
	protected abstract _functionName(firstType: AllowedType): 'orBooleans' | 'orArrays' | 'andBooleans' | 'andArrays';

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputValuesCount = this._expectedInputTypes().length - 1; // -1 as we don't take the last one
		const inputArgs: string[] = [];
		for (let i = 0; i < inputValuesCount; i++) {
			const element = this.variableForInput(shadersCollectionController, this._expectedInputName(i));
			inputArgs.push(element);
		}
		const inputElements = `[${inputArgs.join(',')}]`;
		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));

		const firstType = this._expectedInputTypes()[0];
		const functionName = this._functionName(firstType);

		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(inputElements),
			},
		]);
	}
}
