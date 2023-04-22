import * as WEB_IFC from 'web-ifc';
import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
import type {IFCManager} from 'web-ifc-three/IFC/components/IFCManager';
import {SetUtils} from '../../SetUtils';
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

	const ids: Set<number> = new Set();
	for (let result of results) {
		for (let id of result) {
			ids.add(id);
		}
	}
	return SetUtils.toArray(ids);
}

export async function ifcCategoriesNames(ifcManager: IFCManager, modelID: number): Promise<string[]> {
	const root: StructureItem = await ifcManager.getSpatialStructure(modelID, false);
	const types: Set<string> = new Set();
	traverseStructure(root, (item) => {
		types.add(item.type);
	});
	const categoryNames = SetUtils.toArray(types);

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
