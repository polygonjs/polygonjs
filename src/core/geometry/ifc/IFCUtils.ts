import * as WEB_IFC from 'web-ifc';
import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
import type {IFCManager} from 'web-ifc-three/IFC/components/IFCManager';
import {setToArray} from '../../SetUtils';
import {IFCLoaderHandler} from '../../loader/geometry/IFC';
import {Object3D} from 'three';

export enum IFCAttribute {
	MODEL_ID = 'modelId',
}

interface StructureItem {
	expressID: number;
	type: string;
	children?: StructureItem[];
}
type StructureCallback = (structure: StructureItem) => void;
const _numberSet: Set<number> = new Set();
const _stringSet: Set<string> = new Set();

export async function getIFCModelCategories(object: Object3D) {
	const modelId = (object as IFCModel).modelID;
	if (modelId == null) {
		return;
	}
	const ifcManager = IFCLoaderHandler.ifcManager();
	return await ifcCategoriesNames(ifcManager, modelId);
}
// interface CagegoryResult {
// 	categoryNames: string[];
// 	cagegoryIds: number[];
// }
export function ifcCategoryIds(categoryNames: string[]): number[] {
	const cagegoryIds: number[] = [];
	for (const categoryName of categoryNames) {
		const id = (WEB_IFC as any as Record<string, number>)[categoryName];
		if (id != null) {
			cagegoryIds.push(id);
		}
	}
	return cagegoryIds;
}

export async function ifcElementIds(ifcManager: IFCManager, modelId: number, categoryIds: number[]): Promise<number[]> {
	const promises = categoryIds.map(
		(categoryId) => ifcManager.getAllItemsOfType(modelId, categoryId, false) as Promise<number[]>
	);
	const results = await Promise.all(promises);

	_numberSet.clear();
	for (const result of results) {
		for (const id of result) {
			_numberSet.add(id);
		}
	}
	return setToArray(_numberSet, []);
}

export async function ifcCategoriesNames(ifcManager: IFCManager, modelID: number): Promise<string[]> {
	const root: StructureItem = await ifcManager.getSpatialStructure(modelID, false);
	_stringSet.clear();
	traverseStructure(root, (item) => {
		_stringSet.add(item.type);
	});
	const categoryNames = setToArray(_stringSet, []);

	return categoryNames;
}
function traverseStructure(item: StructureItem, callback: StructureCallback, level = 0) {
	// console.log(level, item);
	callback(item);
	if (!item.children) {
		return;
	}
	const children = item.children;
	for (const child of children) {
		traverseStructure(child, callback, level + 1);
	}
}
