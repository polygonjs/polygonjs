/**
 * creates an array
 *
 *
 *
 */
import {
	JsConnectionPointType,
	ARRAYABLE_CONNECTION_TYPES,
	JsConnectionPointTypeToArrayTypeMap,
	ArrayableConnectionPointType,
} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {
	RegisterableVariable,
	createPrimitiveArray,
	createVectorArray,
} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';

const ALLOWED_INPUT_TYPES = ARRAYABLE_CONNECTION_TYPES;

interface SetLinesOptions {
	inputElements: string;
	dataType: ArrayableConnectionPointType;
	varName: string;
	shadersCollectionController: ShadersCollectionController;
}

class ElementsToArrayJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ElementsToArrayJsParamsConfig();

export class ElementsToArrayJsNode extends TypedJsNode<ElementsToArrayJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'elementsToArray';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes(): ArrayableConnectionPointType[] {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type: ArrayableConnectionPointType =
			firstType != null && ALLOWED_INPUT_TYPES.has(firstType as ArrayableConnectionPointType)
				? (firstType as ArrayableConnectionPointType)
				: JsConnectionPointType.FLOAT;

		const currentConnections = this.io.connections.existingInputConnections();

		const expectedCount = currentConnections ? Math.max(currentConnections.length + 1, 2) : 2;
		const expectedInputTypes: ArrayableConnectionPointType[] = [];
		for (let i = 0; i < expectedCount; i++) {
			expectedInputTypes.push(type);
		}
		return expectedInputTypes;
	}

	protected _expectedInputName(index: number): string {
		return `element${index}`;
	}
	protected _expectedOutputName(index: number): string {
		const type = this._expectedInputTypes()[0];
		return `${type}[]`;
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		const outputType = JsConnectionPointTypeToArrayTypeMap[firstType] || JsConnectionPointType.FLOAT_ARRAY;
		return [outputType];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputValuesCount = this._expectedInputTypes().length - 1;
		const inputArgs: string[] = [];
		for (let i = 0; i < inputValuesCount; i++) {
			const element = this.variableForInput(shadersCollectionController, this._expectedInputName(i));
			inputArgs.push(element);
		}
		const inputElements = `[${inputArgs.join(',')}]`;

		const dataType = this._expectedInputTypes()[0];
		const varName = this.jsVarName(this._expectedOutputName(0));
		const options: SetLinesOptions = {
			shadersCollectionController,
			inputElements,
			dataType,
			varName,
		};

		const firstType = this._expectedInputTypes()[0];
		switch (firstType) {
			case JsConnectionPointType.BOOLEAN:
			case JsConnectionPointType.FLOAT:
			case JsConnectionPointType.INT:
			case JsConnectionPointType.STRING: {
				return this._setLinesAsPrimitive(options);
			}
			case JsConnectionPointType.COLOR:
			case JsConnectionPointType.MATRIX4:
			case JsConnectionPointType.QUATERNION:
			case JsConnectionPointType.VECTOR2:
			case JsConnectionPointType.VECTOR3:
			case JsConnectionPointType.VECTOR4: {
				return this._setLinesAsVector(options);
			}
			case JsConnectionPointType.INTERSECTION: {
				return this._setLinesAsIntersection(options);
			}
			case JsConnectionPointType.TEXTURE: {
				return this._setLinesAsTexture(options);
			}
		}
	}
	private _setLinesAsPrimitive(options: SetLinesOptions) {
		const {shadersCollectionController, varName, dataType, inputElements} = options;

		shadersCollectionController.addVariable(this, varName, createPrimitiveArray(dataType) as RegisterableVariable);
		const func = Poly.namedFunctionsRegister.getFunction(
			'elementsToArrayPrimitive',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(inputElements, varName),
			},
		]);
	}
	private _setLinesAsVector(options: SetLinesOptions) {
		const {shadersCollectionController, varName, dataType, inputElements} = options;

		shadersCollectionController.addVariable(this, varName, createVectorArray(dataType) as RegisterableVariable);
		const func = Poly.namedFunctionsRegister.getFunction(
			'elementsToArrayPrimitive',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(inputElements, varName),
			},
		]);
	}
	private _setLinesAsIntersection(options: SetLinesOptions) {
		console.warn('not implemented');
	}
	private _setLinesAsTexture(options: SetLinesOptions) {
		console.warn('not implemented');
	}

	// public override outputValue(context: JsNodeTriggerContext) {
	// 	const inputsCount = this.io.inputs.namedInputConnectionPoints().length - 1;
	// 	const array = new Array(inputsCount);
	// 	for (let i = 0; i < inputsCount; i++) {
	// 		const inputName = this._expectedInputName(i);
	// 		array[i] = this._inputValue<ArrayabeonnectionPointType>(inputName, context);
	// 	}
	// 	return array;
	// }
}
