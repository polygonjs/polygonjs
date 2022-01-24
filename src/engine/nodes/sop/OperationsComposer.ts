import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopOperationContainer, OperationInputsMap} from '../../operations/container/sop';
import {OPERATIONS_COMPOSER_NODE_TYPE} from '../../operations/_Base';
import {BaseOperationContainer} from '../../operations/container/_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
class OperationsComposerSopParamConfig extends NodeParamsConfig {}
const ParamsConfig = new OperationsComposerSopParamConfig();

export interface OperationContainerInputConfig {
	operation_input_index: number;
	node_input_index: number;
}

export class OperationsComposerSopNode extends TypedSopNode<OperationsComposerSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return OPERATIONS_COMPOSER_NODE_TYPE;
	}

	override initializeNode() {
		// the number of inputs will be set from the JsonImporter, when the node is created
		// since this is when we can know the number of inputs
		// and creating a large number of max inputs in advance
		// will result is creating many CoreGraphNodes
		// this.io.inputs.setCount(0, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _outputOperationContainer: SopOperationContainer | undefined;
	private _inputConfigsByOperationContainer: OperationInputsMap = new WeakMap();

	setOutputOperationContainer(operationContainer: SopOperationContainer) {
		this._outputOperationContainer = operationContainer;
	}
	outputOperationContainer() {
		return this._outputOperationContainer;
	}
	addInputConfig(operation: SopOperationContainer, inputConfig: OperationContainerInputConfig) {
		let existing_map = this._inputConfigsByOperationContainer.get(operation);
		if (!existing_map) {
			existing_map = new Map();
			this._inputConfigsByOperationContainer.set(operation, existing_map);
		}
		existing_map.set(inputConfig.operation_input_index, inputConfig.node_input_index);
	}

	private _operationContainersRequiringResolve: BaseOperationContainer<NodeContext.SOP>[] | undefined;
	addOperationContainerWithPathParamResolveRequired(operationContainer: BaseOperationContainer<NodeContext.SOP>) {
		if (!this._operationContainersRequiringResolve) {
			this._operationContainersRequiringResolve = [];
		}
		this._operationContainersRequiringResolve.push(operationContainer);
	}
	resolveOperationContainersPathParams() {
		if (!this._operationContainersRequiringResolve) {
			return;
		}
		for (let operationContainer of this._operationContainersRequiringResolve) {
			operationContainer.resolvePathParams(this);
		}
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		if (this._outputOperationContainer) {
			this._outputOperationContainer.setDirty();

			const coreGroup = await this._outputOperationContainer.compute(
				inputCoreGroups,
				this._inputConfigsByOperationContainer
			);
			if (coreGroup) {
				this.setCoreGroup(coreGroup);
			}
		}
	}
}
