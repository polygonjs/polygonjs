import lodash_uniq from 'lodash/uniq';
import lodash_compact from 'lodash/compact';
import lodash_flatten from 'lodash/flatten';
import {Vector3} from 'three/src/math/Vector3';
import {Points} from 'three/src/objects/Points';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Group} from 'three/src/objects/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Box3} from 'three/src/math/Box3';
import {CoreObject} from './Object';
import {CoreGeometry} from './Geometry';
import {CoreAttribute} from './Attribute';
import {CoreString} from '../String';
import {CoreConstant, AttribClass, AttribSize, ObjectData, object_type_from_constructor} from './Constant';
import { CoreType } from '../Type';
import { ArrayUtils } from '../ArrayUtils';
export type GroupString = string;

export interface Object3DWithGeometry extends Object3D {
	geometry: BufferGeometry;
}

export class CoreGroup {
	// _group: Group
	private _timestamp: number | undefined;
	// _core_objects:
	private _objects: Object3D[] = [];
	private _objects_with_geo: Object3DWithGeometry[] = [];
	private _core_objects: CoreObject[] | undefined;

	// _geometries: BufferGeometry[];
	private _core_geometries: CoreGeometry[] | undefined;

	private _bounding_box: Box3 | undefined;
	// private _bounding_sphere: Sphere | undefined;

	constructor() {
		//_group: Group){
		// this._group = _group;
		this.touch();
	}

	//
	//
	// TIMESTAMP
	//
	//
	timestamp() {
		return this._timestamp;
	}
	touch() {
		this._timestamp = performance.now();
		this.reset();
	}
	reset() {
		this._bounding_box = undefined;
		// this._bounding_sphere = undefined;
		this._core_geometries = undefined;
		this._core_objects = undefined;
	}

	//
	//
	// CLONE
	//
	//
	clone() {
		const core_group = new CoreGroup();
		if (this._objects) {
			const objects = [];
			for (let object of this._objects) {
				objects.push(CoreObject.clone(object));
			}
			core_group.set_objects(objects);
		}
		return core_group;
	}
	//
	//
	// OBJECTS
	//
	//
	set_objects(objects: Object3D[]) {
		this._objects = objects;
		this._objects_with_geo = objects.filter((obj) => (obj as Mesh).geometry != null) as Object3DWithGeometry[];
		this.touch();
	}
	objects() {
		return this._objects;
	}
	objects_with_geo() {
		return this._objects_with_geo;
	}
	core_objects() {
		return (this._core_objects = this._core_objects || this._create_core_objects());
	}
	private _create_core_objects(): CoreObject[] {
		// const list: CoreObject[] = [];
		// if (this._objects) {
		// 	for (let i = 0; i < this._objects.length; i++) {
		// 		this._objects[i].traverse((object) => {
		// 			const core_object = new CoreObject(object, i);
		// 			list.push(core_object);
		// 		});
		// 	}
		// }
		if (this._objects) {
			return this._objects.map((object, i) => new CoreObject(object, i));
		}
		return [];
		// return list;
	}
	objects_data(): ObjectData[] {
		if (this._objects) {
			return this._objects.map((object) => this._object_data(object));
		}
		return [];
	}
	private _object_data(object: Object3D): ObjectData {
		let points_count = 0;
		if ((object as Mesh).geometry) {
			points_count = CoreGeometry.points_count((object as Mesh).geometry as BufferGeometry);
		}
		return {
			type: object_type_from_constructor(object.constructor),
			name: object.name,
			children_count: object.children.length,
			points_count: points_count,
		};
	}

	// group() {
	// 	return this._group;
	// }
	// uuid() {
	// 	return this._group.uuid;
	// }

