import {BaseObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
const THREE = {Group};

import {Transformed} from './Concerns/Transformed';
import {CoreTransform} from 'src/core/Transform';

// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);
// window.include_instance_methods(BaseModules, Transformed.instance_methods);

export class NullObj extends Transformed(BaseObjNode) {
	constructor() {
		super();

		//this._init_manager()
		this.flags.add_display();
		this._init_dirtyable_hook();

		this.io.inputs.set_count_to_one_max();
	}
	static type() {
		return 'null';
	}

	//@_group = new THREE.Group()
	create_object() {
		return new THREE.Group();
	}

	create_params() {
		//this.create_common_params()
		CoreTransform.create_params(this);
	}

	cook() {
		this.update_transform();
		this.cook_controller.end_cook();
	}
}
