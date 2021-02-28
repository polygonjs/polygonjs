import {TypedPathParam} from './_BasePath';
import {CoreWalker} from '../../core/Walker';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {TypedNodePathParamValue} from '../../core/Walker';

export class NodePathParam extends TypedPathParam<ParamType.NODE_PATH> {
	// private _found_node: BaseNodeType | null = null;

	static type() {
		return ParamType.NODE_PATH;
	}
	initialize_param() {
		this._value = new TypedNodePathParamValue();
	}

	defaultValueSerialized() {
		return this._default_value;
	}
	rawInputSerialized() {
		return `${this._raw_input}`;
	}
	valueSerialized() {
		return `${this.value}`;
	}
	protected _copy_value(param: NodePathParam) {
		this.set(param.valueSerialized());
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
	isDefault(): boolean {
		return this._raw_input == this._default_value;
	}
	setNode(node: BaseNodeType) {
		this.set(node.fullPath());
	}
	protected processRawInput() {
		if (this._value.path() != this._raw_input) {
			this._value.set_path(this._raw_input);
			this._findTarget();
			this.setDirty();
			this.emitController.emit(ParamEvent.VALUE_UPDATED);
		}
	}
	protected async process_computation() {
		this._findTarget();
	}
	private _findTarget() {
		if (!this.node) {
			return;
		}
		const path = this._raw_input;
		let node: BaseNodeType | null = null;
		const path_non_empty = path != null && path !== '';

		this.scene().referencesController.reset_reference_from_param(this); // must be before decomposed path is changed
		this.decomposed_path.reset();
		if (path_non_empty) {
			node = CoreWalker.findNode(this.node, path, this.decomposed_path);
		}

		const current_found_entity = this._value.node();
		const newly_found_entity = node;

		this.scene().referencesController.set_named_nodes_from_param(this);
		if (node) {
			this.scene().referencesController.set_reference_from_param(this, node);
		}

		if (current_found_entity?.graphNodeId() !== newly_found_entity?.graphNodeId()) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			const previously_found_node = this._value.node();
			if (previously_found_node) {
				if (dependent_on_found_node) {
					this.removeGraphInput(previously_found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}

			if (node) {
				this._assign_found_node(node);
			} else {
				this._value.set_node(null);
			}

			this.options.execute_callback();
		}
		if (path_non_empty && !node && this.scene().loadingController.loaded()) {
			if (path_non_empty) {
				this.states.error.set(`no node found at path '${path}'`);
			}
		}

		this.removeDirtyState();
	}

	private _assign_found_node(node: BaseNodeType) {
		const dependent_on_found_node = this.options.dependent_on_found_node();
		if (this._isNodeExpectedContext(node)) {
			if (this._is_node_expected_type(node)) {
				this.states.error.clear();
				this._value.set_node(node);
				if (dependent_on_found_node) {
					this.addGraphInput(node);
				}
			} else {
				this.states.error.set(
					`node type is ${node.type()} but the params expects one of ${(
						this._expected_node_types() || []
					).join(', ')}`
				);
			}
		} else {
			this.states.error.set(
				`node context is ${node.nodeContext()} but the params expects a ${this._expectedContext()}`
			);
		}
	}

	private _expectedContext() {
		return this.options.nodeSelectionContext();
	}
	private _isNodeExpectedContext(node: BaseNodeType) {
		const expected_context = this._expectedContext();
		if (expected_context == null) {
			return true;
		}
		const node_context = node.parent()?.childrenController?.context;
		return expected_context == node_context;
	}
	private _expected_node_types() {
		return this.options.nodeSelectionTypes();
	}

	private _is_node_expected_type(node: BaseNodeType) {
		const expected_types = this._expected_node_types();
		if (expected_types == null) {
			return true;
		}
		return expected_types?.includes(node.type());
	}

	notify_path_rebuild_required(node: BaseNodeType) {
		this.decomposed_path.update_from_name_change(node);
		const new_path = this.decomposed_path.to_path();
		this.set(new_path);
	}
	notify_target_param_owner_params_updated(node: BaseNodeType) {
		this.setDirty();
	}
}
