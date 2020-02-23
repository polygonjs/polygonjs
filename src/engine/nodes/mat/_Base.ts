import {TypedNode} from '../_Base';

import {Material} from 'three/src/materials/Material';

// import DisplayFlag from '../Concerns/DisplayFlag';

import {MaterialContainer} from 'src/engine/containers/Material';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// type RenderHook = (object: Object3D) => void;

export abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<
	'MATERIAL',
	BaseMatNodeType,
	K
> {
	container_controller: TypedContainerController<MaterialContainer> = new TypedContainerController<MaterialContainer>(
		this,
		MaterialContainer
	);
	static node_context(): NodeContext {
		return NodeContext.MAT;
	}

	protected _material: M | undefined;
	// protected _update_methods: RenderHook[] = [];

	initialize_base_node() {
		super.initialize_base_node();
		// this._update_methods = [];

		// this._init_bypass_flag({
		// 	has_bypass_flag: false,
		// });
		// this._init_display_flag({
		// 	has_display_flag: false,
		// });

		// this.set_inputs_count_to_zero();
		// this._init_outputs({has_outputs: false});

		// this.container_controller.init(MaterialContainer);

		this.name_controller.add_post_set_full_path_hook(this.set_material_name.bind(this));

		this.add_post_dirty_hook(
			'_cook_main_without_inputs_when_dirty',
			this._cook_main_without_inputs_when_dirty_bound
		);

		// it's probably good not to have to create any material in the constructor
		// but only on request
		// this._material = this.create_material();
		// this.set_material(this._material);
	}
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cook_controller.cook_main_without_inputs();
	}

	private set_material_name() {
		// ensures the material has a full path set
		// allowing the render hook to be set
		//this.set_material(@_material)
		if (this._material) {
			this._material.name = this.full_path();
		}
	}

	abstract create_material(): M;
	get material() {
		return (this._material = this._material || this.create_material());
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

export type BaseMatNodeType = TypedMatNode<Material, any>;
export class BaseMatNodeClass extends TypedMatNode<Material, any> {
	create_material() {
		return new Material();
	}
}
