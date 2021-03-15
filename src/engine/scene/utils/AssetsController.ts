import {StringParam} from '../../params/String';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export class SceneAssetsController {
	//
	//
	// REGISTER PARAMS
	//
	//
	private _params_by_id: Map<CoreGraphNodeId, StringParam> = new Map();
	register_param(param: StringParam) {
		this._params_by_id.set(param.graphNodeId(), param);
	}

	deregister_param(param: StringParam) {
		this._params_by_id.delete(param.graphNodeId());
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
	private _assets_root: string | null = null;
	root() {
		return this._assets_root;
	}
	setRoot(url: string | null) {
		if (url == '') {
			url = null;
		}
		this._assets_root = url;
	}
}
