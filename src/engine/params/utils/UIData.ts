// import CoreUIData from 'src/core/UIData'
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {BaseParamType} from '../_Base';
import {PolyScene} from '../../scene/PolyScene';

export class UIData extends CoreGraphNode {
	// private _folder_name: string | undefined;
	private _update_visibility_and_remove_dirty_bound = this.update_visibility_and_remove_dirty.bind(this);
	constructor(scene: PolyScene, private param: BaseParamType) {
		super(scene, 'param ui data');
		// this.set_scene(this.param.scene);

		this.addPostDirtyHook('_update_visibility_and_remove_dirty', this._update_visibility_and_remove_dirty_bound);
	}

	update_visibility_and_remove_dirty() {
		this.update_visibility();
		this.removeDirtyState();
	}

	update_visibility() {
		this.param.options.update_visibility();
	}

	// set_folder_name(folder_name: string | undefined) {
	// 	this._folder_name = folder_name;
	// }
	// get folder_name() {
	// 	return this._folder_name;
	// }
}
