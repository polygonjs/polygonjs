import {AttribValue} from './../../types/GlobalTypes';
import {NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Vector3} from 'three';
import {Points} from 'three';
import {Object3D} from 'three';
import {Mesh} from 'three';
import {LineSegments} from 'three';
import {BufferGeometry} from 'three';
import {Box3} from 'three';
import {CoreObject, AttributeDictionary} from './Object';
import {CoreGeometry} from './Geometry';
import {CoreAttribute} from './Attribute';
import {CoreString} from '../String';
import {CoreConstant, AttribClass, AttribSize, ObjectData, objectTypeFromConstructor, AttribType} from './Constant';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {CoreFace} from './Face';
import {Poly} from '../../engine/Poly';
import {CoreEntity} from './Entity';
// import {CoreMask} from './Mask';
export type GroupString = string;

export interface Object3DWithGeometry extends Object3D {
	geometry: BufferGeometry;
}

export class CoreGroup extends CoreEntity {
	// _group: Group
	private _timestamp: number | undefined;
	// _core_objects:
	private _objects: Object3D[] = [];
	private _objectsWithGeo: Object3DWithGeometry[] = [];
	private _coreObjects: CoreObject[] | undefined;

	// _geometries: BufferGeometry[];
	private _coreGeometries: CoreGeometry[] | undefined;

	private _boundingBox: Box3 | undefined;
	// private _bounding_sphere: Sphere | undefined;

	constructor() {
		super(0);
		//_group: Group){
		// this._group = _group;
		this.touch();
	}
	dispose() {
		this._objects = [];
		this._objectsWithGeo = [];
		if (this._coreObjects) {
			for (let coreObject of this._coreObjects) {
				coreObject.dispose();
			}
			this._coreObjects = undefined;
		}
		if (this._coreGeometries) {
			for (let coreGeometry of this._coreGeometries) {
				coreGeometry.dispose();
			}
			this._coreGeometries = undefined;
		}
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
		this.resetBoundingBox();
		// this._bounding_sphere = undefined;
		this._coreGeometries = undefined;
		this._coreObjects = undefined;
	}
	resetBoundingBox() {
		this._boundingBox = undefined;
	}