	geometries(): BufferGeometry[] {
		// this._geometries = [];
		// for (let object of this._objects) {
		// 	object.traverse((object) => this.__geometry_from_object.bind(this)(this._geometries, object));
		// 	// 	const geometry = this.geometry_from_object(object)
		// 	// 	if (geometry != null) {
		// 	// 		return list.push(new CoreGeometry(geometry));
		// 	// 	}
		// 	// });
		// }
		// return this._geometries;
		const list: BufferGeometry[] = [];
		for (let core_object of this.core_objects()) {
			const geometry = (core_object.object() as Mesh).geometry as BufferGeometry;
			if (geometry) {
				list.push(geometry);
			}
		}
		return list;
	}
	core_geometries(): CoreGeometry[] {
		return (this._core_geometries = this._core_geometries || this.create_core_geometries());
	}
	private create_core_geometries() {
		const list: CoreGeometry[] = [];
		for (let geometry of this.geometries()) {
			list.push(new CoreGeometry(geometry));
			// object.traverse(object=> this.__core_geometry_from_object.bind(this)(this._core_geometries, object))
			// 	const geometry = this.geometry_from_object(object)
			// 	if (geometry != null) {
			// 		return list.push(new CoreGeometry(geometry));
			// 	}
			// });
		}
		return list;
	}
	__geometry_from_object(list: BufferGeometry[], object: Mesh) {
		if (object.geometry) {
			return list.push(object.geometry as BufferGeometry);
		}
	}
	// __core_geometry_from_object(list, object){
	// 	const geometry = CoreGroup.geometry_from_object(object)
	// 	if (geometry != null) {
	// 		return list.push(new CoreGeometry(geometry));
	// 	}
	// }
	static geometry_from_object(object: Object3D): BufferGeometry | null {
		if ((object as Mesh).isMesh || (object as LineSegments).isLine || (object as Points).isPoints) {
			return (object as Mesh).geometry as BufferGeometry;
		}
		return null;
	}
	faces() {
		return lodash_flatten(this.core_geometries().map((g) => g.faces()));
	}
	points() {
		return lodash_flatten(this.core_geometries().map((g) => g.points()));
	}
	points_count() {
		return ArrayUtils.sum(this.core_geometries().map((g) => g.points_count()));
	}
	total_points_count() {
		if (this._objects) {
			let sum = 0;
			for (let object of this._objects) {
				object.traverse((object) => {
					const geometry = (object as Mesh).geometry as BufferGeometry;
					if (geometry) {
						sum += CoreGeometry.points_count(geometry);
					}
				});
			}
			return sum;
		} else {
			return 0;
		}
	}
	points_from_group(group: GroupString) {
		if (group) {
			const indices = CoreString.indices(group);
			const points = this.points();
			return lodash_compact(indices.map((i) => points[i]));
		} else {
			return this.points();
		}
	}

	static from_objects(objects: Object3D[]): CoreGroup {
		const core_group = new CoreGroup();
		core_group.set_objects(objects);
		return core_group;
	}

	// objects() {
	// 	return this._objects = lodash_map(this._group.children, (object, i)=> {
	// 		const object_wrapper = new CoreObject(object);
	// 		object_wrapper.set_index(i);
	// 		return object_wrapper;
	// 	});
	// }
	objects_from_group(group_name: string): Object3D[] {
		return this.core_objects_from_group(group_name).map((co) => co.object());
	}
	core_objects_from_group(group_name: string): CoreObject[] {
		group_name = group_name.trim();

		if (group_name !== '') {
			const index = parseInt(group_name);
			if (!CoreType.isNaN(index)) {
				return lodash_compact([this.core_objects()[index]]);
			} else {
				return this.core_objects().filter((core_object) => {
					return CoreString.match_mask(group_name, core_object.name());
				});
			}
		} else {
			return this.core_objects();
		}
	}

	bounding_box(): Box3 {
		return (this._bounding_box = this._bounding_box || this._compute_bounding_box());
	}
	// bounding_sphere(): Sphere {
	// 	return (this._bounding_sphere = this._bounding_sphere || this._compute_bounding_sphere());
	// }
	center(): Vector3 {
		const center = new Vector3();
		this.bounding_box().getCenter(center);
		return center;
	}
	size(): Vector3 {
		const size = new Vector3();
		this.bounding_box().getSize(size);
		return size;
	}

