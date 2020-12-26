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

	to_json(): ParamSerializerData {
		const data: ParamSerializerData = {
			name: this.param.name,
			type: this.param.type,
			raw_input: this.raw_input(),
			value: this.value(),
			value_pre_conversion: this.value_pre_conversion(),
			expression: this.expression(),
			graph_node_id: this.param.graph_node_id,
			// is_dirty: this.param.is_dirty,
			error_message: this.error_message(),
			is_visible: this.is_visible(),
			// folder_name: this.param.uiData.folder_name,
			components: undefined,
		};

		if (this.param.is_multiple && this.param.components) {
			data['components'] = this.param.components.map((component) => component.graph_node_id);
		}

		return data;
	}

	raw_input() {
		return this.param.raw_input_serialized;
	}
	value() {
		return this.param.value_serialized;
	}
	value_pre_conversion() {
		return this.param.value_pre_conversion_serialized;
	}
	expression() {
		return this.param.has_expression() ? this.param.expression_controller?.expression : undefined;
	}
	error_message() {
		return this.param.states.error.message;
	}
	is_visible() {
		return this.param.options.is_visible;
	}
}
