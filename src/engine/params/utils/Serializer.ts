import {BaseParam} from '../_Base';
export class ParamSerializer {
	constructor(protected param: BaseParam) {}

	to_json() {
		const data = {
			name: this.param.name,
			type: this.param.type,
			value: this.param.value(),
			// expression: this.self.expression(), // TODO: typescript
			// result: this.self.result(),// TODO: typescript
			graph_node_id: this.param.graph_node_id,
			is_dirty: this.param.is_dirty,
			error_message: this.param.states.error.message,
			is_visible: this.param.options.is_visible(),
			folder_name: this.param.ui_data.folder_name,
			components: null as string[] | null,
		};

		if (this.param.is_multiple) {
			data['components'] = this.param.components.map((component) => component.graph_node_id);
		}

		return data;
	}
}
