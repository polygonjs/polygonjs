import {BaseNodeObj} from './_Base';
import {Group} from 'three/src/objects/Group'
const THREE = {Group}

import {CoreTransform} from 'src/Core/Transform';

import {BaseNode} from '../../_Base'
import {Dirtyable} from './Concerns/Dirtyable';
//import Layers from './Concerns/Layers'
import {Transformed} from './Concerns/Transformed';
import {NodeContext} from 'src/Engine/Poly'



export class BaseNodeObjGeo extends Dirtyable(Transformed(BaseNodeObj)) {
	static type(){return 'geo'}
	children_context(){ return NodeContext.SOP }

	constructor() {
		super();

		this._init_hierarchy_children_owner();

		this._init_display_flag({
			multiple_display_flags_allowed: false,
			affects_hierarchy: true
		});
		this._init_dirtyable_hook()

		this.set_inputs_count_to_one_max();
	}

	create_object() {
		return new THREE.Group();
	}

	//base_layers_included: -> false

	create_params() {
		CoreTransform.create_params(this);
	}
		//this.create_layers_params()

	request_display_node() {
		if (!this.scene().auto_updating()) { return; }

		// TODO: remove callback
		this.is_displayed(is_displayed=> {
			if (is_displayed) {
				const display_node = this.display_node();
				if (display_node) {
					display_node.request_container_p().then( async (container)=> {
						if(!this._sop_loaded){
							this.root().notify_geo_loaded(this)
						}
						this._sop_loaded = true;

						const update_needed = await this.display_node_objects_changed(container)
						if(update_needed){
							this.remove_display_node_group()
							await this.add_display_node_group(container)
						}
						// this.set_needsUpdate(container)
					});
				} else {
					this.root().notify_geo_loaded(this)
					this._sop_loaded = true;
				}
			}
		});
	}

	is_display_node_cooking(): boolean {
		if(this.display_flag_state()){
			const display_node = this.display_node()
			return display_node ? display_node.is_dirty() : false;
		} else {
			return false
		}
	}

	post_display_flag_node_set_dirty() {
		this.request_display_node();
	}
	post_add_node(node: BaseNode){
		// we test if the scene is loaded
		// otherwise a display flag will be set for the first node
		// that is added when the scene is being loaded,
		// only to be changed again when the actual display node is set.
		// Without this, we have a jarring first object being displayed
		// only to be replaced by the proper one when it is ready.
		if(this.scene().loaded()){
			if(this.children().length == 1){
				node.set_display_flag()
			}
		}
	}
	on_create(){
		// this.create_node('text')
	}
	cook(input_containers){
		// TODO: why does it cook twice when changing a param like layers
		const matrix = CoreTransform.matrix_from_node_with_transform_params(this);
		//this._update_object_params(group, matrix)

		const group = this.group();
		group.visible = this.display_flag_state();
		this.update_transform(matrix);
		//this.update_layers()

		this.end_cook();
	}
}

