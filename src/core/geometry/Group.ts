import {NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
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
import {CoreConstant, AttribClass, AttribSize, ObjectData, objectTypeFromConstructor} from './Constant';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {CoreFace} from './Face';
import {Poly} from '../../engine/Poly';
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
		const performance = Poly.performance.performanceManager();
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
			core_group.setObjects(objects);
		}
		return core_group;
	}
	//
	//
	// OBJECTS
	//
	//
	setObjects(objects: Object3D[]) {
		this._objects = objects;
		this._objects_with_geo = objects.filter((obj) => (obj as Mesh).geometry != null) as Object3DWithGeometry[];
		this.touch();
	}
	objects() {
		return this._objects;
	}
	objectsWithGeo() {
		return this._objects_with_geo;
	}
	coreObjects() {
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
	objectsData(): ObjectData[] {
		if (this._objects) {
			return this._objects.map((object) => this._objectData(object));
		}
		return [];
	}
	private _objectData(object: Object3D): ObjectData {
		let points_count = 0;
		if ((object as Mesh).geometry) {
			points_count = CoreGeometry.pointsCount((object as Mesh).geometry as BufferGeometry);
		}
		return {
			type: objectTypeFromConstructor(object.constructor),
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
		for (let core_object of this.coreObjects()) {
			const geometry = (core_object.object() as Mesh).geometry as BufferGeometry;
			if (geometry) {
				list.push(geometry);
			}
		}
		return list;
	}
	coreGeometries(): CoreGeometry[] {
		return (this._core_geometries = this._core_geometries || this._createCoreGeometries());
	}
	private _createCoreGeometries() {
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
	// __geometry_from_object(list: BufferGeometry[], object: Mesh) {
	// 	if (object.geometry) {
	// 		return list.push(object.geometry as BufferGeometry);
	// 	}
	// }
	// __core_geometry_from_object(list, object){
	// 	const geometry = CoreGroup.geometry_from_object(object)
	// 	if (geometry != null) {
	// 		return list.push(new CoreGeometry(geometry));
	// 	}
	// }
	static geometryFromObject(object: Object3D): BufferGeometry | null {
		if ((object as Mesh).isMesh || (object as LineSegments).isLine || (object as Points).isPoints) {
			return (object as Mesh).geometry as BufferGeometry;
		}
		return null;
	}
	faces() {
		const faces: CoreFace[] = [];
		for (let object of this.objectsWithGeo()) {
			if (object.geometry) {
				const coreGeo = new CoreGeometry(object.geometry);
				const geoFaces = coreGeo.faces();
				for (let geoFace of geoFaces) {
					geoFace.applyMatrix4(object.matrix);
					faces.push(geoFace);
				}
			}
		}
		return faces;
	}
	points() {
		return this.coreGeometries()
			.map((g) => g.points())
			.flat();
	}
	pointsCount() {
		return ArrayUtils.sum(this.coreGeometries().map((g) => g.pointsCount()));
	}
	totalPointsCount() {
		if (this._objects) {
			let sum = 0;
			for (let object of this._objects) {
				object.traverse((object) => {
					const geometry = (object as Mesh).geometry as BufferGeometry;
					if (geometry) {
						sum += CoreGeometry.pointsCount(geometry);
					}
				});
			}
			return sum;
		} else {
			return 0;
		}
	}
	pointsFromGroup(group: GroupString) {
		if (group) {
			const indices = CoreString.indices(group);
			const points = this.points();
			return ArrayUtils.compact(indices.map((i) => points[i]));
		} else {
			return this.points();
		}
	}

	static _fromObjects(objects: Object3D[]): CoreGroup {
		const core_group = new CoreGroup();
		core_group.setObjects(objects);
		return core_group;
	}

	objectsFromGroup(group_name: string): Object3D[] {
		return this.coreObjectsFromGroup(group_name).map((co) => co.object());
	}
	coreObjectsFromGroup(group_name: string): CoreObject[] {
		group_name = group_name.trim();

		if (group_name !== '') {
			const index = parseInt(group_name);
			if (!CoreType.isNaN(index)) {
				return ArrayUtils.compact([this.coreObjects()[index]]);
			} else {
				return this.coreObjects().filter((core_object) => {
					return CoreString.matchMask(group_name, core_object.name());
				});
			}
		} else {
			return this.coreObjects();
		}
	}

	boundingBox(forceUpdate: boolean = false): Box3 {
		if (forceUpdate) {
			return (this._bounding_box = this._computeBoundingBox());
		}
		return (this._bounding_box = this._bounding_box || this._computeBoundingBox());
	}
	// bounding_sphere(): Sphere {
	// 	return (this._bounding_sphere = this._bounding_sphere || this._compute_bounding_sphere());
	// }
	center(): Vector3 {
		const center = new Vector3();
		this.boundingBox().getCenter(center);
		return center;
	}
	size(): Vector3 {
		const size = new Vector3();
		this.boundingBox().getSize(size);
		return size;
	}

	private _computeBoundingBox() {
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
	computeVertexNormals() {
		for (let object of this.coreObjects()) {
			object.computeVertexNormals();
		}
	}

	hasAttrib(name: string) {
		let first_geometry;
		if ((first_geometry = this.coreGeometries()[0]) != null) {
			return first_geometry.hasAttrib(name);
		} else {
			return false;
		}
	}
	attribType(name: string) {
		const first_core_geometry = this.coreGeometries()[0];
		if (first_core_geometry != null) {
			return first_core_geometry.attribType(name);
		} else {
			return null;
		}
	}
	objectAttribType(name: string) {
		const first_core_object = this.coreObjects()[0];
		if (first_core_object != null) {
			return first_core_object.attribType(name);
		} else {
			return null;
		}
	}

	renameAttrib(old_name: string, new_name: string, attrib_class: AttribClass) {
		switch (attrib_class) {
			case CoreConstant.ATTRIB_CLASS.VERTEX:
				if (this.hasAttrib(old_name)) {
					if (this._objects) {
						for (let object of this._objects) {
							object.traverse((child) => {
								const geometry = CoreGroup.geometryFromObject(child);
								if (geometry) {
									const core_geometry = new CoreGeometry(geometry);
									core_geometry.renameAttrib(old_name, new_name);
								}
							});
						}
					}
				}
				break;

			case CoreConstant.ATTRIB_CLASS.OBJECT:
				if (this.hasAttrib(old_name)) {
					if (this._objects) {
						for (let object of this._objects) {
							object.traverse((child) => {
								const core_object = new CoreObject(child, 0);
								core_object.renameAttrib(old_name, new_name);
							});
						}
					}
				}
				break;
		}
	}

	attribNames() {
		let first_geometry;
		if ((first_geometry = this.coreGeometries()[0]) != null) {
			return first_geometry.attribNames();
		} else {
			return [];
		}
	}
	objectAttribNames() {
		let first_object;
		if ((first_object = this.coreObjects()[0]) != null) {
			return first_object.attribNames();
		} else {
			return [];
		}
	}

	attribNamesMatchingMask(masks_string: GroupString) {
		const masks = CoreString.attribNames(masks_string);

		const matching_attrib_names: string[] = [];
		for (let attrib_name of this.attribNames()) {
			for (let mask of masks) {
				if (CoreString.matchMask(attrib_name, mask)) {
					matching_attrib_names.push(attrib_name);
				} else {
					const remapped = CoreAttribute.remapName(mask);
					if (attrib_name == remapped) {
						matching_attrib_names.push(attrib_name);
					}
				}
			}
		}

		return ArrayUtils.uniq(matching_attrib_names);
	}

	attribSizes() {
		let first_geometry;
		if ((first_geometry = this.coreGeometries()[0]) != null) {
			return first_geometry.attribSizes();
		} else {
			return {};
		}
	}
	objectAttribSizes(): PolyDictionary<AttribSize> {
		let first_object;
		if ((first_object = this.coreObjects()[0]) != null) {
			return first_object.attribSizes();
		} else {
			return {};
		}
	}
	attribSize(attrib_name: string) {
		let first_geometry;
		if ((first_geometry = this.coreGeometries()[0]) != null) {
			return first_geometry.attribSize(attrib_name);
		} else {
			return 0;
		}
	}

	addNumericVertexAttrib(name: string, size: number, default_value: NumericAttribValue) {
		if (default_value == null) {
			default_value = CoreAttribute.default_value(size);
		}

		for (let core_geometry of this.coreGeometries()) {
			core_geometry.addNumericAttrib(name, size, default_value);
		}
	}

	// add_numeric_object_attrib(name: string, size: number, default_value: NumericAttribValue) {
	// 	if (default_value == null) {
	// 		default_value = CoreAttribute.default_value(size);
	// 	}

	// 	for (let core_object of this.coreObjects()) {
	// 		core_object.addNumericAttrib(name, default_value);
	// 	}
	// }

	static clone(src_group: Group) {
		const new_group = new Group();

		src_group.children.forEach((src_object) => {
			const new_object = CoreObject.clone(src_object);
			new_group.add(new_object);
		});

		return new_group;
	}
}