	private _compute_bounding_box() {
		let bbox: Box3 | undefined; // = new Box3();
		if (this._objects) {
			for (let object of this._objects) {
				const geometry = (object as Object3DWithGeometry).geometry;
				if (geometry) {
					geometry.computeBoundingBox();
					if (bbox) {
						bbox.expandByObject(object);
					} else {
						if (geometry.boundingBox) {
							bbox = geometry.boundingBox.clone();
						}
					}
				}
			}
		}
		bbox = bbox || new Box3(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));
		return bbox;
	}
	// private _compute_bounding_sphere() {
	// 	let sphere: Sphere | undefined; // = new Box3();
	// 	if (this._objects) {
	// 		for (let object of this._objects) {
	// 			const geometry = (object as Object3DWithGeometry).geometry;
	// 			geometry.computeBoundingSphere();
	// 			if (sphere) {
	// 				sphere.expandByObject(object);
	// 			} else {
	// 				sphere = geometry.boundingBox.clone();
	// 			}
	// 		}
	// 	}
	// 	sphere = sphere || new Sphere(new Vector3(0, 0, 0), 1);
	// 	return sphere;
	// }
	compute_vertex_normals() {
		for (let object of this.core_objects()) {
			object.compute_vertex_normals();
		}
	}

	has_attrib(name: string) {
		let first_geometry;
		if ((first_geometry = this.core_geometries()[0]) != null) {
			return first_geometry.has_attrib(name);
		} else {
			return false;
		}
	}
	attrib_type(name: string) {
		const first_core_geometry = this.core_geometries()[0];
		if (first_core_geometry != null) {
			return first_core_geometry.attrib_type(name);
		} else {
			return null;
		}
	}
	object_attrib_type(name: string) {
		const first_core_object = this.core_objects()[0];
		if (first_core_object != null) {
			return first_core_object.attrib_type(name);
		} else {
			return null;
		}
	}

	rename_attrib(old_name: string, new_name: string, attrib_class: AttribClass) {
		switch (attrib_class) {
			case CoreConstant.ATTRIB_CLASS.VERTEX:
				if (this.has_attrib(old_name)) {
					if (this._objects) {
						for (let object of this._objects) {
							object.traverse((child) => {
								const geometry = CoreGroup.geometry_from_object(child);
								if (geometry) {
									const core_geometry = new CoreGeometry(geometry);
									core_geometry.rename_attribute(old_name, new_name);
								}
							});
						}
					}
				}
				break;

			case CoreConstant.ATTRIB_CLASS.OBJECT:
				if (this.has_attrib(old_name)) {
					if (this._objects) {
						for (let object of this._objects) {
							object.traverse((child) => {
								const core_object = new CoreObject(child, 0);
								core_object.rename_attribute(old_name, new_name);
							});
						}
					}
				}
				break;
		}
	}

	attrib_names() {
		let first_geometry;
		if ((first_geometry = this.core_geometries()[0]) != null) {
			return first_geometry.attrib_names();
		} else {
			return [];
		}
	}
	object_attrib_names() {
		let first_object;
		if ((first_object = this.core_objects()[0]) != null) {
			return first_object.attrib_names();
		} else {
			return [];
		}
	}

	attrib_names_matching_mask(masks_string: GroupString) {
		const masks = CoreString.attrib_names(masks_string);

		const matching_attrib_names = [];
		for (let attrib_name of this.attrib_names()) {
			for (let mask of masks) {
				if (CoreString.match_mask(attrib_name, mask)) {
					matching_attrib_names.push(attrib_name);
				}
			}
		}

		return lodash_uniq(matching_attrib_names);
	}

	attrib_sizes() {
		let first_geometry;
		if ((first_geometry = this.core_geometries()[0]) != null) {
			return first_geometry.attrib_sizes();
		} else {
			return {};
		}
	}
	object_attrib_sizes(): Dictionary<AttribSize> {
		let first_object;
		if ((first_object = this.core_objects()[0]) != null) {
			return first_object.attrib_sizes();
		} else {
			return {};
		}
	}
	attrib_size(attrib_name: string) {
		let first_geometry;
		if ((first_geometry = this.core_geometries()[0]) != null) {
			return first_geometry.attrib_size(attrib_name);
		} else {
			return 0;
		}
	}

	add_numeric_vertex_attrib(name: string, size: number, default_value: NumericAttribValue) {
		if (default_value == null) {
			default_value = CoreAttribute.default_value(size);
		}

		for (let core_geometry of this.core_geometries()) {
			core_geometry.add_numeric_attrib(name, size, default_value);
		}
	}

	add_numeric_object_attrib(name: string, size: number, default_value: NumericAttribValue) {
		if (default_value == null) {
			default_value = CoreAttribute.default_value(size);
		}

		for (let core_object of this.core_objects()) {
			core_object.add_numeric_attrib(name, default_value);
		}
	}

	static clone(src_group: Group) {
		const new_group = new Group();

		src_group.children.forEach((src_object) => {
			const new_object = CoreObject.clone(src_object);
			new_group.add(new_object);
		});

		return new_group;
	}
}
