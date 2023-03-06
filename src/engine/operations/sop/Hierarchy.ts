import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {Group} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeStatesController} from '../../nodes/utils/StatesController';
import {CorePath} from '../../../core/geometry/CorePath';

interface HierarchySopParams extends DefaultOperationParams {
	mode: number;
	levels: number;
	objectMask: string;
	addChildMode: number;
}

export enum HierarchyMode {
	ADD_PARENT = 'add parent',
	REMOVE_PARENT = 'remove parent',
	ADD_CHILD = 'add child',
}
export const HIERARCHY_MODES: Array<HierarchyMode> = [
	HierarchyMode.ADD_PARENT,
	HierarchyMode.REMOVE_PARENT,
	HierarchyMode.ADD_CHILD,
];
export enum AddChildMode {
	ONE_CHILD_PER_PARENT = 'one child per parent',
	ALL_CHILDREN_UNDER_FIRST_PARENT = 'all children under first parent',
	ALL_CHILDREN_UNDER_ALL_PARENTS = 'all children under all parents',
}
export const ADD_CHILD_MODES: Array<AddChildMode> = [
	AddChildMode.ONE_CHILD_PER_PARENT,
	AddChildMode.ALL_CHILDREN_UNDER_FIRST_PARENT,
	AddChildMode.ALL_CHILDREN_UNDER_ALL_PARENTS,
];

export class HierarchySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: HierarchySopParams = {
		mode: HIERARCHY_MODES.indexOf(HierarchyMode.ADD_PARENT),
		levels: 1,
		objectMask: '',
		addChildMode: ADD_CHILD_MODES.indexOf(AddChildMode.ALL_CHILDREN_UNDER_FIRST_PARENT),
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
				const objects = addParentToCoreGroup(coreGroup, inputCoreGroups[1], params);
				return this.createCoreGroupFromObjects(objects);
			}
			case HierarchyMode.REMOVE_PARENT: {
				const objects = _removeParentFromCoreGroup(coreGroup, params);
				return this.createCoreGroupFromObjects(objects);
			}
			case HierarchyMode.ADD_CHILD: {
				const objects = _addChildrenToCoreGroup(coreGroup, inputCoreGroups[1], params, this, this.states);
				return this.createCoreGroupFromObjects(objects);
			}
		}
		TypeAssert.unreachable(mode);
	}
}

function addParentToCoreGroup(
	coreGroup: CoreGroup,
	parentCoreGroup: CoreGroup | undefined,
	params: HierarchySopParams
): Object3D[] {
	function _addParentToObject(objects: Object3D[]): Object3D {
		function _createNewParent() {
			const newParent2 = new Group();
			newParent2.matrixAutoUpdate = false;
			return newParent2;
		}

		let newParent: Object3D | undefined;
		if (parentCoreGroup) {
			newParent = parentCoreGroup?.threejsObjects()[0];
		}
		newParent = newParent || _createNewParent();
		for (let object of objects) {
			newParent.add(object);
		}
		if (params.levels > 1) {
			function _addNewParent(object: Object3D, params: HierarchySopParams): Group {
				const newParent2 = _createNewParent();
				newParent2.add(object);
				return newParent2;
			}
			for (let i = 1; i < params.levels; i++) {
				newParent = _addNewParent(newParent, params);
			}
		}

		return newParent;
	}

	if (params.levels == 0) {
		return coreGroup.threejsObjects();
	} else {
		const newObject = _addParentToObject(coreGroup.threejsObjects());
		return [newObject];
	}
}

function _removeParentFromCoreGroup(coreGroup: CoreGroup, params: HierarchySopParams): Object3D[] {
	function _removeParentFromObject(object: Object3D, params: HierarchySopParams): Object3D[] {
		function _getChildrenFromObjects(objects: Object3D[]): Object3D[] {
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

		let current_children = object.children;

		for (let i = 0; i < params.levels - 1; i++) {
			current_children = _getChildrenFromObjects(current_children);
		}

		return current_children;
	}

	if (params.levels == 0) {
		return coreGroup.threejsObjects();
	} else {
		const newObjects: Object3D[] = [];
		const threejsObjects = coreGroup.threejsObjects();
		for (let object of threejsObjects) {
			const newChildren = _removeParentFromObject(object, params);
			for (let newChild of newChildren) {
				newObjects.push(newChild);
			}
		}
		return newObjects;
	}
}

function _addChildrenToCoreGroup(
	coreGroup: CoreGroup,
	childCoreGroup: CoreGroup | undefined,
	params: HierarchySopParams,
	operation: HierarchySopOperation,
	states: NodeStatesController<NodeContext.SOP> | undefined
): Object3D[] {
	const objects = coreGroup.threejsObjects();

	if (!childCoreGroup) {
		states?.error.set('input 1 is invalid');
		return [];
	}

	function _findObjectsByMaskFromObjects(mask: string, objects: Object3D[]) {
		const list: Object3D[] = [];
		for (let object of objects) {
			CorePath.objectsByMaskInObject(mask, object, list);
		}
		return list;
	}
	function _getParentObjects() {
		const mask = params.objectMask.trim();
		const maskValid = mask != '';

		const parentObjects = maskValid ? _findObjectsByMaskFromObjects(mask, objects) : objects;
		return parentObjects;
	}
	const parentObjects = _getParentObjects();
	const childObjects = childCoreGroup.threejsObjects();

	function _addOneChildPerParent() {
		for (let i = 0; i < parentObjects.length; i++) {
			const parentObject = parentObjects[i];
			// if there is no mask, we use the objects directly under the coreGroup
			const childObject = childObjects[i] || childObjects[0];
			if (!childObject) {
				states?.error.set('no objects found in input 1');
				return [];
			}

			parentObject.add(childObject);
		}
		return objects;
	}
	function _addAllChildrenUnderFirstParent() {
		const parentObject = parentObjects[0];
		for (let childObject of childObjects) {
			parentObject.add(childObject);
		}
		return objects;
	}
	function _addAllChildrenUnderAllParents() {
		for (let parentObject of parentObjects) {
			for (let childObject of childObjects) {
				parentObject.add(childObject.clone());
			}
		}
		return objects;
	}

	const addChildMode = ADD_CHILD_MODES[params.addChildMode];
	switch (addChildMode) {
		case AddChildMode.ONE_CHILD_PER_PARENT: {
			return _addOneChildPerParent();
		}
		case AddChildMode.ALL_CHILDREN_UNDER_FIRST_PARENT: {
			return _addAllChildrenUnderFirstParent();
		}
		case AddChildMode.ALL_CHILDREN_UNDER_ALL_PARENTS: {
			return _addAllChildrenUnderAllParents();
		}
	}
	TypeAssert.unreachable(addChildMode);
}
