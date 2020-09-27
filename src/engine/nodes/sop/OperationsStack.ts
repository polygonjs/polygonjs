import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopOperationContainer} from '../../../core/operation/sop/_Base';
import {OPERATIONS_STACK_NODE_TYPE} from '../../../core/operation/_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class OperationsStackSopParamConfig extends NodeParamsConfig {}
const ParamsConfig = new OperationsStackSopParamConfig();

export class OperationsStackSopNode extends TypedSopNode<OperationsStackSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return OPERATIONS_STACK_NODE_TYPE;
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	private _operation_containers: SopOperationContainer[] = [];

	add_operation(operation_container: SopOperationContainer) {
		this._operation_containers.push(operation_container);
	}

	async cook(input_contents: CoreGroup[]) {
		let core_groups = input_contents;
		for (let operation_container of this._operation_containers) {
			const result = operation_container.cook(core_groups);
			if (result) {
				if (result instanceof Promise) {
					core_groups = await core_groups;
				} else {
					core_groups = [result];
				}
			}
		}
		this.set_core_group(core_groups[0]);
	}
}
