/**
 * Loads a geometry from a url.
 *
 * @remarks
 * Note that this node will automatically use a specific loader depending on the extension of the url.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreLoaderGeometry} from '../../../core/loader/Geometry';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {FileType} from '../../params/utils/OptionsController';
import {FileSopOperation} from '../../../core/operations/sop/File';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
const DEFAULT = FileSopOperation.DEFAULT_PARAMS;
class FileSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {type: [FileType.GEOMETRY]},
	});
	/** @param reload the geometry */
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
	async required_modules() {
		if (this.p.url.is_dirty) {
			await this.p.url.compute();
		}
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
	private _operation: FileSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new FileSopOperation(this.scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
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
