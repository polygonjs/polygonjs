import {Vector3} from 'three';
// import {Object3D} from 'three'
// import {Group} from 'three'
import {Mesh} from 'three';
import {Box3} from 'three';
import {TypedContainer} from './_Base';
import {CoreGroup} from '../../core/geometry/Group';
import {CoreGeometry} from '../../core/geometry/Geometry';
import {BufferGeometry} from 'three';
// import {Object3D} from 'three';
import {ContainableMap} from './utils/ContainableMap';
import {CoreObject} from '../../core/geometry/Object';
import {AttribType, ObjectData} from '../../core/geometry/Constant';
import {NodeContext} from '../poly/NodeContext';
import {PolyDictionary} from '../../types/GlobalTypes';

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

	private firstObject() {
		if (this._content) {
			return this._content.objects()[0];
		}
	}
	private firstCoreObject() {
		const object = this.firstObject();
		if (object) {
			return new CoreObject(object, 0);
		}
	}
	private firstGeometry(): BufferGeometry | null {
		const object = this.firstObject();
		if (object) {
			return (object as Mesh).geometry as BufferGeometry;
		} else {
			return null;
		}
	}

	objectsCount(): number {
		if (this._content) {
			return this._content.objects().length;
		} else {
			return 0;
		}
	}
	objectsVisibleCount(): number {
		let count = 0;
		if (this._content) {
			const objects = this._content.objects();
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
			for (let core_object of core_group.coreObjects()) {
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
			for (let core_object of core_group.coreObjects()) {
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
	objectAttributeSizesByName() {
		let sizes_by_name: PolyDictionary<number> = {};
		const core_object = this.firstCoreObject();
		if (core_object) {
			const attribNames = core_object.attribNames();
			for (let name of attribNames) {
				const size = core_object.attribSize(name);
				if (size != null) {
					sizes_by_name[name] = size;
				}
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
	objectAttributeTypesByName() {
		let types_by_name: PolyDictionary<AttribType> = {};
		const core_object = this.firstCoreObject();
		if (core_object) {
			for (let name of core_object.attribNames()) {
				types_by_name[name] = core_object.attribType(name);
			}
		}
		return types_by_name;
	}
	objectAttributeNames() {
		let names: string[] = [];
		const object = this.firstObject();
		if (object) {
			names = Object.keys(object.userData['attributes'] || {});
		}
		return names;
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
	objectsData(): ObjectData[] {
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
	boundingBox(forceUpdate: boolean = false): Box3 {
		return this._content.boundingBox(forceUpdate);
	}
	center(): Vector3 {
		return this._content.center();
	}
	size(): Vector3 {
		return this._content.size();
	}
}
