import {GeoObjNode} from '../obj/Geo';
import {BaseSopNodeType} from '../sop/_Base';
import {Object3D} from 'three/src/core/Object3D';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

export class DisplayNodeController {
	_graph_node: CoreGraphNode;
	_display_node: BaseSopNodeType | undefined;
	_children_uuids_dict: Dictionary<boolean> = {};
	_children_length: number = 0;
	private _request_display_node_container_bound = this.request_display_node_container.bind(this);
	constructor(protected node: GeoObjNode) {
		this._graph_node = new CoreGraphNode(node.scene, 'DisplayNodeController');

		this._graph_node.dirty_controller.add_post_dirty_hook(this._request_display_node_container_bound);
	}

	get display_node() {
		return this._display_node;
	}
	private _parent_object: Object3D | undefined;
	set_parent_object(object: Object3D) {
		this._parent_object = object;
	}
	get parent_object() {
		return this._parent_object || this.node.object;
	}

	initialize_node() {
		this.set_parent_object(this.node.sop_group);
		this.node.flags.display.add_hook(() => {
			this.node.sop_group.visible = this.used_in_scene;
			if (this.node.flags.display.active) {
				this.request_display_node_container();
			}
		});

		this.node.lifecycle.add_on_child_add_hook((child_node) => {
			if (!this._display_node) {
				child_node.flags?.display?.set(true);
			}
		});
	}

	async set_display_node(new_display_node: BaseSopNodeType) {
		if (this._display_node != new_display_node) {
			const old_display_node = this._display_node;
			if (old_display_node) {
				old_display_node.flags.display.set(false);
				this._graph_node.remove_graph_input(old_display_node);
				this.remove_children();
			}
			this._display_node = new_display_node;
			if (this._display_node) {
				this._graph_node.add_graph_input(this._display_node);
			}
			this.request_display_node_container();
		}
	}

	remove_children() {
		let child: Object3D | undefined;
		while ((child = this.parent_object.children.pop())) {
			this.parent_object.remove(child);
		}
	}

	get used_in_scene() {
		return this.node.used_in_scene && this.node.flags.display.active && this.node.pv.display == true;
	}

	private async request_display_node_container() {
		if (!this.node.scene.loading_controller.loaded) {
			return;
		}
		if (this.used_in_scene) {
			if (this._display_node) {
				const container = await this._display_node.request_container();
				const core_group = container.core_content();
				if (core_group) {
					// check if the new objects are different
					const new_objects = core_group.objects();
					let new_objects_are_different = new_objects.length != this._children_length;
					if (!new_objects_are_different) {
						for (let object of new_objects) {
							if (!(object.uuid in this._children_uuids_dict)) {
								new_objects_are_different = true;
							}
						}
					}
					// update hierarchy if different
					if (new_objects_are_different) {
						this.remove_children();
						this._children_uuids_dict = {};
						for (let object of new_objects) {
							this.parent_object.add(object);
							this._children_uuids_dict[object.uuid] = true;
						}
						this._children_length = new_objects.length;
					}
				} else {
					this.remove_children();
					this._children_uuids_dict = {};
					this._children_length = 0;
				}
			}
		}
	}
}
