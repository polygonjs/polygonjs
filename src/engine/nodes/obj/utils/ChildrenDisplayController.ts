import {BaseObjNodeClass} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {Group} from 'three/src/objects/Group';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {BaseSopNodeType} from '../../sop/_Base';

const DISPLAY_PARAM_NAME = 'display';

interface BaseObjNodeClassWithDisplayNode extends BaseObjNodeClass {
	displayNodeController: DisplayNodeController;
}

export class ChildrenDisplayController {
	_children_uuids_dict: PolyDictionary<boolean> = {};
	_children_length: number = 0;
	private _sop_group = this._create_sop_group();

	constructor(private node: BaseObjNodeClassWithDisplayNode) {}

	private _create_sop_group() {
		// This may need to be a Mesh for the rivet to update correctly
		// But when it is not used for a rivet, there is a place where a MeshBasicMaterial
		// is added to it, making it an additional webgl program for the renderer.
		// const mesh = new Mesh();
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	sopGroup() {
		return this._sop_group;
	}
	set_sop_group_name() {
		this._sop_group.name = `${this.node.name()}:sop_group`;
	}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.remove_children();
			},
			onDisplayNodeSet: () => {
				// use a timeout here, so that the node isn't cooked too early when being copy/pasted, if it had the display flag on.
				// This would make nodes error
				setTimeout(() => {
					this.request_display_node_container();
				}, 0);
			},
			onDisplayNodeUpdate: () => {
				this.request_display_node_container();
			},
		};
	}

	initializeNode() {
		this.node.object.add(this.sopGroup());
		this.node.nameController.add_post_set_fullPath_hook(this.set_sop_group_name.bind(this));
		this._create_sop_group();

		const display_flag = this.node.flags?.display;
		if (display_flag) {
			display_flag.onUpdate(() => {
				this._updateSopGroupHierarchy();
				if (display_flag.active()) {
					this.request_display_node_container();
				}
			});
		}
	}
	private _updateSopGroupHierarchy() {
		const display_flag = this.node.flags?.display;
		if (display_flag) {
			const sopGroup = this.sopGroup();
			if (this.usedInScene()) {
				sopGroup.visible = true;
				this.node.object.add(sopGroup);
			} else {
				sopGroup.visible = false;
				this.node.object.remove(sopGroup);
			}
		}
	}

	usedInScene(): boolean {
		const has_active_param = this.node.params.has(DISPLAY_PARAM_NAME);
		const is_active_param_on = this.node.params.boolean(DISPLAY_PARAM_NAME);

		const used_in_scene = this.node.usedInScene();
		const display_flag_on = this.node.flags?.display?.active() || false;
		const param_active_on = !has_active_param || is_active_param_on;

		return used_in_scene && display_flag_on && param_active_on;
	}

	async request_display_node_container() {
		if (!this.node.scene().loadingController.loaded()) {
			return;
		}
		if (this.usedInScene()) {
			await this._set_content_under_sop_group();
		}
	}

	remove_children() {
		if (this._sop_group.children.length == 0) {
			return;
		}
		let child: Object3D | undefined;
		while ((child = this._sop_group.children[0])) {
			this._sop_group.remove(child);
		}
		this._children_uuids_dict = {};
		this._children_length = 0;
	}

	async _set_content_under_sop_group() {
		// we also check that the parent are the same, in case the node has been deleted
		// TODO: there should be a wider refactor where deleted node cannot raise callbacks such as flags update
		const display_node = this.node.displayNodeController.displayNode() as BaseSopNodeType;
		if (display_node && display_node.parent()?.graphNodeId() == this.node.graphNodeId()) {
			const container = await display_node.requestContainer();
			const core_group = container.coreContent();
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
						this._sop_group.add(object);
						// ensure the matrix of the parent is used
						object.updateMatrix();
						this._children_uuids_dict[object.uuid] = true;
					}
					this._children_length = new_objects.length;
				}
				return;
			}
		}
		this.remove_children();
	}
}
