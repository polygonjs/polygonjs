import {TypedParam} from './_Base';
import {CoreWalker} from '../../core/Walker';
// import lodash_isArray from 'lodash/isArray';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
// import {NodeContext, BaseNodeByContextMap, ChildrenNodeMapByContextMap} from '../poly/NodeContext';
import {DecomposedPath} from '../../core/DecomposedPath';
import {TypedPathParamValue} from '../../core/Walker';

export const NODE_PATH_DEFAULT = {
	NODE: {
		UV: '/COP/file_uv',
		ENV_MAP: '/COP/env_map',
	},
};

export class NodePathParam extends TypedParam<ParamType.NODE_PATH> {
	private _found_node: BaseNodeType | null = null;
	public readonly decomposed_path = new DecomposedPath();

	static type() {
		return ParamType.NODE_PATH;
	}
	initialize_param() {
		this._value = new TypedPathParamValue();
	}

	get default_value_serialized() {
		return this.default_value;
	}
	get raw_input_serialized() {
		return `${this._raw_input}`;
	}
	get value_serialized() {
		return `${this.value}`;
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.NODE_PATH],
		raw_input2: ParamInitValuesTypeMap[ParamType.NODE_PATH]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(
		val1: ParamValuesTypeMap[ParamType.NODE_PATH],
		val2: ParamValuesTypeMap[ParamType.NODE_PATH]
	) {
		return val1 == val2;
	}
	get is_default(): boolean {
		return this._raw_input == this.default_value;
	}
	protected process_raw_input() {
		if (this._value.path() != this._raw_input) {
			this._value.set_path(this._raw_input);
			this.find_target();
			this.set_dirty();
			this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
		}
	}
	protected async process_computation() {
		this.find_target();
	}
	private find_target() {
		if (!this.node) {
			return;
		}
		const path = this._raw_input;
		let node: BaseNodeType | null = null;
		const path_non_empty = path != null && path !== '';

		this.scene.references_controller.reset_reference_from_param(this); // must be before decomposed path is changed
		this.decomposed_path.reset();
		if (path_non_empty) {
			node = CoreWalker.find_node(this.node, path, this.decomposed_path);
		}

		const current_found_entity = this._found_node;
		const newly_found_entity = node;

		this.scene.references_controller.set_named_nodes_from_param(this);
		if (node) {
			this.scene.references_controller.set_reference_from_param(this, node);
		}

		if (current_found_entity?.graph_node_id !== newly_found_entity?.graph_node_id) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			const previously_found_node = this._value.node();
			if (previously_found_node) {
				if (dependent_on_found_node) {
					this.remove_graph_input(previously_found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}

			this._value.set_node(node);

			// if (node) {
			// 	this._assign_found_node(node);
			// }

			this.options.execute_callback();
		}
		this.remove_dirty_state();
	}

	// private _assign_found_node(node: BaseNodeType) {
	// 	const dependent_on_found_node = this.options.dependent_on_found_node();
	// 	if (this._is_node_expected_context(node)) {
	// 		if (this._is_node_expected_type(node)) {
	// 			this._found_node_with_expected_type = node;
	// 			if (dependent_on_found_node) {
	// 				this.add_graph_input(node);
	// 			}
	// 		} else {
	// 			this.states.error.set(
	// 				`node type is ${node.type} but the params expects one of ${(this._expected_node_types() || []).join(
	// 					', '
	// 				)}`
	// 			);
	// 		}
	// 	} else {
	// 		this.states.error.set(
	// 			`node context is ${node.node_context()} but the params expects a ${this._expected_context()}`
	// 		);
	// 	}
	// }

	// found_node_with_context<N extends NodeContext>(context: N): BaseNodeByContextMap[N] | undefined {
	// 	return this._found_node_with_expected_type as BaseNodeByContextMap[N];
	// 	// if (node) {
	// 	// 	if (node.node_context() == context) {
	// 	// 		return node as BaseNodeByContextMap[N];
	// 	// 	} else {
	// 	// 		this.states.error.set(`expected node context to be ${context}, but was instead ${node.node_context()}`);
	// 	// 	}
	// 	// } else {
	// 	// 	this.states.error.set('no node found');
	// 	// }
	// }
	// found_node_with_context_and_type<N extends NodeContext, K extends keyof ChildrenNodeMapByContextMap[N]>(
	// 	context: N,
	// 	type: K
	// ): ChildrenNodeMapByContextMap[N][K] | undefined {
	// found_node_with_context_and_type<N extends NodeContext, K extends keyof ChildrenNodeMapByContextMap[N]>(
	// 	context: N,
	// 	type_or_types: K | K[]
	// ): ChildrenNodeMapByContextMap[N][K] | undefined {
	// 	const node = this.found_node_with_context(context);
	// 	if (node) {
	// 		if (lodash_isArray(type_or_types)) {
	// 			for (let type of type_or_types) {
	// 				if (node.type == type) {
	// 					return (<unknown>node) as ChildrenNodeMapByContextMap[N][K];
	// 				}
	// 			}
	// 			this.states.error.set(
	// 				`expected node type to be ${type_or_types.join(', ')}, but was instead ${node.type}`
	// 			);
	// 		} else {
	// 			const type = type_or_types;
	// 			if (node.type == type) {
	// 				return (<unknown>node) as ChildrenNodeMapByContextMap[N][K];
	// 			} else {
	// 				this.states.error.set(`expected node type to be ${type}, but was instead ${node.type}`);
	// 			}
	// 		}
	// 	}
	// }

	// found_node_with_expected_type() {
	// 	return this._found_node_with_expected_type;
	// }
	// private _expected_context() {
	// 	return this.options.node_selection_context;
	// }
	// private _is_node_expected_context(node: BaseNodeType) {
	// 	const expected_context = this._expected_context();
	// 	if (expected_context == null) {
	// 		return true;
	// 	}
	// 	const node_context = node.parent?.children_controller?.context;
	// 	return expected_context == node_context;
	// }
	// private _expected_node_types() {
	// 	return this.options.node_selection_types;
	// }

	// private _is_node_expected_type(node: BaseNodeType) {
	// 	const expected_types = this._expected_node_types();
	// 	if (expected_types == null) {
	// 		return true;
	// 	}
	// 	return expected_types?.includes(node.type);
	// }

	notify_path_rebuild_required(node: BaseNodeType) {
		this.decomposed_path.update_from_name_change(node);
		const new_path = this.decomposed_path.to_path();
		this.set(new_path);
	}
	notify_target_param_owner_params_updated(node: BaseNodeType) {
		this.set_dirty();
	}
}
