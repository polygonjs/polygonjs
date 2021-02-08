import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {Group} from 'three/src/objects/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';

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
	static readonly DEFAULT_PARAMS: HierarchySopParams = {
		mode: 0,
		levels: 1,
		objectMask: '',
		debugObjectMask: false,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'hierarchy'> {
		return 'hierarchy';
	}

	cook(input_contents: CoreGroup[], params: HierarchySopParams) {
		const core_group = input_contents[0];

		const mode = HIERARCHY_MODES[params.mode];
		switch (mode) {
			case HierarchyMode.ADD_PARENT: {
				const objects = this._add_parent_to_core_group(core_group, params);
				return this.create_core_group_from_objects(objects);
			}
			case HierarchyMode.REMOVE_PARENT: {
				const objects = this._remove_parent_from_core_group(core_group, params);
				return this.create_core_group_from_objects(objects);
			}
			case HierarchyMode.ADD_CHILD: {
				const objects = this._add_child_to_core_group(core_group, input_contents[1], params);
				return this.create_core_group_from_objects(objects);
			}
		}
		TypeAssert.unreachable(mode);
	}

	//
	//
	// ADD PARENT
	//
	//
	private _add_parent_to_core_group(core_group: CoreGroup, params: HierarchySopParams): THREE.Object3D[] {
		if (params.levels == 0) {
			return core_group.objects();
		} else {
			const new_object = this._add_parent_to_object(core_group.objects(), params);
			return [new_object];
		}
	}
	private _add_parent_to_object(objects: THREE.Object3D[], params: HierarchySopParams): THREE.Object3D {
		let new_parent = new Group();
		new_parent.matrixAutoUpdate = false;

		new_parent.add(...objects);

		if (params.levels > 0) {
			for (let i = 0; i < params.levels - 1; i++) {
				new_parent = this._add_new_parent(new_parent, params);
			}
		}

		return new_parent;
	}

	private _add_new_parent(object: THREE.Object3D, params: HierarchySopParams): THREE.Group {
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
	private _remove_parent_from_core_group(core_group: CoreGroup, params: HierarchySopParams): THREE.Object3D[] {
		if (params.levels == 0) {
			return core_group.objects();
		} else {
			const new_objects: Object3D[] = [];
			for (let object of core_group.objects()) {
				const new_children = this._remove_parent_from_object(object, params);
				for (let new_child of new_children) {
					new_objects.push(new_child);
				}
			}
			return new_objects;
		}
	}

	private _remove_parent_from_object(object: THREE.Object3D, params: HierarchySopParams): THREE.Object3D[] {
		let current_children = object.children;

		for (let i = 0; i < params.levels - 1; i++) {
			current_children = this._get_children_from_objects(current_children, params);
		}

		return current_children;
	}

	private _get_children_from_objects(objects: THREE.Object3D[], params: HierarchySopParams): THREE.Object3D[] {
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
	private _add_child_to_core_group(
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
		if (params.debugObjectMask) {
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
			this.scene.objectsController.objectsByMaskInObject(mask, object, list);
		}
		return list;
	}
}
