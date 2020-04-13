import {BaseParamType} from '../_Base';
import {ParamValueSerializedTypeMap} from '../types/ParamValueSerializedTypeMap';
import {ParamType} from '../../poly/ParamType';
import {ParamInitValueSerializedTypeMap} from '../types/ParamInitValueSerializedTypeMap';

export interface ParamSerializerData {
	name: string;
	type: ParamType;
	raw_input: ParamInitValueSerializedTypeMap[ParamType];
	value: ParamValueSerializedTypeMap[ParamType];
	expression?: string;
	graph_node_id: string;
	// is_dirty: boolean;
	error_message?: string;
	is_visible: boolean;
	folder_name?: string;
	components?: string[];
}

export class ParamSerializer {
	constructor(protected param: BaseParamType) {}

	to_json(): ParamSerializerData {
		const data: ParamSerializerData = {
			name: this.param.name,
			type: this.param.type,
			raw_input: this.raw_input(),
			value: this.value(),
			expression: this.expression(),
			graph_node_id: this.param.graph_node_id,
			// is_dirty: this.param.is_dirty,
			error_message: this.error_message(),
			is_visible: this.is_visible(),
			// folder_name: this.param.ui_data.folder_name,
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
