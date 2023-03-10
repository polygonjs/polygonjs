import {TypeAssert} from '../../engine/poly/Assert';
import {SetUtils} from '../SetUtils';
// import {CoreEntity} from './Entity';
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

interface GroupData {
	name: string;
	entitiesCount: number;
}
type GroupsDataForType = GroupData[];
type AllGroupsData = Record<string, GroupsDataForType>;

export enum EntityGroupType {
	POINT = 'points',
	OBJECT = 'objects',
	EDGE = 'edges',
	FACE = 'faces',
}
export interface UpdateGroupOptions {
	type: EntityGroupType;
	groupName: string;
	operation: GroupOperation;
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
	data(): AllGroupsData {
		const dict = this.attributesDictionary();
		const types = Object.keys(dict);
		const data: AllGroupsData = {};
		for (let type of types) {
			const dataForType: GroupsDataForType = [];
			data[type] = dataForType;
			const groupsForType = dict[type];
			const groupNames = Object.keys(groupsForType);
			for (let groupName of groupNames) {
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
	// entities<E extends CoreEntity>(type: EntityGroupType, groupName: string, entities: E[]): E[] {
	// 	const indices = this.findOrCreateGroup(type, groupName);
	// 	const set = SetUtils.fromArray(indices);
	// 	return entities.filter((e) => set.has(e.index()));
	// }
	updateGroup(options: UpdateGroupOptions, selectedIndices: Set<number>) {
		const {type, groupName, operation} = options;
		const currentIndices = this.findOrCreateGroup(type, groupName);

		const updateGroup = (newIndicesSet: Set<number>) => {
			const dict = this.attributesDictionary();
			let groupsByName = dict[type];
			if (!groupsByName) {
				groupsByName = {};
				dict[type] = groupsByName;
			}
			groupsByName[groupName] = SetUtils.toArray(newIndicesSet);
		};

		switch (operation) {
			case GroupOperation.SET: {
				updateGroup(selectedIndices);
				return;
			}
			case GroupOperation.UNION: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.union(currentIndicesSet, selectedIndices);
				updateGroup(newIndicesSet);
				return;
			}
			case GroupOperation.SUBTRACT: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.difference(currentIndicesSet, selectedIndices);
				updateGroup(newIndicesSet);
				return;
			}
			case GroupOperation.INTERSECT: {
				const currentIndicesSet = SetUtils.fromArray(currentIndices);
				const newIndicesSet = SetUtils.intersection(currentIndicesSet, selectedIndices);
				updateGroup(newIndicesSet);
				return;
			}
		}
		TypeAssert.unreachable(operation);
	}
}
