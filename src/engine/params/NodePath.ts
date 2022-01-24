import {TypedPathParam} from './_BasePath';
import {CoreWalker} from '../../core/Walker';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {TypedNodePathParamValue} from '../../core/Walker';

interface SetNodeOptions {
	relative: boolean;
}

export class NodePathParam extends TypedPathParam<ParamType.NODE_PATH> {
	static override type() {
		return ParamType.NODE_PATH;
	}
	protected override _initializeParam() {
		this._value = new TypedNodePathParamValue();
	}

	override defaultValueSerialized() {
		return this._default_value;
	}
	override rawInputSerialized() {
		return `${this._raw_input}`;
	}
	override valueSerialized() {
		return `${this.value}`;
	}
	protected override _copyValue(param: NodePathParam) {
		this.set(param.valueSerialized());
	}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.NODE_PATH],
		raw_input2: ParamInitValuesTypeMap[ParamType.NODE_PATH]
	) {
		return raw_input1 == raw_input2;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.NODE_PATH],
		val2: ParamValuesTypeMap[ParamType.NODE_PATH]
	) {
		return val1 == val2;
	}
	override isDefault(): boolean {
		return this._raw_input == this._default_value;
	}
	setNode(node: BaseNodeType, options?: SetNodeOptions) {
		if (options?.relative == true) {
			const path = CoreWalker.relativePath(this.node, node);
			this.set(path);
		} else {
			this.set(node.path());
		}
	}
	protected override processRawInput() {
		if (this._value.path() != this._raw_input) {
			this._value.set_path(this._raw_input);
			this._findTarget();
			this.setDirty();
			this.emitController.emit(ParamEvent.VALUE_UPDATED);
		}
	}
	protected override async processComputation() {
		this._findTarget();
	}
	private _findTarget() {
		if (!this.node) {
			return;
		}
		const path = this._raw_input;
		let node: BaseNodeType | null = null;
		const path_non_empty = path != null && path !== '';

		this.scene().referencesController.resetReferenceFromParam(this); // must be before decomposed path is changed
		this.decomposed_path.reset();
		if (path_non_empty) {
			node = CoreWalker.findNode(this.node, path, this.decomposed_path);
		}

		const currentFoundEntity = this._value.node();
		const newlyFoundEntity = node;

		// if the param refers to its own node, we set an error
		if (newlyFoundEntity) {
			if (newlyFoundEntity.graphNodeId() == this.node.graphNodeId()) {
				this.states.error.set(`param cannot refer to its own node`);
				return;
			}
		}

		this._handleReferences(node, path);

		if (currentFoundEntity?.graphNodeId() !== newlyFoundEntity?.graphNodeId()) {
			const dependent_on_found_node = this.options.dependentOnFoundNode();

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

			this.options.executeCallback();
		}
		if (path_non_empty && !node && this.scene().loadingController.loaded()) {
			if (path_non_empty) {
				this.states.error.set(`no node found at path '${path}'`);
			}
		}

		this.removeDirtyState();
	}

	private _assign_found_node(node: BaseNodeType) {
		const dependent_on_found_node = this.options.dependentOnFoundNode();
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
				`node context is ${node.context()} but the params expects a ${this._expectedContext()}`
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

	notifyPathRebuildRequired(node: BaseNodeType) {
		this.decomposed_path.update_from_name_change(node);
		const newPath = this.decomposed_path.to_path();
		this.set(newPath);
	}
	notifyTargetParamOwnerParamsUpdated(node: BaseNodeType) {
		this.setDirty();
	}
}
