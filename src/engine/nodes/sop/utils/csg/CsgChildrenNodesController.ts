import {DisplayNodeControllerCallbacks} from '../../../utils/DisplayNodeController';
import {CsgNetworkSopNode} from '../../CsgNetwork';

export class CsgChildrenDisplayController {
	_children_uuids_dict: Map<string, boolean> = new Map();
	_children_length: number = 0;

	constructor(private node: CsgNetworkSopNode) {}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}

	// initializeNode() {
	// 	// this.node.object.add(this.sopGroup());
	// 	// this.node.nameController.add_post_set_fullPath_hook(this.setSopGroupName.bind(this));
	// 	// this._createSopGroup();

	// 	// const display_flag = this.node.flags?.display;
	// 	// if (display_flag) {
	// 	// 	display_flag.onUpdate(() => {
	// 	// 		this._updateSopGroupHierarchy();
	// 	// 		if (display_flag.active()) {
	// 	// 			this.request_display_node_container();
	// 	// 		}
	// 	// 	});
	// 	// }
	// }
	// private _updateSopGroupHierarchy() {
	// 	const display_flag = this.node.flags?.display;
	// 	if (display_flag) {
	// 		const sopGroup = this.sopGroup();
	// 		if (this.usedInScene()) {
	// 			sopGroup.visible = true;
	// 			this.node.object.add(sopGroup);
	// 			sopGroup.updateMatrix();
	// 		} else {
	// 			sopGroup.visible = false;
	// 			this.node.object.remove(sopGroup);
	// 		}
	// 	}
	// }

	// async request_display_node_container() {
	// 	// if (!this.node.scene().loadingController.loaded()) {
	// 	// 	return;
	// 	// }
	// 	// 	await this._setContentUnderSopGroup();
	// }

	// remove_children() {
	// 	if (this._sopGroup.children.length == 0) {
	// 		return;
	// 	}
	// 	let child: Object3D | undefined;
	// 	while ((child = this._sopGroup.children[0])) {
	// 		this._sopGroup.remove(child);
	// 	}
	// 	this._children_uuids_dict.clear();
	// 	this._children_length = 0;

	// 	this._notifyCamerasController();
	// }

	// async _setContentUnderSopGroup() {
	// 	// we also check that the parent are the same, in case the node has been deleted
	// 	// TODO: there should be a wider refactor where deleted node cannot raise callbacks such as flags update
	// 	const display_node = this.node.displayNodeController.displayNode() as BaseSopNodeType;

	// 	if (display_node && display_node.parent()?.graphNodeId() == this.node.graphNodeId()) {
	// 		const container = await display_node.compute();
	// 		const core_group = container.coreContent();
	// 		if (core_group) {
	// 			// check if the new objects are different
	// 			const new_objects = core_group.objects();
	// 			let new_objects_are_different = new_objects.length != this._children_length;
	// 			if (!new_objects_are_different) {
	// 				for (let object of new_objects) {
	// 					if (!this._children_uuids_dict.get(object.uuid)) {
	// 						new_objects_are_different = true;
	// 					}
	// 				}
	// 			}
	// 			// update hierarchy if different
	// 			if (new_objects_are_different) {
	// 				this.remove_children();
	// 				for (let object of new_objects) {
	// 					this._sopGroup.add(object);
	// 					// ensure the matrix of the parent is used
	// 					object.updateMatrix();
	// 					this._children_uuids_dict.set(object.uuid, true);
	// 				}
	// 				this._children_length = new_objects.length;
	// 			}
	// 			this._notifyCamerasController();
	// 			return;
	// 		}
	// 	}
	// 	this.remove_children();
	// }
	// private _notifyCamerasController() {
	// 	this.node.scene().camerasController.updateFromChangeInObject(this._sopGroup);
	// }
}
