import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {BaseParamType} from '../_Base';
import {
	ParamValueSerializedTypeMap,
	ParamValuePreConversionSerializedTypeMap,
} from '../types/ParamValueSerializedTypeMap';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValueSerializedTypeMap} from '../types/ParamInitValueSerializedTypeMap';

export interface ParamSerializerData {
	name: string;
	type: ParamType;
	raw_input: ParamInitValueSerializedTypeMap[ParamType];
	value: ParamValueSerializedTypeMap[ParamType];
	value_pre_conversion: ParamValuePreConversionSerializedTypeMap[ParamType];
	expression?: string;
	graph_node_id: CoreGraphNodeId;
	// is_dirty: boolean;
	error_message?: string;
	is_visible: boolean;
	folder_name?: string;
	components?: CoreGraphNodeId[];
}

export class ParamSerializer {
	constructor(protected param: BaseParamType) {}

	toJSON(): ParamSerializerData {
		const data: ParamSerializerData = {
			name: this.param.name(),
			type: this.param.type(),
			raw_input: this.raw_input(),
			value: this.value(),
			value_pre_conversion: this.value_pre_conversion(),
			expression: this.expression(),
			graph_node_id: this.param.graphNodeId(),
			// is_dirty: this.param.isDirty(),
			error_message: this.error_message(),
			is_visible: this.is_visible(),
			// folder_name: this.param.uiData.folder_name,
			components: undefined,
		};

		if (this.param.isMultiple() && this.param.components) {
			data['components'] = this.param.components.map((component) => component.graphNodeId());
		}

		return data;
	}

	raw_input() {
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
		return this.param.options.is_visible();
	}
}
