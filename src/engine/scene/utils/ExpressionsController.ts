import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export class ExpressionsController {
	private _params_by_id: Map<CoreGraphNodeId, BaseParamType> = new Map();
	constructor() {}

	registerParam(param: BaseParamType) {
		this._params_by_id.set(param.graphNodeId(), param);
	}
	deregisterParam(param: BaseParamType) {
		this._params_by_id.delete(param.graphNodeId());
	}

	//
	//
	//
	//
	regenerateReferringExpressions(node: BaseNodeType) {
		node.nameController.graphNode().setSuccessorsDirty(node);
	}
}
