import {TypedNode} from '../_Base';
import {Material} from 'three/src/materials/Material';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<
	NodeContext.MAT,
	K
> {
	static node_context(): NodeContext {
		return NodeContext.MAT;
	}

	protected _material: M | undefined;

	initialize_base_node() {
		super.initialize_base_node();

		this.name_controller.add_post_set_full_path_hook(this.set_material_name.bind(this));

		this.add_post_dirty_hook(
			'_cook_main_without_inputs_when_dirty',
			this._cook_main_without_inputs_when_dirty_bound
		);
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
