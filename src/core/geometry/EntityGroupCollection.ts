import {
	CoreEntitySelectionState,
	selectedIndicesFromSelectionStates,
} from '../../engine/nodes/sop/utils/group/GroupCommon';
import {TypeAssert} from '../../engine/poly/Assert';
import {SetUtils} from '../SetUtils';
import {CoreObjectType, ObjectContent} from './ObjectContent';

export enum GroupOperation {
	SET = 'replace existing',
	UNION = 'add to existing',
	SUBTRACT = 'subtract from existing',
	INTERSECT = 'intersect with existing',
}
export const GROUP_OPERATIONS: GroupOperation[] = [
	GroupOperation.SET,
	GroupOperation.UNION,
	GroupOperation.SUBTRACT,
	GroupOperation.INTERSECT,
];

export interface GroupData {
	name: string;
	entitiesCount: number;
}
type GroupsDataForType = GroupData[];
export type GroupCollectionData = Record<string, GroupsDataForType>;

export enum EntityGroupType {
	POINT = 'point',
	OBJECT = 'object',
	EDGE = 'edge',
	FACE = 'face',
}
export interface UpdateGroupOptions {
	type: EntityGroupType;
	groupName: string;
	operation: GroupOperation;
	invert: boolean;
}

const USER_DATA_KEY_GROUPS = 'groups';
export type GroupsDictionary = Record<string, Record<string, number[]>>;

export class EntityGroupCollection {
	// private _groupsByNameByType: Map<GroupType, Map<string, EntityGroup>> = new Map();

	constructor(private _object: ObjectContent<CoreObjectType>) {}

	attributesDictionary() {
		return EntityGroupCollection.attributesDictionary(this._object);
	}
	static attributesDictionary<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (
			(object.userData[USER_DATA_KEY_GROUPS] as GroupsDictionary) ||
			this._createAttributesDictionaryIfNone(object)
		);
	}
	private static _createAttributesDictionaryIfNone<T extends CoreObjectType>(object: ObjectContent<T>) {
		if (!object.userData[USER_DATA_KEY_GROUPS]) {
			return (object.userData[USER_DATA_KEY_GROUPS] = {});
		}
	}

	findOrCreateGroup(type: EntityGroupType, groupName: string) {
		const dict = this.attributesDictionary();
		let groupsByName = dict[type];
		if (!groupsByName) {
			groupsByName = {};
			dict[type] = groupsByName;
		}
		let group = groupsByName[groupName];
		if (!group) {
			group = [];
			groupsByName[groupName] = group;
		}
		return group;
	}
	deleteGroup(type: EntityGroupType, groupName: string) {
		const dict = this.attributesDictionary();
		const groupsByName = dict[type];
		if (groupsByName) {
			delete groupsByName[groupName];
			// clean if possible
			if (Object.keys(groupsByName).length == 0) {
				delete dict[type];
			}
		}
	}
	static data<T extends CoreObjectType>(object: ObjectContent<T>): GroupCollectionData {
		const dict = this.attributesDictionary(object);
		const types = Object.keys(dict);
		const data: GroupCollectionData = {};
		for (const type of types) {
			const dataForType: GroupsDataForType = [];
			data[type] = dataForType;
			const groupsForType = dict[type];
			const groupNames = Object.keys(groupsForType);
			for (const groupName of groupNames) {
				const indices = groupsForType[groupName];
				const groupData: GroupData = {
					name: groupName,
					entitiesCount: indices.length,
				};
				dataForType.push(groupData);
			}
		}
		return data;
	}
	indicesSet(type: EntityGroupType, groupName: string, target: Set<number>) {
		const dict = this.attributesDictionary();
		const groupsByName = dict[type];
		target.clear();
		if (groupsByName) {
			const indices = groupsByName[groupName];
			if (indices) {
				SetUtils.fromArray(indices, target);
			}
		}
	}

	private selectedIndices: Set<number> = new Set();
	updateGroup(options: UpdateGroupOptions, selectionStates: CoreEntitySelectionState) {
		const {type, groupName, operation, invert} = options;
		const currentIndices = this.findOrCreateGroup(type, groupName);
		const _updateGroup = (newIndicesSet: Set<number>) => {
			const dict = this.attributesDictionary();
			let groupsByName = dict[type];
			if (!groupsByName) {
				groupsByName = {};
				dict[type] = groupsByName;
			}
			groupsByName[groupName] = SetUtils.toArray(newIndicesSet, []);
		};
		this.selectedIndices.clear();
		selectedIndicesFromSelectionStates(selectionStates, this.selectedIndices, invert);
		switch (operation) {
			case GroupOperation.SET: {
				_updateGroup(this.selectedIndices);
				return;
			}
			case GroupOperation.UNION: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.union(currentIndicesSet, this.selectedIndices);
				_updateGroup(newIndicesSet);
				return;
			}
			case GroupOperation.SUBTRACT: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.difference(currentIndicesSet, this.selectedIndices);
				_updateGroup(newIndicesSet);
				return;
			}
			case GroupOperation.INTERSECT: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.intersection(currentIndicesSet, this.selectedIndices);
				_updateGroup(newIndicesSet);
				return;
			}
		}
		TypeAssert.unreachable(operation);
	}
}
