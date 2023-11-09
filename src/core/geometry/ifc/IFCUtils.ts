import {Object3D, InstancedMesh, Group} from 'three';
import {setToArray} from '../../SetUtils';
import {isArray} from '../../Type';
import * as WEB_IFC from 'web-ifc';
import {
	Components,
	SimpleScene,
	PostproductionRenderer,
	SimpleCamera,
	SimpleRaycaster,
	FragmentIfcLoader,
	IfcCategories,
	FragmentsGroup,
} from './IFCCommon';
import {isNumber} from '../../Type';
import {ThreejsCoreObject} from '../modules/three/ThreejsCoreObject';
import {copyObjectAllProperties} from '../modules/three/ThreejsObjectUtils';

function _buildCategoryNameById() {
	const dict: Record<number, string> = {};
	const keys = Object.keys(WEB_IFC);
	for (const key of keys) {
		const value = (WEB_IFC as any)[key];
		if (isNumber(value)) {
			dict[value] = key;
		}
	}
	return dict;
}
export const IFC_CATEGORY_NAME_BY_ID = _buildCategoryNameById();

export enum IFCAttribute {
	ALL_CATEGORY_NAMES = 'IFCAllCategoryNames',
}
const CATEGORY_SEPARATOR = ' ';
export function setObjectAttributeAllCategoryNames(object: Object3D, categoryNames: string[]) {
	ThreejsCoreObject.addAttribute(object, IFCAttribute.ALL_CATEGORY_NAMES, categoryNames.join(CATEGORY_SEPARATOR));
}
export function getObjectAttributeAllCategoryNames(object: Object3D): string | undefined {
	const categoriesJoined = ThreejsCoreObject.attribValue(object, IFCAttribute.ALL_CATEGORY_NAMES) as
		| string
		| undefined;
	return categoriesJoined;
}
export function categoryNamesFromString(categoriesJoined: string): string[] {
	return categoriesJoined.split(CATEGORY_SEPARATOR);
}

export function ifcFragmentsGroupToGroup(fragmentsGroup: FragmentsGroup): Object3D {
	function buildThreeObject(ifcObject: Object3D): Object3D | Object3D[] | undefined {
		if ((ifcObject as InstancedMesh).isInstancedMesh) {
			const count = (ifcObject as InstancedMesh).count;
			const geometry = (ifcObject as InstancedMesh).geometry;
			const material = (ifcObject as InstancedMesh).material;
			return copyObjectAllProperties(ifcObject, new InstancedMesh(geometry, material, count));
		}
		if ((ifcObject as Group).isGroup) {
			return copyObjectAllProperties(ifcObject, new Group());
		}
		console.warn('no conversion found for IFC object', ifcObject);
	}

	const group = new Group();
	const threeObjectByIFCObject: Map<Object3D, Object3D> = new Map();
	threeObjectByIFCObject.set(fragmentsGroup, group);

	function _addObject(ifcObject: Object3D, threeObject: Object3D) {
		threeObjectByIFCObject.set(ifcObject, threeObject);
		const ifcParent = ifcObject.parent;
		if (ifcParent) {
			const threeParent = threeObjectByIFCObject.get(ifcParent);
			if (threeParent) {
				threeParent.add(threeObject);
			}
		}
	}

	fragmentsGroup.traverse((ifcObject) => {
		if (ifcObject == fragmentsGroup) {
			return;
		}

		const threeObject = buildThreeObject(ifcObject);
		if (!threeObject) {
			return;
		}
		if (isArray(threeObject)) {
			for (const obj of threeObject) {
				_addObject(ifcObject, obj);
			}
		} else {
			_addObject(ifcObject, threeObject);
		}
	});

	return group;
}

const _stringSet: Set<string> = new Set();

export function createFragmentIfcLoader() {
	const components = new Components();
	components.scene = new SimpleScene(components);
	const container = document.createElement('div');
	components.renderer = new PostproductionRenderer(components, container);
	components.camera = new SimpleCamera(components);
	components.raycaster = new SimpleRaycaster(components);
	const fragmentIfcLoader = new FragmentIfcLoader(components);

	fragmentIfcLoader.settings.wasm = {
		path: 'https://unpkg.com/web-ifc@0.0.44/',
		absolute: true,
	};

	return fragmentIfcLoader;
}

async function _getCategoryIds(fragmentIfcLoader: FragmentIfcLoader, byteArray: Uint8Array) {
	const api = fragmentIfcLoader.get();
	const {path, absolute} = fragmentIfcLoader.settings.wasm;
	api.SetWasmPath(path, absolute);
	await api.Init();
	api.OpenModel(byteArray, fragmentIfcLoader.settings.webIfc);
	const ifcCategories = new IfcCategories();
	const categories = ifcCategories.getAll(api, 0);
	return categories;
}
export async function getCategoryNames(fragmentIfcLoader: FragmentIfcLoader, byteArray: Uint8Array): Promise<string[]> {
	const categoryIdByObjectId = await _getCategoryIds(fragmentIfcLoader, byteArray);
	const categoryIds = Object.values(categoryIdByObjectId);
	_stringSet.clear();
	for (const categoryId of categoryIds) {
		const categoryName = IFC_CATEGORY_NAME_BY_ID[categoryId];
		_stringSet.add(categoryName);
	}
	const categoryNames: string[] = [];
	setToArray(_stringSet, categoryNames);
	return categoryNames;
}
