import {BaseNodeType} from 'src/engine/nodes/_Base';
// import lodash_includes from 'lodash/includes';
// import lodash_values from 'lodash/values';

export class TimeDependentState {
	constructor(protected node: BaseNodeType) {}

	get active() {
		return this.are_params_time_dependent() || this.are_inputs_time_dependent();
	}

	are_params_time_dependent(): boolean {
		const param_names = this.node.params.names;
		for (let param_name of param_names) {
			const param = this.node.params.get(param_name);
			if (param && param.states.time_dependent.active) {
				return true;
			}
		}
		return false;
	}

	are_inputs_time_dependent(): boolean {
		const inputs = this.node.io.inputs.inputs();
		for (let input of inputs) {
			if (input && input.states.time_dependent.active) {
				return true;
			}
		}
		return false;
	}

	// protected _force_time_dependent() {
	// 	const predecessor_ids = this.graph_predecessors().map((n) => n.graph_node_id);
	// 	const scene_context = this.scene().context();
	// 	if (!lodash_includes(predecessor_ids, scene_context.graph_node_id)) {
	// 		this.self.add_graph_input(scene_context);
	// 	}
	// }
	// protected _unforce_time_dependent() {
	// 	const scene_context = this.scene().context();
	// 	this.self.remove_graph_input(scene_context);
	// }
}

// import {BaseNode} from '../_Base';

// export function TimeDependent<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseNode = (<unknown>this) as BaseNode;

// 		is_time_dependent(): boolean {
// 			return this.are_params_time_dependent() || this.are_inputs_time_dependent();
// 		}

// 		are_params_time_dependent(): boolean {
// 			let params_time_dependent = false;
// 			lodash_values(this.self.params()).forEach((param) => {
// 				if (param.is_time_dependent()) {
// 					params_time_dependent = true;
// 				}
// 			});
// 			return params_time_dependent;
// 		}

// 		are_inputs_time_dependent(): boolean {
// 			let inputs_time_dependent = false;
// 			this.self.inputs().forEach((node) => {
// 				if (node != null && node.is_time_dependent()) {
// 					inputs_time_dependent = true;
// 				}
// 			});
// 			return inputs_time_dependent;
// 		}

// 		protected _force_time_dependent() {
// 			const predecessor_ids = this.graph_predecessors().map((n) => n.graph_node_id);
// 			const scene_context = this.scene().context();
// 			if (!lodash_includes(predecessor_ids, scene_context.graph_node_id)) {
// 				this.self.add_graph_input(scene_context);
// 			}
// 		}
// 		protected _unforce_time_dependent() {
// 			const scene_context = this.scene().context();
// 			this.self.remove_graph_input(scene_context);
// 		}
// 	};
// }
