import {BaseObjNodeClass} from '../_Base';
import {Object3D} from 'three';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {Group} from 'three';
import {BaseSopNodeType} from '../../sop/_Base';
import {Poly} from '../../../Poly';
import {CoreGroup} from '../../../../core/geometry/Group';
// import {TesselationParams} from '../../../../core/geometry/cad/CadCommon';

const DISPLAY_PARAM_NAME = 'display';

export type OnSopGroupUpdatedHook = () => void;
interface BaseObjNodeClassWithDisplayNode extends BaseObjNodeClass {
	displayNodeController: DisplayNodeController;
	// pv: TesselationParams;
}

export class ChildrenDisplayController {
	protected _childrenUuids: Set<string> = new Set();
	protected _sopGroup = this._createSopGroup();
	protected _newObjectsAreDifferent = false;
	protected _newSpecializedObjects: Object3D[] = [];
	constructor(protected node: BaseObjNodeClassWithDisplayNode) {}

	private _createSopGroup() {
		// This may need to be a Mesh for the rivet to update correctly
		// But when it is not used for a rivet, there is a place where a MeshBasicMaterial
		// is added to it, making it an additional webgl program for the renderer.
		// const mesh = new Mesh();
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	sopGroup() {
		return this._sopGroup;
	}
	setSopGroupName() {
		this._sopGroup.name = `${this.node.name()}:sopGroup`;
	}
	dispose() {
		this._clearHooks();
	}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.removeChildren();
			},
			onDisplayNodeSet: () => {
				// use a timeout here, so that the node isn't cooked too early when being copy/pasted, if it had the display flag on.
				// This would make nodes error
				setTimeout(() => {
					this.requestDisplayNodeContainer();
				}, 0);
			},
			onDisplayNodeUpdate: () => {
				this.requestDisplayNodeContainer();
			},
		};
	}

	initializeNode() {
		this.node.object.add(this.sopGroup());
		this.node.nameController.add_post_set_fullPath_hook(this.setSopGroupName.bind(this));
		this._createSopGroup();

		const displayFlag = this.node.flags?.display;
		if (displayFlag) {
			displayFlag.onUpdate(() => {
				this._updateSopGroupHierarchy();
				if (displayFlag.active()) {
					this.requestDisplayNodeContainer();
				}
			});
		}
	}
	private _updateSopGroupHierarchy() {
		const displayFlag = this.node.flags?.display;
		if (displayFlag) {
			const sopGroup = this.sopGroup();
			if (this.usedInScene()) {
				sopGroup.visible = true;
				this.node.object.add(sopGroup);
				sopGroup.updateMatrix();
			} else {
				sopGroup.visible = false;
				this.node.object.remove(sopGroup);
			}
			Poly.onSceneUpdatedHooks.runHooks();
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

	async requestDisplayNodeContainer() {
		if (!this.node.scene().loadingController.loaded()) {
			return;
		}
		if (this.usedInScene()) {
			await this._setContentUnderSopGroup();
		}
	}

	private removeChildren() {
		if (this._sopGroup.children.length == 0) {
			return;
		}
		let child: Object3D | undefined;
		while ((child = this._sopGroup.children[0])) {
			this._sopGroup.remove(child);
		}
		this._childrenUuids.clear();

		this._notifyCamerasController();
	}

	async _setContentUnderSopGroup() {
		// we also check that the parent are the same, in case the node has been deleted
		// TODO: there should be a wider refactor where deleted node cannot raise callbacks such as flags update
		const displayNode = this.node.displayNodeController.displayNode() as BaseSopNodeType;

		if (displayNode && displayNode.parent()?.graphNodeId() == this.node.graphNodeId()) {
			const container = await displayNode.compute();
			const coreGroup = container.coreContent();
			if (coreGroup) {
				// check if the new objects are different
				const newObjects = coreGroup.threejsObjects();
				this._newObjectsAreDifferent = false;
				const checkObjectsAreDifferent = () => {
					this._newObjectsAreDifferent = newObjects.length != this._childrenUuids.size;
					if (!this._newObjectsAreDifferent) {
						for (let object of newObjects) {
							if (!this._childrenUuids.has(object.uuid)) {
								this._newObjectsAreDifferent = true;
							}
						}
					}
				};
				// add CAD objects
				checkObjectsAreDifferent();
				this._newSpecializedObjects.length = 0;
				this._addSpecializedObjects(coreGroup, this._newSpecializedObjects);

				// update hierarchy if different
				if (this._newObjectsAreDifferent) {
					this.removeChildren();
					const addObject = (object: Object3D) => {
						this._sopGroup.add(object);
						// ensure the matrix of the parent is used
						object.updateMatrix();
						this._childrenUuids.add(object.uuid);
					};
					for (let object of newObjects) {
						addObject(object);
					}
					for (let object of this._newSpecializedObjects) {
						addObject(object);
					}
				}
				this._notifyCamerasController();
				this._runOnSopGroupUpdatedHooks();
				if (this.node.scene().loadingController.loaded()) {
					Poly.onObjectsAddedHooks.runHooks(this._sopGroup.children);
					Poly.onSceneUpdatedHooks.runHooks();
				}
				return;
			}
		}
		this.removeChildren();
		this._runOnSopGroupUpdatedHooks();
		if (this.node.scene().loadingController.loaded()) {
			Poly.onSceneUpdatedHooks.runHooks();
		}
	}
	private _notifyCamerasController() {
		this.node.scene().camerasController.updateFromChangeInObject(this._sopGroup);
	}
	protected _addSpecializedObjects(coreGroup: CoreGroup, newObjects: Object3D[]) {}

	//
	//
	// CALLBACKS
	//
	//
	private _onSopGroupUpdatedHookNames: string[] | undefined;
	private _onSopGroupUpdatedHooks: OnSopGroupUpdatedHook[] | undefined;
	registerOnSopGroupUpdated(callbackName: string, callback: OnSopGroupUpdatedHook) {
		this._onSopGroupUpdatedHookNames = this._onSopGroupUpdatedHookNames || [];
		this._onSopGroupUpdatedHooks = this._onSopGroupUpdatedHooks || [];
		this._onSopGroupUpdatedHookNames.push(callbackName);
		this._onSopGroupUpdatedHooks.push(callback);
	}
	private _clearHooks() {
		if (!this._onSopGroupUpdatedHookNames || !this._onSopGroupUpdatedHooks) {
			return;
		}
		for (let hookName of this._onSopGroupUpdatedHookNames) {
			this.deregisterOnSopGroupUpdated(hookName);
		}
	}
	deregisterOnSopGroupUpdated(callbackName: string) {
		if (!this._onSopGroupUpdatedHookNames || !this._onSopGroupUpdatedHooks) {
			return;
		}
		const index = this._onSopGroupUpdatedHookNames?.indexOf(callbackName);
		this._onSopGroupUpdatedHookNames.splice(index, 1);
		this._onSopGroupUpdatedHooks.splice(index, 1);
		if (this._onSopGroupUpdatedHookNames.length == 0) {
			this._onSopGroupUpdatedHookNames = undefined;
		}
		if (this._onSopGroupUpdatedHooks.length == 0) {
			this._onSopGroupUpdatedHooks = undefined;
		}
	}
	private _runOnSopGroupUpdatedHooks() {
		if (this._onSopGroupUpdatedHooks) {
			const hooks = [...this._onSopGroupUpdatedHooks];
			for (let hook of hooks) {
				hook();
			}
		}
	}
	onSopGroupUpdatedCallbackNames() {
		return this._onSopGroupUpdatedHookNames;
	}
}
