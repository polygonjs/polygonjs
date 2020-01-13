import {BaseObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';

export class BaseManagerObjNode extends BaseObjNode {
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
