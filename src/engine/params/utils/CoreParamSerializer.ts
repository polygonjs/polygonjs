import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {TypedParam} from '../_Base';
import {
	ParamValueSerializedTypeMap,
	ParamValuePreConversionSerializedTypeMap,
} from '../types/ParamValueSerializedTypeMap';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValueSerializedTypeMap} from '../types/ParamInitValueSerializedTypeMap';

export interface ParamSerializerData<T extends ParamType> {
	name: string;
	type: T;
	raw_input: ParamInitValueSerializedTypeMap[T];
	value: ParamValueSerializedTypeMap[T];
	value_pre_conversion: ParamValuePreConversionSerializedTypeMap[T];
	expression?: string;
	graph_node_id: CoreGraphNodeId;
	// is_dirty: boolean;
	error_message?: string;
	is_visible: boolean;
	editable: boolean;
	folder_name?: string;
	components?: Readonly<CoreGraphNodeId[]>;
}

export class CoreParamSerializer<T extends ParamType> {
	constructor(public readonly param: TypedParam<T>) {}

	toJSON(): ParamSerializerData<T> {
		const data: ParamSerializerData<T> = {
			name: this.param.name(),
			type: this.param.type(),
			raw_input: this.rawInput(),
			value: this.value(),
			value_pre_conversion: this.value_pre_conversion(),
			expression: this.expression(),
			graph_node_id: this.param.graphNodeId(),
			// is_dirty: this.param.isDirty(),
			error_message: this.error_message(),
			is_visible: this.is_visible(),
			editable: this.editable(),
			// folder_name: this.param.uiData.folder_name,
			components: undefined,
		};

		if (this.param.isMultiple() && this.param.components) {
			data['components'] = this.param.components.map((component) => component.graphNodeId());
		}

		return data;
	}

	rawInput() {
		return this.param.rawInputSerialized();
	}
	value() {
		return this.param.valueSerialized();
	}
	value_pre_conversion() {
		return this.param.valuePreConversionSerialized();
	}
	expression() {
		return this.param.hasExpression() ? this.param.expressionController?.expression() : undefined;
	}
	error_message() {
		return this.param.states.error.message();
	}
	is_visible() {
		return this.param.options.isVisible();
	}
	editable() {
		return this.param.options.editable();
	}
}

export type BaseParamSerializer = typeof CoreParamSerializer<ParamType>;
