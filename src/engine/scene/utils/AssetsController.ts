import {StringParam} from '../../params/String';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export class SceneAssetsController {
	private _params_by_id: Map<CoreGraphNodeId, StringParam> = new Map();
	private _assets_root: string | null = null;

	//
	//
	// REGISTER PARAMS
	//
	//
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

	//
	//
	// ASSETS ROOT
	//
	//
	assets_root() {
		return this._assets_root;
	}
	set_assets_root(url: string | null) {
		if (url == '') {
			url = null;
		}
		this._assets_root = url;
	}
}
