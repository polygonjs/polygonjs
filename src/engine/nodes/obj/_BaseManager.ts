import {BaseObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
const THREE = {Group};

export class BaseManager extends BaseObjNode {
	constructor() {
		super();
	}

	_init_manager(options = {}) {
		// this._init_hierarchy_children_owner(options['children'] || {});

		this.flags.add_display({
			has_display_flag: false,
			multiple_display_flags_allowed: true,
		});

		this.set_inputs_count_to_zero();
		this._init_outputs({has_outputs: false});
	}

	create_object() {
		return new THREE.Group();
	}

	cook() {
		this.cook_controller.end_cook();
	}
}
