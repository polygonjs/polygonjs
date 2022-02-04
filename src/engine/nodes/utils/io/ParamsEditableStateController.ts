import {NodeContext} from '../../../poly/NodeContext';
import {ParamEvent} from '../../../poly/ParamEvent';
import {TypedNode} from '../../_Base';

export class ParamsEditableStateController<NC extends NodeContext> {
	constructor(private node: TypedNode<NC, any>) {}

	private _initialized = false;
	initializeNode() {
		if (this._initialized) {
			console.warn('already initialized', this.node);
			return;
		}
		this._initialized = true;
		this.node.io.inputs.add_on_set_input_hook(
			'_checkParamsEditableStateBound',
			this._checkParamsEditableStateBound
		);
	}
	initialized() {
		return this._initialized;
	}

	private _checkParamsEditableStateBound = this._checkParamsEditableState.bind(this);
	private _checkParamsEditableState() {
		if (!this._paramsMatchEditableState()) {
			this.updateParamsEditableStateIfNeeded();
		}
	}

	private _paramsMatchEditableState(): boolean {
		let i = 0;
		const params = this.node.params;
		for (let connectionPoint of this.node.io.inputs.namedInputConnectionPoints()) {
			if (connectionPoint) {
				const isConnected = this.node.io.inputs.input(i) != null;
				const paramName = connectionPoint?.name();
				const hasParam = params.has(paramName);
				if (hasParam) {
					const param = params.get(paramName);
					if (param) {
						const expectedEditableState = !isConnected;
						const currentEditableState = param.options.editable();
						if (expectedEditableState != currentEditableState) {
							return false;
						}
					}
				}
			}
			i++;
		}
		return true;
	}

	updateParamsEditableStateIfNeeded() {
		let i = 0;
		const params = this.node.params;
		for (let connectionPoint of this.node.io.inputs.namedInputConnectionPoints()) {
			if (connectionPoint) {
				const isConnected = this.node.io.inputs.input(i) != null;
				const paramName = connectionPoint?.name();
				if (params.has(paramName)) {
					const param = params.get(paramName);
					if (param) {
						const currentEditableState = param.options.editable();
						const requiredState = !isConnected;
						if (currentEditableState != requiredState) {
							param.options.setOption('editable', requiredState);
							param.emit(ParamEvent.EDITABLE_UPDATED);
						}
					}
				}
			}
			i++;
		}
	}
}
