import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export class SceneExpressionsController {
	private _paramsById: Map<CoreGraphNodeId, BaseParamType> = new Map();
	constructor() {}

	registerParam(param: BaseParamType) {
		this._paramsById.set(param.graphNodeId(), param);
	}
	deregisterParam(param: BaseParamType) {
		this._paramsById.delete(param.graphNodeId());
	}

	//
	//
	//
	//
	regenerateReferringExpressions(node: BaseNodeType) {
		node.nameController.graphNode().setSuccessorsDirty(node);
	}
}
