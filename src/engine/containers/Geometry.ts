import {Vector3} from 'three/src/math/Vector3';
// import {Object3D} from 'three/src/core/Object3D'
// import {Group} from 'three/src/objects/Group'
import {Mesh} from 'three/src/objects/Mesh';
import {Box3} from 'three/src/math/Box3';
import {TypedContainer} from './_Base';
import {CoreGroup} from '../../core/geometry/Group';
import {CoreGeometry} from '../../core/geometry/Geometry';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
// import {Object3D} from 'three/src/core/Object3D';
import {ContainableMap} from './utils/ContainableMap';
import {CoreObject} from '../../core/geometry/Object';
import {AttribType, ObjectData} from '../../core/geometry/Constant';
import {NodeContext} from '../poly/NodeContext';

export class GeometryContainer extends TypedContainer<NodeContext.SOP> {
	// set_objects(objects: Object3D[]) {}

	coreContentCloned(): CoreGroup | undefined {
		if (this._content) {
			return this._content.clone();
		}
	}

	set_content(content: ContainableMap[NodeContext.SOP]) {
		super.set_content(content);
	}

	private first_object() {
		if (this._content) {
			return this._content.objects()[0];
		}
	}
	private first_core_object() {
		const object = this.first_object();
		if (object) {
			return new CoreObject(object, 0);
		}
	}
	private first_geometry(): BufferGeometry | null {
		const object = this.first_object();
		if (object) {
			return (object as Mesh).geometry as BufferGeometry;
		} else {
			return null;
		}
	}

	objects_count(): number {
		if (this._content) {
			return this._content.objects().length;
		} else {
			return 0;
		}
	}
	objects_visible_count(): number {
		let count = 0;
		if (this._content) {
		}
		return count;
	}
	objects_count_by_type() {
		const count_by_type: Dictionary<number> = {};
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
	objects_names_by_type() {
		const names_by_type: Dictionary<string[]> = {};
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

	point_attribute_names() {
		let names: string[] = [];
		const geometry = this.first_geometry();
		if (geometry) {
			names = Object.keys(geometry.attributes);
		}
		return names;
	}
	point_attribute_sizes_by_name() {
		let sizes_by_name: Dictionary<number> = {};
		const geometry = this.first_geometry();
		if (geometry) {
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				const attrib = geometry.attributes[attrib_name];
				sizes_by_name[attrib_name] = attrib.itemSize;
			});
		}
		return sizes_by_name;
	}
	object_attribute_sizes_by_name() {
		let sizes_by_name: Dictionary<number> = {};
		const core_object = this.first_core_object();
		if (core_object) {
			for (let name of core_object.attribNames()) {
				const size = core_object.attribSize(name);
				if (size != null) {
					sizes_by_name[name] = size;
				}
			}
		}
		return sizes_by_name;
	}
	point_attribute_types_by_name() {
		let types_by_name: Dictionary<AttribType> = {};
		const geometry = this.first_geometry();
		if (geometry) {
			const core_geo = new CoreGeometry(geometry);
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				types_by_name[attrib_name] = core_geo.attribType(attrib_name);
			});
		}
		return types_by_name;
	}
	object_attribute_types_by_name() {
		let types_by_name: Dictionary<AttribType> = {};
		const core_object = this.first_core_object();
		if (core_object) {
			for (let name of core_object.attribNames()) {
				types_by_name[name] = core_object.attribType(name);
			}
		}
		return types_by_name;
	}
	object_attribute_names() {
		let names: string[] = [];
		const object = this.first_object();
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
	boundingBox(): Box3 {
		return this._content.boundingBox();
	}
	center(): Vector3 {
		return this._content.center();
	}
	size(): Vector3 {
		return this._content.size();
	}
}
