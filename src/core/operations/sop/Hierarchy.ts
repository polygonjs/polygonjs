import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {Group} from 'three/src/objects/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface HierarchySopParams extends DefaultOperationParams {
	mode: number;
	levels: number;
}

export enum HierarchyMode {
	ADD_PARENT = 'add_parent',
	REMOVE_PARENT = 'remove_parent',
}
export const HIERARCHY_MODES: Array<HierarchyMode> = [HierarchyMode.ADD_PARENT, HierarchyMode.REMOVE_PARENT];

export class HierarchySopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: HierarchySopParams = {
		mode: 0,
		levels: 1,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'hierarchy'> {
		return 'hierarchy';
	}

	cook(input_contents: CoreGroup[], params: HierarchySopParams) {
		const core_group = input_contents[0];

		if (HIERARCHY_MODES[params.mode] == HierarchyMode.ADD_PARENT) {
			const objects = this._add_parent_to_core_group(core_group, params);
			return this.create_core_group_from_objects(objects);
		} else {
			const objects = this._remove_parent_from_core_group(core_group, params);
			return this.create_core_group_from_objects(objects);
		}
	}

	private _add_parent_to_core_group(core_group: CoreGroup, params: HierarchySopParams): THREE.Object3D[] {
		if (params.levels == 0) {
			return core_group.objects();
		} else {
			const new_objects: Object3D[] = [];
			let new_object;
			for (let object of core_group.objects()) {
				new_object = this._add_parent_to_object(object, params);
				if (new_object) {
					new_objects.push(new_object);
				}
			}

			return new_objects;
		}
	}
	private _add_parent_to_object(object: THREE.Object3D, params: HierarchySopParams): THREE.Object3D {
		let new_parent = new Group();
		new_parent.matrixAutoUpdate = false;

		new_parent.add(object);

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
}
