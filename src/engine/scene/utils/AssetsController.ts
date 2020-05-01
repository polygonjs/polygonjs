import {StringParam} from '../../params/String';

export class SceneAssetsController {
	private _params_by_id: Map<string, StringParam> = new Map();

	register_param(param: StringParam) {
		this._params_by_id.set(param.graph_node_id, param);
	}

	deregister_param(param: StringParam) {
		this._params_by_id.delete(param.graph_node_id);
	}

	traverse_params(callback: (param: StringParam) => void) {
		this._params_by_id.forEach((param, id) => {
			callback(param);
		});
	}
}
