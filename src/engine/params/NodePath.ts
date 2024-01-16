import {isString} from './../../core/Type';
import {TypedPathParam} from './_BasePath';
import {CoreWalker} from '../../core/Walker';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {TypedNodePathParamValue} from '../../core/Walker';

interface SetNodeOptions {
	relative: boolean;
}

const tmpConvertedValue = new TypedNodePathParamValue();
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

	protected _assignValue(value: ParamValuesTypeMap[ParamType.NODE_PATH] | string): void {
		const path = isString(value) ? value : value.path();
		if (this._value.path() != path) {
			this._setValuePathAndFindTarget(path, false);
		}
	}
	override convert(rawVal: any): ParamValuesTypeMap[ParamType.NODE_PATH] | null {
		if (isString(rawVal)) {
			tmpConvertedValue.setPath(rawVal);
			return tmpConvertedValue;
		} else {
			return null;
		}
	}
	// protected override async processComputation() {
	// 	this._findTarget();
	// }
	protected _findTarget() {
		if (!this.node) {
			return;
		}
		const path = this._value.path();
		let node: BaseNodeType | null = null;
		const pathNonEmpty = path != null && path !== '';

		this.scene().referencesController.resetReferenceFromParam(this); // must be before decomposed path is changed
		this.decomposedPath.reset();
		if (pathNonEmpty) {
			node = CoreWalker.findNode(this.node, path, this.decomposedPath);
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
			const dependentOnFoundNode = this.options.dependentOnFoundNode();

			const previouslyFoundNode = this._value.node();
			if (previouslyFoundNode) {
				if (dependentOnFoundNode) {
					this.removeGraphInput(previouslyFoundNode);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}
			if (node) {
				this._assignFoundNode(node);
			} else {
				this._value.setNode(null);
			}

			this.options.executeCallback();
		}
		if (pathNonEmpty && !node && this.scene().loadingController.loaded()) {
			if (pathNonEmpty) {
				this.states.error.set(`no node found at path '${path}'`);
			}
		}

		this.removeDirtyState();
	}

	private _assignFoundNode(node: BaseNodeType) {
		const dependentOnFoundNode = this.options.dependentOnFoundNode();
		if (this._isNodeExpectedContext(node)) {
			if (this._isNodeExpectedType(node)) {
				this.states.error.clear();
				this._value.setNode(node);
				if (dependentOnFoundNode) {
					this.addGraphInput(node);
				}
			} else {
				this.states.error.set(
					`node type is ${node.type()} but the params expects one of ${(this._expectedNodeTypes() || []).join(
						', '
					)}`
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
		const expectedContext = this._expectedContext();
		if (expectedContext == null) {
			return true;
		}
		return expectedContext == node.context();
	}
	private _expectedNodeTypes() {
		return this.options.nodeSelectionTypes();
	}

	private _isNodeExpectedType(node: BaseNodeType) {
		const expected_types = this._expectedNodeTypes();
		if (expected_types == null) {
			return true;
		}
		return expected_types?.includes(node.type());
	}

	notifyPathRebuildRequired(node: BaseNodeType) {
		this.decomposedPath.updateFromNameChange(node);
		const newPath = this.decomposedPath.toPath();
		this.set(newPath);
	}
	notifyTargetParamOwnerParamsUpdated(node: BaseNodeType) {
		this.setDirty();
	}
}
