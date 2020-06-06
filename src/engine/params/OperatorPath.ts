// import {TypedParamVisitor} from './_Base';
import {TypedParam, BaseParamType} from './_Base';
import {CoreWalker} from '../../core/Walker';

// import {AsCodeOperatorPath} from './concerns/visitors/OperatorPath';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
// import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {NodeContext, BaseNodeByContextMap, ChildrenNodeMapByContextMap} from '../poly/NodeContext';
import {ParamConstructorMap} from './types/ParamConstructorMap';
import {DecomposedPath} from '../../core/DecomposedPath';

enum OperatorPathMode {
	NODE = 'NODE',
	PARAM = 'PARAM',
}

export class OperatorPathParam extends TypedParam<ParamType.OPERATOR_PATH> {
	private _found_node: BaseNodeType | null = null;
	private _found_node_with_expected_type: BaseNodeType | null = null;
	private _found_param: BaseParamType | null = null;
	private _found_param_with_expected_type: BaseParamType | null = null;
	public readonly decomposed_path = new DecomposedPath();

	static type() {
		return ParamType.OPERATOR_PATH;
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
		raw_input1: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH],
		raw_input2: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(
		val1: ParamValuesTypeMap[ParamType.OPERATOR_PATH],
		val2: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
	) {
		return val1 == val2;
	}
	get is_default(): boolean {
		return this._value == this.default_value;
	}
	protected process_raw_input() {
		if (this._value != this._raw_input) {
			this._value = this._raw_input;
			this.set_dirty();
			this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
		}
	}
	protected async process_computation() {
		this.find_target();
	}
	find_target() {
		if (!this.node) {
			return;
		}
		const path = this._value;
		let node: BaseNodeType | null = null;
		let param: BaseParamType | null = null;
		const path_non_empty = path != null && path !== '';
		const mode: OperatorPathMode = this.options.param_selection_options
			? OperatorPathMode.PARAM
			: OperatorPathMode.NODE;

		this.scene.references_controller.reset_reference_from_param(this); // must be before decomposed path is changed
		this.decomposed_path.reset();
		if (path_non_empty) {
			if (mode == OperatorPathMode.PARAM) {
				param = CoreWalker.find_param(this.node, path, this.decomposed_path);
			} else {
				node = CoreWalker.find_node(this.node, path, this.decomposed_path);
			}
		}

		const current_found_entity = mode == OperatorPathMode.PARAM ? this._found_param : this._found_node;
		const newly_found_entity = mode == OperatorPathMode.PARAM ? param : node;

		this.scene.references_controller.set_named_nodes_from_param(this);
		if (node) {
			this.scene.references_controller.set_reference_from_param(this, node);
		}

		if (current_found_entity?.graph_node_id !== newly_found_entity?.graph_node_id) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			if (this._found_node) {
				if (dependent_on_found_node) {
					this.remove_graph_input(this._found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}
			if (mode == OperatorPathMode.PARAM) {
				this._found_param = param;
				this._found_node = null;
			} else {
				this._found_node = node;
				this._found_param = null;
			}

			if (node) {
				this._assign_found_node(node);
			}
			if (param) {
				this._assign_found_param(param);
			}

			this.options.execute_callback();
		}
		this.remove_dirty_state();
	}

	private _assign_found_node(node: BaseNodeType) {
		const dependent_on_found_node = this.options.dependent_on_found_node();
		if (this._is_node_expected_context(node)) {
			if (this._is_node_expected_type(node)) {
				this._found_node_with_expected_type = node;
				if (dependent_on_found_node) {
					this.add_graph_input(node);
				}
			} else {
				this.states.error.set(
					`node type is ${node.type} but the params expects a ${this._expected_node_type()}`
				);
			}
		} else {
			this.states.error.set(
				`node context is ${node.node_context()} but the params expects a ${this._expected_context()}`
			);
		}
	}
	private _assign_found_param(param: BaseParamType) {
		if (this._is_param_expected_type(param)) {
			this._found_param_with_expected_type = param;
		} else {
			this.states.error.set(
				`param type is ${param.type} but the params expects a ${this._expected_param_type()}`
			);
		}
	}

	found_node() {
		return this._found_node;
	}
	found_param() {
		return this._found_param;
	}
	found_node_with_context<N extends NodeContext>(context: N): BaseNodeByContextMap[N] | undefined {
		return this._found_node_with_expected_type as BaseNodeByContextMap[N];
		// if (node) {
		// 	if (node.node_context() == context) {
		// 		return node as BaseNodeByContextMap[N];
		// 	} else {
		// 		this.states.error.set(`expected node context to be ${context}, but was instead ${node.node_context()}`);
		// 	}
		// } else {
		// 	this.states.error.set('no node found');
		// }
	}
	// found_node_with_context_and_type<N extends NodeContext, K extends keyof ChildrenNodeMapByContextMap[N]>(
	// 	context: N,
	// 	type: K
	// ): ChildrenNodeMapByContextMap[N][K] | undefined {
	found_node_with_context_and_type<N extends NodeContext, K extends keyof ChildrenNodeMapByContextMap[N]>(
		context: N,
		type: K
	): ChildrenNodeMapByContextMap[N][K] | undefined {
		const node = this.found_node_with_context(context);
		if (node) {
			if (node.type == type) {
				return (<unknown>node) as ChildrenNodeMapByContextMap[N][K];
			} else {
				this.states.error.set(`expected node type to be ${type}, but was instead ${node.type}`);
			}
		}
	}
	found_param_with_type<T extends ParamType>(type: T): ParamConstructorMap[T] | undefined {
		if (this._found_param_with_expected_type) {
			return this._found_param_with_expected_type as ParamConstructorMap[T];
		}
	}

	found_node_with_expected_type() {
		return this._found_node_with_expected_type;
	}
	private _expected_context() {
		return this.options.node_selection_context;
	}
	private _is_node_expected_context(node: BaseNodeType) {
		const expected_context = this._expected_context();
		if (expected_context == null) {
			return true;
		}
		const node_context = node.parent?.children_controller?.context;
		return expected_context == node_context;
	}
	private _expected_node_type() {
		return this.options.node_selection_type;
	}
	private _expected_param_type() {
		return this.options.param_selection_type;
	}
	private _is_node_expected_type(node: BaseNodeType) {
		const expected_type = this._expected_node_type();
		if (expected_type == null) {
			return true;
		}
		return expected_type == node.type;
	}
	private _is_param_expected_type(param: BaseParamType) {
		const expected_type = this._expected_node_type();
		if (expected_type == null) {
			return true;
		}
		return expected_type == param.type;
	}

	notify_path_rebuild_required(node: BaseNodeType) {
		this.decomposed_path.update_from_name_change(node);
		const new_path = this.decomposed_path.to_path();
		this.set(new_path);
	}
	notify_target_param_owner_params_updated(node: BaseNodeType) {
		this.set_dirty();
	}
}
