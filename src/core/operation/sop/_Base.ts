import {CoreGroup} from '../../geometry/Group';
import {BaseOperation, BaseOperationContainer} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';

export class BaseSopOperation extends BaseOperation {
	static context() {
		return NodeContext.SOP;
	}
	cook(input_contents: CoreGroup[], params: any): CoreGroup | Promise<CoreGroup> | void {}
}

export class SopOperationContainer extends BaseOperationContainer {
	constructor(protected operation: BaseSopOperation, protected init_params: ParamsInitData) {
		super(operation, init_params);
	}

	cook(input_contents: CoreGroup[]) {
		return this.operation.cook(input_contents, this.params);
	}
}
