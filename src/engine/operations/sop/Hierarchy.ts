import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {Group} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface HierarchySopParams extends DefaultOperationParams {
	mode: number;
	levels: number;
	objectMask: string;
	debugObjectMask: boolean;
}

export enum HierarchyMode {
	ADD_PARENT = 'add_parent',
	REMOVE_PARENT = 'remove_parent',
	ADD_CHILD = 'add_child',
}
export const HIERARCHY_MODES: Array<HierarchyMode> = [
	HierarchyMode.ADD_PARENT,
	HierarchyMode.REMOVE_PARENT,
	HierarchyMode.ADD_CHILD,
];

export class HierarchySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: HierarchySopParams = {
		mode: 0,
		levels: 1,
		objectMask: '',
		debugObjectMask: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'hierarchy'> {
		return 'hierarchy';
	}

	override cook(inputCoreGroups: CoreGroup[], params: HierarchySopParams) {
		const coreGroup = inputCoreGroups[0];

		const mode = HIERARCHY_MODES[params.mode];
		switch (mode) {
			case HierarchyMode.ADD_PARENT: {
				const objects = this._addParentToCoreGroup(coreGroup, params);
				return this.createCoreGroupFromObjects(objects);
			}
			case HierarchyMode.REMOVE_PARENT: {
				const objects = this._removeParentFromCoreGroup(coreGroup, params);
				return this.createCoreGroupFromObjects(objects);
			}
			case HierarchyMode.ADD_CHILD: {
				const objects = this._addChildToCoreGroup(coreGroup, inputCoreGroups[1], params);
				return this.createCoreGroupFromObjects(objects);
			}
		}
		TypeAssert.unreachable(mode);
	}

	//
	//
	// ADD PARENT
	//
	//
	private _addParentToCoreGroup(core_group: CoreGroup, params: HierarchySopParams): THREE.Object3D[] {
		if (params.levels == 0) {
			return core_group.objects();
		} else {
			const new_object = this._addParentToObject(core_group.objects(), params);
			return [new_object];
		}
	}
	private _addParentToObject(objects: THREE.Object3D[], params: HierarchySopParams): THREE.Object3D {
		let new_parent = new Group();
		new_parent.matrixAutoUpdate = false;

		new_parent.add(...objects);

		if (params.levels > 0) {
			for (let i = 0; i < params.levels - 1; i++) {
				new_parent = this._addNewParent(new_parent, params);
			}
		}

		return new_parent;
	}

	private _addNewParent(object: THREE.Object3D, params: HierarchySopParams): THREE.Group {
		const new_parent2 = new Group();
		new_parent2.matrixAutoUpdate = false;
		new_parent2.add(object);
		return new_parent2;
	}

	//
	//
	// REMOVE PARENT
	//
	//
	private _removeParentFromCoreGroup(core_group: CoreGroup, params: HierarchySopParams): THREE.Object3D[] {
		if (params.levels == 0) {
			return core_group.objects();
		} else {
			const new_objects: Object3D[] = [];
			for (let object of core_group.objects()) {
				const new_children = this._removeParentFromObject(object, params);
				for (let new_child of new_children) {
					new_objects.push(new_child);
				}
			}
			return new_objects;
		}
	}

	private _removeParentFromObject(object: THREE.Object3D, params: HierarchySopParams): THREE.Object3D[] {
		let current_children = object.children;

		for (let i = 0; i < params.levels - 1; i++) {
			current_children = this._getChildrenFromObjects(current_children, params);
		}

		return current_children;
	}

	private _getChildrenFromObjects(objects: THREE.Object3D[], params: HierarchySopParams): THREE.Object3D[] {
		let object;
		const children: Object3D[] = [];
		while ((object = objects.pop())) {
			if (object.children) {
				for (let child of object.children) {
					children.push(child);
				}
			}
		}
		return children;
	}

	//
	//
	// ADD CHILD
	//
	//
	private _addChildToCoreGroup(
		core_group: CoreGroup,
		child_core_group: CoreGroup | undefined,
		params: HierarchySopParams
	): THREE.Object3D[] {
		const objects = core_group.objects();

		if (!child_core_group) {
			this.states?.error.set('input 1 is invalid');
			return [];
		}

		const childObjects = child_core_group.objects();
		const mask = params.objectMask.trim();
		const maskValid = mask != '';

		const parentObjects = maskValid ? this._findObjectsByMaskFromObjects(mask, objects) : objects;
		if (isBooleanTrue(params.debugObjectMask)) {
			console.log(parentObjects);
		}

		for (let i = 0; i < parentObjects.length; i++) {
			const parentObject = parentObjects[i];
			// if there is no mask, we use the objects directly under the coreGroup
			const childObject = childObjects[i] || childObjects[0];
			if (!childObject) {
				this.states?.error.set('no objects found in input 1');
				return [];
			}

			parentObject.add(childObject);
		}
		return objects;
	}
	private _findObjectsByMaskFromObjects(mask: string, objects: Object3D[]) {
		const list: Object3D[] = [];
		for (let object of objects) {
			this.scene().objectsController.objectsByMaskInObject(mask, object, list);
		}
		return list;
	}
}
