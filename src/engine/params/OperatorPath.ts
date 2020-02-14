// import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';
import {CoreWalker} from 'src/core/Walker';

// import {AsCodeOperatorPath} from './concerns/visitors/OperatorPath';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {ParamType} from '../poly/ParamType';
// import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class OperatorPathParam extends Single<ParamType.OPERATOR_PATH> {
	private _found_node: BaseNodeType | null = null;

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
		this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
	}

	protected async process_computation() {
		const path = this._value;
		let node = null;

		if (path != null && path !== '') {
			node = CoreWalker.find_node(this.node, path);
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
				const expected_context = this.options.node_selection_context;
				const node_context = node.parent?.children_controller?.context;
				if (expected_context == node_context || expected_context == null) {
					if (dependent_on_found_node) {
						this.add_graph_input(node);
					} else {
						// this._found_node.add_param_referree(this) // TODO: typescript
					}
				} else {
					this.states.error.set(
						`node context is ${expected_context} but the params expects a ${node_context}`
					);
				}
			}
		}
	}

	found_node() {
		return this._found_node;
	}
}