	//
	//
	// CLONE
	//
	//
	clone() {
		const coreGroup = new CoreGroup();
		if (this._objects) {
			const objects = [];
			for (let object of this._objects) {
				objects.push(CoreObject.clone(object));
			}
			coreGroup.setObjects(objects);
		}

		const attribNames = this.attribNames();
		for (let attribName of attribNames) {
			const value = this.attribValue(attribName);
			coreGroup.addAttribute(attribName, value);
		}

		return coreGroup;
	}
	//
	//
	// OBJECTS
	//
	//
	setObjects(objects: Object3D[]) {
		this._objects = objects;
		this._objectsWithGeo = objects.filter((obj) => (obj as Mesh).geometry != null) as Object3DWithGeometry[];
		this.touch();
	}
	objects() {
		return this._objects;
	}
	objectsWithGeo() {
		return this._objectsWithGeo;
	}
	coreObjects() {
		return (this._coreObjects = this._coreObjects || this._create_core_objects());
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
	objectsData(): Array<ObjectData> {
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
		const objectType = objectTypeFromConstructor(object.constructor);
		return {
			type: objectType,
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
		return (this._coreGeometries = this._coreGeometries || this._createCoreGeometries());
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

	// objectsFromGroup(groupString: string): Object3D[] {
	// 	return this.coreObjectsFromGroup(groupString).map((co) => co.object());
	// }
	// coreObjectsFromGroup(groupString: string): CoreObject[] {
	// 	return CoreMask.coreObjects(groupString, this);
	// }

	boundingBox(forceUpdate: boolean = false): Box3 {
		if (forceUpdate) {
			return (this._boundingBox = this._computeBoundingBox());
		}
		return (this._boundingBox = this._boundingBox || this._computeBoundingBox());
	}
	// bounding_sphere(): Sphere {
	// 	return (this._bounding_sphere = this._bounding_sphere || this._compute_bounding_sphere());
	// }
	private _center = new Vector3();
	private _size = new Vector3();
	center(): Vector3 {
		this.boundingBox().getCenter(this._center);
		return this._center;
	}
	size(): Vector3 {
		this.boundingBox().getSize(this._size);
		return this._size;
	}

	// private _geometriesWithComputedBoundingBox: Set<BufferGeometry> = new Set();
	private _computeBoundingBox() {
		let bbox: Box3 | undefined;
		// this._geometriesWithComputedBoundingBox.clear();
		if (this._objects) {
			// 1. Initialize bbox to the first found object
			for (let object of this._objects) {
				object.traverse((childObject) => {
					if (!bbox) {
						const geometry = (childObject as Object3DWithGeometry).geometry;
						if (geometry) {
							// if we do not set updateParents to true,
							// the bounding box calculation appears fine
							// when checking node by node,
							// but will be unreliable when processing multiple transform nodes before
							// rendering the objects
							childObject.updateWorldMatrix(true, false);
							geometry.computeBoundingBox();
							// this._geometriesWithComputedBoundingBox.add(geometry);
							if (geometry.boundingBox) {
								bbox = geometry.boundingBox.clone();
								bbox.applyMatrix4(childObject.matrixWorld);
							}
							// if (bbox) {
							// 	bbox.expandByObject(object);
							// }
						}
					}
				});
			}

			// 2. Now that it is initialized, we can loop through the object.
			// If we had not initialized it, this would have skipped objects
			// that have no geometry, but have children that do
			if (bbox) {
				for (let object of this._objects) {
					// const geometry = (object as Object3DWithGeometry).geometry;
					// if (geometry) {
					// if (!this._geometriesWithComputedBoundingBox.has(geometry)) {
					// 	geometry.computeBoundingBox();
					// }

					if (bbox) {
						bbox.expandByObject(object);
					}
					// }
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
	geoAttribType(name: string) {
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
	geoAttribNames() {
		const firstGeometry = this.coreGeometries()[0];
		if (firstGeometry) {
			return firstGeometry.attribNames();
		} else {
			return [];
		}
	}
	objectAttribNames() {
		const firstObject = this.coreObjects()[0];
		if (firstObject) {
			return firstObject.attribNames();
		} else {
			return [];
		}
	}

	geoAttribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.geoAttribNames());
	}
	objectAttribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.objectAttribNames());
	}
	attribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.attribNames());
	}

	geoAttribSizes() {
		const firstGeometry = this.coreGeometries()[0];
		if (firstGeometry) {
			return firstGeometry.attribSizes();
		} else {
			return {};
		}
	}
	objectAttribSizes(): PolyDictionary<AttribSize> {
		const firstObject = this.coreObjects()[0];
		if (firstObject) {
			return firstObject.attribSizes();
		} else {
			return {};
		}
	}
	geoAttribSize(attrib_name: string) {
		const firstGeometry = this.coreGeometries()[0];
		if (firstGeometry) {
			return firstGeometry.attribSize(attrib_name);
		} else {
			return 0;
		}
	}

	addGeoNumericVertexAttrib(name: string, size: number, defaultValue: NumericAttribValue) {
		if (defaultValue == null) {
			defaultValue = CoreAttribute.default_value(size);
		}

		for (let coreGeometry of this.coreGeometries()) {
			coreGeometry.addNumericAttrib(name, size, defaultValue);
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

	// static clone(srcGroup: Group) {
	// 	const newGroup = new Group();

	// 	srcGroup.children.forEach((srcGroup) => {
	// 		const new_object = CoreObject.clone(newGroup);
	// 		newGroup.add(new_object);
	// 	});

	// 	const attribNames = srcGroup.attribNames()
	// 	for(let attribName of attribNames)[

	// 	]

	// 	return newGroup;
	// }

	//
	//
	// attributes
	//
	//
	private _attributes: AttributeDictionary = {};
	addAttribute(attribName: string, attribValue: AttribValue) {
		this._attributesDictionary()[attribName] = attribValue;
	}
	deleteAttribute(name: string) {
		delete this._attributesDictionary()[name];
	}
	attribValue(attribName: string) {
		return this._attributes && this._attributes[attribName];
	}
	attribNames(): string[] {
		return this._attributes ? Object.keys(this._attributes) : [];
	}
	attribType(name: string) {
		const val = this.attribValue(name);
		if (CoreType.isString(val)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attribSizes() {
		const h: PolyDictionary<AttribSize> = {};
		for (let attrib_name of this.attribNames()) {
			const size = this.attribSize(attrib_name);
			if (size != null) {
				h[attrib_name] = size;
			}
		}
		return h;
	}
	attribSize(name: string): AttribSize | null {
		const val = this.attribValue(name);
		if (val == null) {
			return null;
		}
		return CoreAttribute.attribSizeFromValue(val);
	}
	private _attributesDictionary() {
		return this._attributes || this._createAttributesDictionaryIfNone();
	}
	private _createAttributesDictionaryIfNone() {
		if (!this._attributes) {
			this._attributes = {};
		}
		return this._attributes;
	}
	// override
	setAttribValue(attribName: string, attribValue: NumericAttribValue | string) {
		this.addAttribute(attribName, attribValue);
	}

	stringAttribValue(attribName: string) {
		return this.attribValue(attribName) as string | undefined;
	}
}
