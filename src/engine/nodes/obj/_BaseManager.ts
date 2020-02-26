import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class BaseManagerObjParamsConfig extends NodeParamsConfig {}
export class BaseManagerObjNode extends TypedObjNode<Group, BaseManagerObjParamsConfig> {
	// public readonly add_to_hierarchy: boolean = false;
	protected _attachable_to_hierarchy: boolean = false;
	// _init_manager(options = {}) {
	// 	// this._init_hierarchy_children_owner(options['children'] || {});
	// 	// this.flags.add_display({
	// 	// 	has_display_flag: false,
	// 	// 	multiple_display_flags_allowed: true,
	// 	// });
	// 	// this.set_inputs_count_to_zero();
	// 	// this._init_outputs({has_outputs: false});
	// }

	create_object() {
		return new Group();
	}

	cook() {
		this.cook_controller.end_cook();
	}
}
