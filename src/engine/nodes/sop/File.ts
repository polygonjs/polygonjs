import lodash_flatten from 'lodash/flatten';
import {TypedSopNode} from './_Base';
import {Object3D} from 'three/src/core/Object3D';
import {CoreLoaderGeometry} from '../../../core/loader/Geometry';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {DesktopFileType} from '../../params/utils/OptionsController';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
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
	required_modules() {
		const ext = CoreLoaderGeometry.get_extension(this.pv.url || '');
		return CoreLoaderGeometry.module_names(ext);
	}

	initialize_node() {
		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.url], () => {
					const url = this.pv.url;
					if (url) {
						const elements = url.split('/');
						return elements[elements.length - 1];
					} else {
						return '';
					}
				});
			});
		});
	}

	// TODO: no error when trying to load a non existing zip file??
	cook() {
		const loader = new CoreLoaderGeometry(this.pv.url, this.scene.assets_controller.assets_root());
		loader.load(this._on_load.bind(this), this._on_error.bind(this));
	}

	private _on_load(objects: Object3D[]) {
		objects = lodash_flatten(objects);

		for (let object of objects) {
			object.traverse((child) => {
				this._ensure_geometry_has_index(child);
				child.matrixAutoUpdate = false;
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

	static PARAM_CALLBACK_reload(node: FileSopNode) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.set_dirty();
		// this.set_dirty()
	}
}
