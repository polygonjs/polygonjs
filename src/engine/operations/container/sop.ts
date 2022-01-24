import {BaseOperationContainer} from './_Base';
import {BaseSopOperation} from '../sop/_Base';
import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeContext} from '../../poly/NodeContext';

export type OperationInputsMap = WeakMap<SopOperationContainer, Map<number, number>>;

export class SopOperationContainer extends BaseOperationContainer<NodeContext.SOP> {
	constructor(
		protected override operation: BaseSopOperation,
		protected override name: string,
		protected init_params: ParamsInitData
	) {
		super(operation, name, init_params);
	}

	operationType() {
		return this.operation.type();
	}

	// TODO: there may a better to overload add_input
	protected override _inputs: SopOperationContainer[] = [];
	private _currentInputIndex: number = 0;
	addInput(input: SopOperationContainer) {
		super.setInput(this._currentInputIndex, input);
		this.incrementInputIndex();
	}
	incrementInputIndex() {
		this._currentInputIndex++;
	}
	currentInputIndex() {
		return this._currentInputIndex;
	}

	private _computeResult: CoreGroup | undefined;
	private _dirty: boolean = true;
	setDirty() {
		if (this._dirty) {
			return;
		}
		this._computeResult = undefined;
		for (let i = 0; i < this._inputs.length; i++) {
			const inputOperation = this._inputs[i];
			inputOperation.setDirty();
		}
	}

	async compute(input_contents: CoreGroup[], operation_inputs_map: OperationInputsMap) {
		if (this._computeResult) {
			return this._computeResult;
		}

		const operationInputContents: CoreGroup[] = [];

		// process node inputs
		const node_inputs_map = operation_inputs_map.get(this);
		if (node_inputs_map) {
			node_inputs_map.forEach((node_input_index: number, operation_input_index: number) => {
				operationInputContents[operation_input_index] = input_contents[node_input_index];
			});
		}

		// process operation inputs
		for (let i = 0; i < this._inputs.length; i++) {
			const inputOperation = this._inputs[i];
			let result = await inputOperation.compute(input_contents, operation_inputs_map);
			if (result) {
				if (this.inputCloneRequired(i)) {
					result = result.clone();
				}
				operationInputContents[i] = result;
			}
		}

		// cook and store result
		const result = this.operation.cook(operationInputContents, this.params);
		if (result) {
			if (result instanceof Promise) {
				this._computeResult = await result;
			} else {
				this._computeResult = result;
			}
		} else {
			this._computeResult = undefined;
		}
		this._dirty = false;
		return this._computeResult;
	}
}
