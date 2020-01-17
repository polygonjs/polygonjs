import {Object3D} from 'three/src/core/Object3D';
import lodash_flatten from 'lodash/flatten';
import {TypedSopNode} from './_Base';

// import {CoreLoaderGeometry, LoaderType, LOADER_TYPES} from 'src/Core/Loader/Geometry';
import {JsonDataLoader} from 'src/core/loader/geometry/JsonData';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {BaseParamType} from 'src/engine/params/_Base';
class DataUrlSopParamsConfig extends NodeParamsConfig {
	url = ParamConfig.STRING('/examples/sop/data_url/basic.json');
	json_data_keys_prefix = ParamConfig.STRING('');
	skip_entries = ParamConfig.STRING('');
	convert = ParamConfig.BOOLEAN(0);
	convert_to_numeric = ParamConfig.STRING('', {
		visible_if: {convert: 1},
	});
	reload = ParamConfig.BUTTON(null, {
		callback: DataUrlSopNode.PARAM_CALLBACK_reload,
	});
}
const ParamsConfig = new DataUrlSopParamsConfig();

export class DataUrlSopNode extends TypedSopNode<DataUrlSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'data_url';
	}

	// TODO: no error when trying to load a non existing zip file??
	async cook() {
		const loader = new JsonDataLoader({
			data_keys_prefix: this.pv.json_data_keys_prefix,
			skip_entries: this.pv.skip_entries,
			do_convert: this.pv.convert,
			convert_to_numeric: this.pv.convert_to_numeric,
		});

		loader.load(this.pv.url, this._on_load.bind(this), undefined, this._on_error.bind(this));
	}

	_on_load(objects: Object3D[]) {
		objects = lodash_flatten(objects);
		this.set_objects(objects);
	}
	_on_error(message: string) {
		this.states.error.set(`could not load geometry from ${this.pv.url} (${message})`);
	}

	// async _on_open_url(){
	// 	const url = await this.param('url').eval_p()
	// 	const a = document.createElement('a')
	// 	a.href = url
	// 	a.setAttribute('target', '_blank')
	// 	a.click()
	// }

	static PARAM_CALLBACK_reload(node: DataUrlSopNode, param: BaseParamType) {
		node.param_callback_reload();
	}
	param_callback_reload() {
		// this._previous_param_url = null

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.set_dirty();
		// this.set_dirty()
	}
}
