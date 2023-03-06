import {AttribValue} from './../../types/GlobalTypes';
// import {Object3D} from 'three'
// import {Group} from 'three'
import {Mesh, Box3, BufferGeometry} from 'three';
import {TypedContainer} from './_Base';
import {CoreGroup} from '../../core/geometry/Group';
import {CoreGeometry} from '../../core/geometry/Geometry';
// import {Object3D} from 'three';
import {ContainableMap} from './utils/ContainableMap';
// import {CoreObject} from '../../core/geometry/Object';
import {AttribSize, AttribType, ObjectData} from '../../core/geometry/Constant';
import {BaseCoreObject} from '../../core/geometry/_BaseObject';
import {CoreObject} from '../../core/geometry/Object';
import {SetUtils} from '../../core/SetUtils';
import {NodeContext} from '../poly/NodeContext';
import {PolyDictionary} from '../../types/GlobalTypes';
import {MapUtils} from '../../core/MapUtils';
import {isObject3D} from '../../core/geometry/ObjectContent';

export class GeometryContainer extends TypedContainer<NodeContext.SOP> {
	// set_objects(objects: Object3D[]) {}

	override coreContentCloned(): CoreGroup | undefined {
		if (this._content) {
			return this._content.clone();
		}
	}

	override set_content(content: ContainableMap[NodeContext.SOP]) {
		super.set_content(content);
	}

	private _firstObject() {
		if (this._content) {
			return this._content.allObjects()[0];
		}
	}
	// private firstCoreObject() {
	// 	const object = this.firstObject();
	// 	if (object) {
	// 		return new CoreObject(object, 0);
	// 	}
	// }
	private firstGeometry(): BufferGeometry | null {
		const object = this._firstObject();
		if (object && isObject3D(object)) {
			return (object as Mesh).geometry as BufferGeometry;
		} else {
			return null;
		}
	}

	objectsCount(): number {
		if (this._content) {
			return this._content.allObjects().length;
		} else {
			return 0;
		}
	}
	objectsVisibleCount(): number {
		let count = 0;
		if (this._content) {
			const objects = this._content.allObjects();
			for (let object of objects) {
				if (object.visible) {
					count++;
				}
			}
		}
		return count;
	}
	objectsCountByType() {
		const count_by_type: PolyDictionary<number> = {};
		const core_group = this._content;
		if (this._content && core_group) {
			for (let core_object of core_group.allCoreObjects()) {
				const human_type = core_object.humanType();
				if (count_by_type[human_type] == null) {
					count_by_type[human_type] = 0;
				}
				count_by_type[human_type] += 1;
			}
		}
		return count_by_type;
	}
	objectsNamesByType() {
		const names_by_type: PolyDictionary<string[]> = {};
		const core_group = this._content;
		if (this._content && core_group) {
			const coreObjects = core_group.allCoreObjects();
			for (let core_object of coreObjects) {
				console.log(core_object);
				const human_type = core_object.humanType();
				names_by_type[human_type] = names_by_type[human_type] || [];
				names_by_type[human_type].push(core_object.name());
			}
		}
		return names_by_type;
	}

