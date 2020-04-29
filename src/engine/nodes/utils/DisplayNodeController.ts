import {GeoObjNode} from '../obj/Geo';
import {BaseSopNodeType} from '../sop/_Base';
import {Object3D} from 'three/src/core/Object3D';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

export class DisplayNodeController {
	_graph_node: CoreGraphNode;
	_display_node: BaseSopNodeType | undefined = undefined;
	_children_uuids_dict: Dictionary<boolean> = {};
	_children_length: number = 0;
	private _request_display_node_container_bound = this.request_display_node_container.bind(this);
	constructor(protected node: GeoObjNode) {
		this._graph_node = new CoreGraphNode(node.scene, 'DisplayNodeController');
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
		this.node.lifecycle.add_on_child_remove_hook((child_node) => {
			if (child_node.graph_node_id == this._display_node?.graph_node_id) {
				const children = this.node.children();
				const last_child = children[children.length - 1];
				if (last_child) {
					last_child.flags.display.set(true);
				} else {
					this.set_display_node(undefined);
				}
			}
		});
		this._graph_node.dirty_controller.add_post_dirty_hook(
			'_request_display_node_container',
			this._request_display_node_container_bound
		);
	}

	async set_display_node(new_display_node: BaseSopNodeType | undefined) {
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

			// use a timeout here, so that the node isn't cooked too early when being copy/pasted, if it had the display flag on.
			// This would make nodes error
			setTimeout(() => {
				this.request_display_node_container();
			}, 0);
		}
	}

	remove_children() {
		if (this.parent_object.children.length == 0) {
			return;
		}
		let child: Object3D | undefined;
		while ((child = this.parent_object.children[0])) {
			this.parent_object.remove(child);
		}
		this._children_uuids_dict = {};
		this._children_length = 0;
	}

	get used_in_scene() {
		return this.node.used_in_scene && this.node.flags.display.active && this.node.pv.display == true;
	}

	async request_display_node_container() {
		if (!this.node.scene.loading_controller.loaded) {
			return;
		}
		if (this.used_in_scene) {
			await this._set_content_under_sop_group();
		}
	}

	private async _set_content_under_sop_group() {
		// we also check that the parent are the same, in case the node has been deleted
		if (this._display_node && this._display_node.parent?.graph_node_id == this.node.graph_node_id) {
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
					for (let object of new_objects) {
						this.parent_object.add(object);
						this._children_uuids_dict[object.uuid] = true;
					}
					this._children_length = new_objects.length;
				}
			} else {
				this.remove_children();
			}
		} else {
			this.remove_children();
		}
	}
}
