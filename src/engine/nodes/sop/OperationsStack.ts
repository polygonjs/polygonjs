import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopOperationContainer, OperationInputsMap} from '../../../core/operation/sop/_Base';
import {OPERATIONS_STACK_NODE_TYPE, BaseOperationContainer} from '../../../core/operation/_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class OperationsStackSopParamConfig extends NodeParamsConfig {}
const ParamsConfig = new OperationsStackSopParamConfig();

export interface OperationContainerInputConfig {
	operation_input_index: number;
	node_input_index: number;
}

export class OperationsStackSopNode extends TypedSopNode<OperationsStackSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return OPERATIONS_STACK_NODE_TYPE;
	}

	initialize_node() {
		// the number of inputs will be set from the JsonImporter, when the node is created
		// since this is when we can know the number of inputs
		// and creating a large number of max inputs in advance
		// will result is creating many CoreGraphNodes
		// this.io.inputs.set_count(0, 2);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	private _output_operation_container: SopOperationContainer | undefined;
	private _input_configs_by_operation_container: OperationInputsMap = new WeakMap();

	set_output_operation_container(operation_container: SopOperationContainer) {
		this._output_operation_container = operation_container;
	}
	output_operation_container() {
		return this._output_operation_container;
	}
	add_input_config(operation: SopOperationContainer, input_config: OperationContainerInputConfig) {
		let existing_map = this._input_configs_by_operation_container.get(operation);
		if (!existing_map) {
			existing_map = new Map();
			this._input_configs_by_operation_container.set(operation, existing_map);
		}
		existing_map.set(input_config.operation_input_index, input_config.node_input_index);
	}

	private _operation_containers_requiring_resolve: BaseOperationContainer[] | undefined;
	add_operation_container_with_path_param_resolve_required(operation_container: BaseOperationContainer) {
		if (!this._operation_containers_requiring_resolve) {
			this._operation_containers_requiring_resolve = [];
		}
		this._operation_containers_requiring_resolve.push(operation_container);
	}
	resolve_operation_containers_path_params() {
		if (!this._operation_containers_requiring_resolve) {
			return;
		}
		for (let operation_container of this._operation_containers_requiring_resolve) {
			operation_container.resolve_path_params(this);
		}
	}

	async cook(input_contents: CoreGroup[]) {
		console.log('cook', this.full_path());
		if (this._output_operation_container) {
			const core_group = await this._output_operation_container.compute(
				input_contents,
				this._input_configs_by_operation_container
			);
			if (core_group) {
				this.set_core_group(core_group);
			}
		}
	}
}
