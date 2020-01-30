// import CoreUIData from 'src/core/UIData'
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {BaseParamType} from '../_Base';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class UIData extends CoreGraphNode {
	private _folder_name: string | undefined;

	constructor(scene: PolyScene, private param: BaseParamType) {
		super(scene, 'param ui data');
		// this.set_scene(this.param.scene);

		this.add_post_dirty_hook(this.update_visibility_and_remove_dirty.bind(this));
	}

	update_visibility_and_remove_dirty() {
		this.update_visibility();
		this.remove_dirty_state();
	}

	update_visibility() {
		this.param.options.update_visibility();
	}

	set_folder_name(folder_name: string | undefined) {
		this._folder_name = folder_name;
	}
	get folder_name() {
		return this._folder_name;
	}
}
