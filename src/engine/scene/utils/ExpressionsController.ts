import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../../nodes/_Base';

export class ExpressionsController {
	private _params_by_id: Map<string, BaseParamType> = new Map();
	constructor() {}

	register_param(param: BaseParamType) {
		this._params_by_id.set(param.graph_node_id, param);
	}
	deregister_param(param: BaseParamType) {
		this._params_by_id.delete(param.graph_node_id);
	}

	//
	//
	//
	//
	regenerate_referring_expressions(node: BaseNodeType) {
		node.name_controller.graph_node.set_successors_dirty(node);
	}
}
