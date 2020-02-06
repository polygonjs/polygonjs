import {BaseParamType} from '../_Base';

export interface ParamSerializerData {
	name: string;
	type: string;
	value: any;
	expression?: string;
	graph_node_id: string;
	is_dirty: boolean;
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
			value: this.param.value,
			expression: this.param.has_expression() ? this.param.expression_controller?.expression : undefined,
			graph_node_id: this.param.graph_node_id,
			is_dirty: this.param.is_dirty,
			error_message: this.param.states.error.message,
			is_visible: this.param.options.is_visible(),
			folder_name: this.param.ui_data.folder_name,
			components: undefined,
		};

		if (this.param.is_multiple && this.param.components) {
			data['components'] = this.param.components.map((component) => component.graph_node_id);
		}

		return data;
	}
}
