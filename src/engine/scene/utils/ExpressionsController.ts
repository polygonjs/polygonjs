import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export class ExpressionsController {
	private _params_by_id: Map<CoreGraphNodeId, BaseParamType> = new Map();
	constructor() {}

	register_param(param: BaseParamType) {
		this._params_by_id.set(param.graphNodeId(), param);
	}
	deregister_param(param: BaseParamType) {
		this._params_by_id.delete(param.graphNodeId());
	}

	//
	//
	//
	//
	regenerate_referring_expressions(node: BaseNodeType) {
		node.name_controller.graph_node.setSuccessorsDirty(node);
	}
}
