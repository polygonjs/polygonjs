import lodash_uniq from 'lodash/uniq';
import lodash_compact from 'lodash/compact';
import lodash_isNaN from 'lodash/isNaN';
import lodash_trim from 'lodash/trim';
import lodash_flatten from 'lodash/flatten';
import {Vector3} from 'three/src/math/Vector3';
import {Points} from 'three/src/objects/Points';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Group} from 'three/src/objects/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Box3} from 'three/src/math/Box3';
// const THREE = {Box3, BufferGeometry, Group, LineSegments, Mesh, Object3D, Points, Vector3}
import {CoreObject} from './Object';
import {CoreGeometry} from './Geometry';
import {CoreAttribute} from './Attribute';
// import {Core} from 'src/core/_Module'
import {CoreString} from 'src/core/String';
import {CoreConstant, AttribClass} from './Constant';

// import './MonkeyPatch'

export type GroupString = string;

export class CoreGroup {
	// _group: Group
	_timestamp: number;
	// _core_objects:
	_objects: Object3D[];
	_core_objects: CoreObject[];

	_geometries: BufferGeometry[];
	_core_geometries: CoreGeometry[];

	_bounding_box: Box3;

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
	}

	//
	//
	// CLONE
	//
	//
	clone() {
		const core_group = new CoreGroup();
		const objects = [];
		for (let object of this._objects) {
			objects.push(CoreObject.clone(object));
		}
		core_group.set_objects(objects);
		return core_group;
	}
	//
	//
	// OBJECTS
	//
	//
	set_objects(objects: Object3D[]) {
		this._objects = objects;
	}
	objects() {
		return this._objects;
	}
	core_objects() {
		return (this._core_objects = this._core_objects || this._create_core_objects());
	}
	private _create_core_objects(): CoreObject[] {
		const list: CoreObject[] = [];
		let object, core_object;
		for (let i = 0; i < this._objects.length; i++) {
			object = this._objects[i];
			core_object = new CoreObject(object);
			core_object.set_index(i);
			list.push(core_object);
		}
		return list;
	}

	// group() {
	// 	return this._group;
	// }
	// uuid() {
	// 	return this._group.uuid;
	// }

	geometries() {
		this._geometries = [];
		for (let object of this._objects) {
			object.traverse((object) => this.__geometry_from_object.bind(this)(this._geometries, object));
			// 	const geometry = this.geometry_from_object(object)
			// 	if (geometry != null) {
			// 		return list.push(new CoreGeometry(geometry));
			// 	}
			// });
		}
		return this._geometries;
	}
	core_geometries(): CoreGeometry[] {
		this._core_geometries = [];
		for (let geometry of this.geometries()) {
			this._core_geometries.push(new CoreGeometry(geometry));
			// object.traverse(object=> this.__core_geometry_from_object.bind(this)(this._core_geometries, object))
			// 	const geometry = this.geometry_from_object(object)
			// 	if (geometry != null) {
			// 		return list.push(new CoreGeometry(geometry));
			// 	}
			// });
		}
		return this._core_geometries;
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
	points_from_group(group: GroupString) {
		if (group) {
			const indices = CoreString.indices(group);
			if (indices) {
				const points = this.points();
				return indices.map((i) => points[i]);
			}
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
		group_name = lodash_trim(group_name);

		if (group_name !== '') {
			const index = parseInt(group_name);
			if (!lodash_isNaN(index)) {
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

	// reset: ->
	// 	@_geometries = []
	// 	@_points = []

	// _find_geometries: ->
	// 	list = []
	// 	@_group.traverse (object)=>
	// 		if (geometry = object.geometry)?
	// 			list.push new Geometry(geometry)
	// 	list

	// _find_points: ->
	// 	lodash_flatten( lodash_map(this.objects(), (g)->g.points()) )

	// bounding_box() {
	// 	return new Box3().setFromObject(this._group);
	// }
	bounding_box(): Box3 {
		return (this._bounding_box = this._bounding_box || this._compute_bounding_box());
	}
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
		const bbox = new Box3();
		for (let object of this._objects) {
			bbox.expandByObject(object);
		}
		return bbox;
	}
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
		const first_geometry = this.core_geometries()[0];
		if (first_geometry != null) {
			return first_geometry.attrib_type(name);
		} else {
			return null;
		}
	}

	rename_attrib(old_name: string, new_name: string, attrib_class: AttribClass) {
		switch (attrib_class) {
			case CoreConstant.ATTRIB_CLASS.VERTEX:
				if (this.has_attrib(old_name)) {
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
				break;

			case CoreConstant.ATTRIB_CLASS.OBJECT:
				if (this.has_attrib(old_name)) {
					for (let object of this._objects) {
						object.traverse((child) => {
							const core_object = new CoreObject(child);
							core_object.rename_attribute(old_name, new_name);
						});
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
