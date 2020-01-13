import {BaseNode} from '../_Base';

import {Material} from 'three/src/materials/Material';

// import DisplayFlag from '../Concerns/DisplayFlag';

import {MaterialContainer} from 'src/engine/containers/Material';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

// type RenderHook = (object: Object3D) => void;

export class BaseMatNode extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.MAT;
	}

	protected _material: Material;
	// protected _update_methods: RenderHook[] = [];

	constructor(scene: PolyScene) {
		super(scene, 'BaseMatNode');

		// this._update_methods = [];

		// this._init_bypass_flag({
		// 	has_bypass_flag: false,
		// });
		// this._init_display_flag({
		// 	has_display_flag: false,
		// });

		// this.set_inputs_count_to_zero();
		// this._init_outputs({has_outputs: false});

		this.container_controller.init(MaterialContainer);

		this.name_controller.add_post_set_full_path_hook(this.set_material_name.bind(this));

		// it's probably good not to have to create any material in the constructor
		// but only on request
		// this._material = this.create_material();
		// this.set_material(this._material);
	}

	private set_material_name() {
		// ensures the material has a full path set
		// allowing the render hook to be set
		//this.set_material(@_material)
		if (this._material) {
			this._material.name = this.full_path();
		}
	}

	create_material() {}
	get material() {
		return this._material;
	}
	//

	set_material(material: Material) {
		this.set_container(material);
	}

	// add_update_method(method, arg?: any) {
	// 	this._update_methods.push([method.bind(this), arg]);
	// }

	//run_update_methods: ->

	add_render_hook(object: Object3D) {}
}
//delete object.onBeforeRender
