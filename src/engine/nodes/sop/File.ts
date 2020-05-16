import lodash_flatten from 'lodash/flatten';
// import lodash_clone from 'lodash/clone';
// import lodash_merge from 'lodash/merge';
import {TypedSopNode} from './_Base';
import {Object3D} from 'three/src/core/Object3D';

import {CoreLoaderGeometry} from '../../../core/loader/Geometry';

import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DesktopFileType} from '../../params/utils/OptionsController';
import {Mesh, BufferGeometry} from 'three';
class FileSopParamsConfig extends NodeParamsConfig {
	url = ParamConfig.STRING('/examples/models/wolf.obj', {
		desktop_browse: {file_type: DesktopFileType.GEOMETRY},
		asset_reference: true,
	});
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			FileSopNode.PARAM_CALLBACK_reload(node as FileSopNode);
		},
	});
}
const ParamsConfig = new FileSopParamsConfig();

export class FileSopNode extends TypedSopNode<FileSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'file';
	}

	// TODO: no error when trying to load a non existing zip file??
	cook() {
		const loader = new CoreLoaderGeometry(this.pv.url);
		loader.load(this._on_load.bind(this), this._on_error.bind(this));
	}

	private _on_load(objects: Object3D[]) {
		objects = lodash_flatten(objects);

		for (let object of objects) {
			object.traverse((child) => {
				this._ensure_geometry_has_index(child);
			});
		}
		this.set_objects(objects);
	}
	private _on_error(message: string) {
		this.states.error.set(`could not load geometry from ${this.pv.url} (${message})`);
	}

	private _ensure_geometry_has_index(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			this._create_index_if_none(geometry as BufferGeometry);
		}
	}

	// if I add this again, check if it can also work for desktop
	// async _on_open_url() {
	// 	const url = this.pv.url
	// 	const a = document.createElement('a');
	// 	a.href = url;
	// 	a.setAttribute('target', '_blank');
	// 	a.click();
	// }

	static PARAM_CALLBACK_reload(node: FileSopNode) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// this._previous_param_url = null

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.set_dirty();
		// this.set_dirty()
	}
	// json_data_keys_prefix(){ return this.pv.json_data_keys_prefix }
	// json_skip_entries(){ return this.pv.skip_entries }
	// json_convert(){ return this.pv.convert }
	// json_convert_to_numeric(){ return this.pv.convert_to_numeric }
}
