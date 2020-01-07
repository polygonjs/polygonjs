import {BaseNodeObj} from './_Base';
import {Group} from 'three/src/objects/Group'
const THREE = {Group}

import {Dirtyable} from './Concerns/Dirtyable';
import {Transformed} from './Concerns/Transformed';
import {CoreTransform} from 'src/Core/Transform'

// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);
// window.include_instance_methods(BaseModules, Transformed.instance_methods);

export class NullObj extends Dirtyable(Transformed(BaseNodeObj)) {

	constructor() {
		super();

		//this._init_manager()
		this._init_display_flag();
		this._init_dirtyable_hook()


		this.set_inputs_count_to_one_max();
	}
	static type(){return 'null'}

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
		this.end_cook();
	}
}


