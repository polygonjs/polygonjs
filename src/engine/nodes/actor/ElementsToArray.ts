/**
 * creates an array
 *
 *
 *
 */
import {
	ActorConnectionPointType,
	ARRAYABLE_CONNECTION_TYPES,
	ActorConnectionPointTypeToArrayTypeMap,
	ArrayabeonnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

const ALLOWED_INPUT_TYPES = ARRAYABLE_CONNECTION_TYPES;

class ElementsToArrayActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ElementsToArrayActorParamsConfig();

export class ElementsToArrayActorNode extends TypedActorNode<ElementsToArrayActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'elementsToArray';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType && ALLOWED_INPUT_TYPES.has(firstType as ArrayabeonnectionPointType)
				? firstType
				: ActorConnectionPointType.FLOAT;

		const currentConnections = this.io.connections.existingInputConnections();

		const expectedCount = currentConnections ? Math.max(currentConnections.length + 1, 2) : 2;
		const expectedInputTypes: ActorConnectionPointType[] = [];
		for (let i = 0; i < expectedCount; i++) {
			expectedInputTypes.push(type);
		}
		return expectedInputTypes;
	}

	protected _expectedInputName(index: number): string {
		return `element${index}`;
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		const outputType = ActorConnectionPointTypeToArrayTypeMap[firstType] || ActorConnectionPointType.FLOAT_ARRAY;
		return [outputType];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const inputsCount = this.io.inputs.namedInputConnectionPoints().length - 1;
		const array = new Array(inputsCount);
		for (let i = 0; i < inputsCount; i++) {
			const inputName = this._expectedInputName(i);
			array[i] = this._inputValue<ArrayabeonnectionPointType>(inputName, context);
		}
		return array;
	}
}
