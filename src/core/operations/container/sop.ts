import {BaseOperationContainer} from './_Base';
import {BaseSopOperation} from '../sop/_Base';
import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {CoreGroup} from '../../geometry/Group';

export type OperationInputsMap = WeakMap<SopOperationContainer, Map<number, number>>;

export class SopOperationContainer extends BaseOperationContainer {
	constructor(protected operation: BaseSopOperation, protected name: string, protected init_params: ParamsInitData) {
		super(operation, name, init_params);
	}

	// TODO: there may a better to overload add_input
	protected _inputs: SopOperationContainer[] = [];
	private _current_input_index: number = 0;
	add_input(input: SopOperationContainer) {
		super.setInput(this._current_input_index, input);
		this.increment_input_index();
	}
	increment_input_index() {
		this._current_input_index++;
	}
	current_input_index() {
		return this._current_input_index;
	}

	private _compute_result: CoreGroup | undefined;
	private _dirty: boolean = true;
	set_dirty() {
		if (this._dirty) {
			return;
		}
		this._compute_result = undefined;
		for (let i = 0; i < this._inputs.length; i++) {
			const input_operation = this._inputs[i];
			input_operation.set_dirty();
		}
	}

	async compute(input_contents: CoreGroup[], operation_inputs_map: OperationInputsMap) {
		if (this._compute_result) {
			return this._compute_result;
		}

		const operation_input_contents: CoreGroup[] = [];

		// process node inputs
		const node_inputs_map = operation_inputs_map.get(this);
		if (node_inputs_map) {
			node_inputs_map.forEach((node_input_index: number, operation_input_index: number) => {
				operation_input_contents[operation_input_index] = input_contents[node_input_index];
			});
		}

		// process operation inputs
		for (let i = 0; i < this._inputs.length; i++) {
			const input_operation = this._inputs[i];
			let result = await input_operation.compute(input_contents, operation_inputs_map);
			if (result) {
				if (this.input_clone_required(i)) {
					result = result.clone();
				}
				operation_input_contents[i] = result;
			}
		}

		// cook and store result
		const result = this.operation.cook(operation_input_contents, this.params);
		if (result) {
			if (result instanceof Promise) {
				this._compute_result = await result;
			} else {
				this._compute_result = result;
			}
		} else {
			this._compute_result = undefined;
		}
		this._dirty = false;
		return this._compute_result;
	}
}