	pointAttributeNames() {
		let names: string[] = [];
		const geometry = this.firstGeometry();
		if (geometry) {
			names = Object.keys(geometry.attributes);
		}
		return names;
	}
	pointAttributeSizesByName() {
		let sizes_by_name: PolyDictionary<number> = {};
		const geometry = this.firstGeometry();
		if (geometry) {
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				const attrib = geometry.attributes[attrib_name];
				sizes_by_name[attrib_name] = attrib.itemSize;
			});
		}
		return sizes_by_name;
	}

	objectAttributeSizesByName(): PolyDictionary<AttribSize[]> {
		return BaseCoreObject.coreObjectsAttribSizesByName(this._content.allCoreObjects());
		// const _sizesByName: Map<string, Set<AttribSize>> = new Map();
		// const objects = this._content.objects();
		// for (let object of objects) {
		// 	const objectAttriNames = CoreObject.attribNames(object);
		// 	for (let attribName of objectAttriNames) {
		// 		const attribSize = CoreObject.attribSize(object, attribName);
		// 		MapUtils.addToSetAtEntry(_sizesByName, attribName, attribSize);
		// 	}
		// }

		// const sizesByName: PolyDictionary<AttribSize[]> = {};
		// _sizesByName.forEach((attribSizes, attribName) => {
		// 	sizesByName[attribName] = SetUtils.toArray(attribSizes);
		// });
		// return sizesByName;
		// let sizes_by_name: PolyDictionary<number> = {};
		// const core_object = this.firstCoreObject();
		// if (core_object) {
		// 	const attribNames = core_object.attribNames();
		// 	for (let name of attribNames) {
		// 		const size = core_object.attribSize(name);
		// 		if (size != null) {
		// 			sizes_by_name[name] = size;
		// 		}
		// 	}
		// }
		// return sizes_by_name;
	}
	coreGroupAttributeSizesByName() {
		let sizes_by_name: PolyDictionary<number> = {};
		const coreGroup = this._content;
		const attribNames = coreGroup.attribNames();
		for (let name of attribNames) {
			const size = coreGroup.attribSize(name);
			if (size != null) {
				sizes_by_name[name] = size;
			}
		}
		return sizes_by_name;
	}
	pointAttributeTypesByName() {
		let types_by_name: PolyDictionary<AttribType> = {};
		const geometry = this.firstGeometry();
		if (geometry) {
			const core_geo = new CoreGeometry(geometry);
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				types_by_name[attrib_name] = core_geo.attribType(attrib_name);
			});
		}
		return types_by_name;
	}
	objectAttributeTypesByName(): PolyDictionary<AttribType[]> {
		return CoreObject.coreObjectAttributeTypesByName(this._content.allCoreObjects());
		// const _typesByName: Map<string, Set<AttribType>> = new Map();
		// const objects = this._content.objects();
		// for (let object of objects) {
		// 	const objectAttriNames = CoreObject.attribNames(object);
		// 	for (let attribName of objectAttriNames) {
		// 		const attribType = CoreObject.attribType(object, attribName);
		// 		MapUtils.addToSetAtEntry(_typesByName, attribName, attribType);
		// 	}
		// }

		// const typesByName: PolyDictionary<AttribType[]> = {};
		// _typesByName.forEach((attribTypes, attribName) => {
		// 	typesByName[attribName] = SetUtils.toArray(attribTypes);
		// });
		// return typesByName;
		// const core_object = this.firstCoreObject();
		// if (core_object) {
		// 	for (let name of core_object.attribNames()) {
		// 		types_by_name[name] = core_object.attribType(name);
		// 	}
		// }
		// return types_by_name;
	}
	objectAttributeTypeAndSizesByName(): PolyDictionary<Record<AttribType, AttribSize[]>> {
		const _sizesByTypeByName: Map<string, Map<AttribType, Set<AttribSize>>> = new Map();
		const objects = this._content.allObjects();
		for (let object of objects) {
			const objectAttriNames = CoreObject.attribNames(object);
			for (let attribName of objectAttriNames) {
				const attribType = CoreObject.attribType(object, attribName);
				const attribSize = CoreObject.attribSize(object, attribName);
				let mapForName = _sizesByTypeByName.get(attribName);
				if (!mapForName) {
					mapForName = new Map();
				}
				_sizesByTypeByName.set(attribName, mapForName);
				MapUtils.addToSetAtEntry(mapForName, attribType, attribSize);
			}
		}

		const sizesByTypeByName: PolyDictionary<Record<AttribType, AttribSize[]>> = {};
		_sizesByTypeByName.forEach((mapForName, attribName) => {
			// typesByName[attribName] = SetUtils.toArray(attribTypes);
			sizesByTypeByName[attribName] = {[AttribType.NUMERIC]: [], [AttribType.STRING]: []};
			mapForName.forEach((attribSizes, attribType) => {
				sizesByTypeByName[attribName][attribType] = SetUtils.toArray(attribSizes);
			});
		});
		return sizesByTypeByName;
		// const core_object = this.firstCoreObject();
		// if (core_object) {
		// 	for (let name of core_object.attribNames()) {
		// 		types_by_name[name] = core_object.attribType(name);
		// 	}
		// }
		// return types_by_name;
	}
	coreGroupAttributeTypesByName() {
		let types_by_name: PolyDictionary<AttribType> = {};
		const coreGroup = this._content;
		for (let name of coreGroup.attribNames()) {
			types_by_name[name] = coreGroup.attribType(name);
		}
		return types_by_name;
	}
	coreGroupAttributeValuesByName() {
		let valuesByName: PolyDictionary<AttribValue> = {};
		const coreGroup = this._content;
		for (let name of coreGroup.attribNames()) {
			valuesByName[name] = coreGroup.attribValue(name);
		}
		return valuesByName;
	}
	objectAttributeNames() {
		return CoreObject.objectsAttribNames(this._content.allObjects());
	}

	pointsCount(): number {
		if (this._content) {
			return this._content.pointsCount();
		} else {
			return 0;
		}
	}
	totalPointsCount(): number {
		if (this._content) {
			return this._content.totalPointsCount();
		} else {
			return 0;
		}
	}
	objectsData(): Array<ObjectData> {
		if (this._content) {
			return this._content.objectsData();
		} else {
			return [];
		}
	}

	//
	//
	// BBOX
	//
	//
	boundingBox(target: Box3) {
		return this._content.boundingBox(target);
	}
	// center(): Vector3 {
	// 	return this._content.center();
	// }
	// size(): Vector3 {
	// 	return this._content.size();
	// }
}
