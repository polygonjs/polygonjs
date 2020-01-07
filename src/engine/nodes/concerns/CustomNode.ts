import {BaseNode} from '../_Base';

interface CustomNodeParamData {
	expression: string;
	value: any;
}

export function CustomNode<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;

		rebuild_custom_node() {}

		static is_custom_node() {
			return false;
		}

		custom_node_recreate_params() {
			const values_by_param_name: Dictionary<CustomNodeParamData> = {};
			const current_param_names: string[] = this.self.param_names();
			for (let param_name of current_param_names) {
				const param = this.self.param(param_name);
				const param_data: CustomNodeParamData = {};
				if (param.has_expression()) {
					param_data['expression'] = param.expression();
				} else {
					param_data['value'] = param.value();
				}
				values_by_param_name[param_name] = param_data;
				this.self.delete_param(param_name);
			}
			this.self.init_parameters();

			for (let param_name of Object.keys(values_by_param_name)) {
				if (this.has_param(param_name)) {
					const param = this.param(param_name);
					const param_data = values_by_param_name[param_name];
					if (param_data['expression']) {
						param.set_expression(param_data['expression']);
					} else {
						param.set(param_data['value']);
					}
				}
			}
			if (!this.self.scene().is_loading()) {
				this.self.emit('params_updated');
			}
		}
	};
}
