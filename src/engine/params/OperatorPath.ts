// import {TypedParamVisitor} from './_Base';
import {TypedParam} from './_Base';
import {CoreWalker} from '../../core/Walker';

// import {AsCodeOperatorPath} from './concerns/visitors/OperatorPath';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
// import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {NodeContext, BaseNodeByContextMap, ChildrenNodeMapByContextMap} from '../poly/NodeContext';

export class OperatorPathParam extends TypedParam<ParamType.OPERATOR_PATH> {
	private _found_node: BaseNodeType | null = null;
	private _found_node_with_expected_type: BaseNodeType | null = null;

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
		this._value = this._raw_input;
		this.set_dirty();
		this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
	}

	protected async process_computation() {
		const path = this._value;
		let node = null;
		const path_non_empty = path != null && path !== '';

		if (path_non_empty) {
			node = CoreWalker.find_node(this.node, path);
			// not sure I want the param to be errored,
			// as it may block the node, even if the param is not necessary
			// if (!node) {
			// 	this.states.error.set('node not found');
			// }
		}

		if (this._found_node !== node) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			if (this._found_node) {
				if (dependent_on_found_node) {
					this.remove_graph_input(this._found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}
			this._found_node = node;
			if (node) {
				if (this._is_node_expected_context(node)) {
					if (this._is_node_expected_type(node)) {
						this._found_node_with_expected_type = node;
						if (dependent_on_found_node) {
							this.add_graph_input(node);
						}
						// this._found_node.add_param_referree(this) // TODO: typescript
					} else {
						this.states.error.set(
							`node type is ${node.type} but the params expects a ${this._expected_type()}`
						);
					}
				} else {
					this.states.error.set(
						`node context is ${node.node_context()} but the params expects a ${this._expected_context()}`
					);
				}
			} // else {
			// 	if (path_non_empty) {
			// 		this.states.error.set('node not found');
			// 	}
			// }
			this.options.execute_callback();
		}
		this.remove_dirty_state();
	}

	found_node() {
		return this._found_node;
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
	private _expected_type() {
		return this.options.node_selection_type;
	}
	private _is_node_expected_type(node: BaseNodeType) {
		const expected_type = this._expected_type();
		if (expected_type == null) {
			return true;
		}
		const node_type = node.type;
		return expected_type == node_type;
	}
}
