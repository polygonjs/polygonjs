// import {TypedParamVisitor} from './_Base';
import {BaseParamType} from './_Base';
import {TypedPathParam} from './_BasePath';
import {CoreWalker} from '../../core/Walker';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {NodeContext, BaseNodeByContextMap, ChildrenNodeMapByContextMap} from '../poly/NodeContext';
import {ParamConstructorMap} from './types/ParamConstructorMap';
import {CoreType} from '../../core/Type';

enum OperatorPathMode {
	NODE = 'NODE',
	PARAM = 'PARAM',
}

export class OperatorPathParam extends TypedPathParam<ParamType.OPERATOR_PATH> {
	private _found_node: BaseNodeType | null = null;
	private _found_node_with_expected_type: BaseNodeType | null = null;
	private _found_param: BaseParamType | null = null;
	private _found_param_with_expected_type: BaseParamType | null = null;

	static type() {
		return ParamType.OPERATOR_PATH;
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
	protected _copy_value(param: OperatorPathParam) {
		this.set(param.valueSerialized());
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
	isDefault(): boolean {
		return this._value == this._default_value;
	}
	setNode(node: BaseNodeType) {
		this.set(node.path());
	}
	protected processRawInput() {
		if (this._value != this._raw_input) {
			this._value = this._raw_input;
			this.setDirty();
			this.emitController.emit(ParamEvent.VALUE_UPDATED);
		}
	}
	protected async processComputation() {
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
		const mode: OperatorPathMode = this.options.paramSelectionOptions()
			? OperatorPathMode.PARAM
			: OperatorPathMode.NODE;

		this.scene().referencesController.resetReferenceFromParam(this); // must be before decomposed path is changed
		this.decomposed_path.reset();
		if (path_non_empty) {
			if (mode == OperatorPathMode.PARAM) {
				param = CoreWalker.findParam(this.node, path, this.decomposed_path);
			} else {
				node = CoreWalker.findNode(this.node, path, this.decomposed_path);
			}
		}

		const current_found_entity = mode == OperatorPathMode.PARAM ? this._found_param : this._found_node;
		const newly_found_entity = mode == OperatorPathMode.PARAM ? param : node;

		this._handleReferences(node, path);

		if (current_found_entity?.graphNodeId() !== newly_found_entity?.graphNodeId()) {
			const dependent_on_found_node = this.options.dependentOnFoundNode();

			if (this._found_node) {
				if (dependent_on_found_node) {
					this.removeGraphInput(this._found_node);
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

			this.options.executeCallback();
		}
		this.removeDirtyState();
	}

	private _assign_found_node(node: BaseNodeType) {
		const dependent_on_found_node = this.options.dependentOnFoundNode();
		if (this._is_node_expected_context(node)) {
			if (this._is_node_expected_type(node)) {
				this._found_node_with_expected_type = node;
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
				`node context is ${node.context()} but the params expects a ${this._expected_context()}`
			);
		}
	}
	private _assign_found_param(param: BaseParamType) {
		if (this._is_param_expected_type(param)) {
			this._found_param_with_expected_type = param;
		} else {
			this.states.error.set(
				`param type is ${param.type()} but the params expects a ${this._expected_param_type()}`
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
		type_or_types: K | K[]
	): ChildrenNodeMapByContextMap[N][K] | undefined {
		const node = this.found_node_with_context(context);
		if (node) {
			if (CoreType.isArray(type_or_types)) {
				for (let type of type_or_types) {
					if (node.type() == type) {
						return (<unknown>node) as ChildrenNodeMapByContextMap[N][K];
					}
				}
				this.states.error.set(
					`expected node type to be ${type_or_types.join(', ')}, but was instead ${node.type()}`
				);
			} else {
				const type = type_or_types;
				if (node.type() == type) {
					return (<unknown>node) as ChildrenNodeMapByContextMap[N][K];
				} else {
					this.states.error.set(`expected node type to be ${type}, but was instead ${node.type()}`);
				}
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
		return this.options.nodeSelectionContext();
	}
	private _is_node_expected_context(node: BaseNodeType) {
		const expected_context = this._expected_context();
		if (expected_context == null) {
			return true;
		}
		const node_context = node.parent()?.childrenController?.context;
		return expected_context == node_context;
	}
	private _expected_node_types() {
		return this.options.nodeSelectionTypes();
	}
	private _expected_param_type() {
		return this.options.paramSelectionType();
	}
	private _is_node_expected_type(node: BaseNodeType) {
		const expected_types = this._expected_node_types();
		if (expected_types == null) {
			return true;
		}
		return expected_types?.includes(node.type());
	}
	private _is_param_expected_type(param: BaseParamType) {
		const expected_types = this._expected_node_types();
		if (expected_types == null) {
			return true;
		}
		return expected_types.includes(param.type());
	}

	notifyPathRebuildRequired(node: BaseNodeType) {
		this.decomposed_path.update_from_name_change(node);
		const new_path = this.decomposed_path.to_path();
		this.set(new_path);
	}
	notifyTargetParamOwnerParamsUpdated(node: BaseNodeType) {
		this.setDirty();
	}
}
