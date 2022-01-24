import {BaseOperation} from '../_Base';
import {BaseOperationContainer} from './_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {Texture} from 'three/src/textures/Texture';

export class BaseCopOperation extends BaseOperation<NodeContext.COP> {
	static override context() {
		return NodeContext.COP;
	}
	override cook(input_contents: Texture[], params: any): Texture | Promise<Texture> | void {}
}

export type OperationInputsMap = WeakMap<CopOperationContainer, Map<number, number>>;

export class CopOperationContainer extends BaseOperationContainer<NodeContext.COP> {
	constructor(
		protected override operation: BaseCopOperation,
		protected override name: string,
		protected init_params: ParamsInitData
	) {
		super(operation, name, init_params);
	}

	// TODO: there may a better to overload add_input
	protected override _inputs: CopOperationContainer[] = [];
	private _currentInputIndex: number = 0;
	addInput(input: CopOperationContainer) {
		super.setInput(this._currentInputIndex, input);
		this.incrementInputIndex();
	}
	incrementInputIndex() {
		this._currentInputIndex++;
	}
	currentInputIndex() {
		return this._currentInputIndex;
	}

	async compute(input_contents: Texture[], operation_inputs_map: OperationInputsMap) {
		const operation_input_contents: Texture[] = [];

		const node_inputs_map = operation_inputs_map.get(this);
		if (node_inputs_map) {
			node_inputs_map.forEach((node_input_index: number, operation_input_index: number) => {
				operation_input_contents[operation_input_index] = input_contents[node_input_index];
			});
		}

		for (let i = 0; i < this._inputs.length; i++) {
			const input_operation = this._inputs[i];
			const result = await input_operation.compute(input_contents, operation_inputs_map);
			if (result) {
				operation_input_contents[i] = result;
			}
		}

		return this.operation.cook(operation_input_contents, this.params);
	}
}
