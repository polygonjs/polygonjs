import {AttribValue} from './../../types/GlobalTypes';
import {NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Box3, BufferGeometry, LineSegments, Mesh, Points, Object3D} from 'three';
import {BaseCoreObject} from './_BaseObject';
import {CoreObject, AttributeDictionary} from './Object';
import {CoreGeometry} from './Geometry';
import {CoreAttribute} from './Attribute';
import {CoreString} from '../String';
import {AttribClass, AttribSize, ObjectData, objectTypeFromConstructor, AttribType, ObjectType} from './Constant';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {CoreFace} from './Face';
import {Poly} from '../../engine/Poly';
import {CoreEntity} from './Entity';
import {CoreObjectType, ObjectContent, isObject3D} from './ObjectContent';
// import {computeBoundingBoxFromObject3Ds} from './BoundingBox';
import {coreObjectInstanceFactory} from './CoreObjectFactory';

// CAD
import type {CadGeometryType, CadGeometryTypeShape} from './cad/CadCommon';
import {CAD_GEOMETRY_TYPES_SET} from './cad/CadCommon';
import type {CadObject} from './cad/CadObject';
import {CoreCadType} from './cad/CadCoreType';
//

// import {CoreMask} from './Mask';
export type GroupString = string;
const tmpBox3 = new Box3();

export interface Object3DWithGeometry extends Object3D {
	geometry: BufferGeometry;
}

function objectData<T extends CoreObjectType>(object: ObjectContent<T>): ObjectData {
	const pointsCount: number =
		isObject3D(object) && (object as Mesh).geometry
			? CoreGeometry.pointsCount((object as Mesh).geometry as BufferGeometry)
			: 0;
	const childrenCount = isObject3D(object) ? object.children.length : 0;
	// if ((object as Mesh).geometry) {
	// 	points_count = CoreGeometry.pointsCount((object as Mesh).geometry as BufferGeometry);
	// }
	const objectType = isObject3D(object) ? objectTypeFromConstructor(object.constructor) : (object.type as ObjectType);
	return {
		type: objectType,
		name: object.name,
		childrenCount,
		pointsCount,
	};
}
function objectTotalPointsCount(object: Object3D) {
	let sum = 0;
	object.traverse((child) => {
		const geometry = (child as Mesh).geometry as BufferGeometry;
		if (geometry) {
			sum += CoreGeometry.pointsCount(geometry);
		}
	});
	return sum;
}

export class CoreGroup extends CoreEntity {
	// _group: Group
	private _timestamp: number | undefined; // _core_objects:

	// all
	private _allObjects: ObjectContent<CoreObjectType>[] = [];
	// private _allCoreObjects: BaseCoreObject<CoreObjectType>[] | undefined;
	// cad
	// private _cadObjects: CadObject<CadGeometryType>[] | undefined;
	// private _cadCoreObjects: CadCoreObject<CadGeometryType>[] | undefined;
	// object3D
	// private _objects: Object3D[] = [];
	// private _objectsWithGeo: Object3DWithGeometry[] = [];
	// private _coreObjects: CoreObject[] | undefined;

	// _geometries: BufferGeometry[];
	// private _coreGeometries: CoreGeometry[] | undefined;

	// private _boundingBox: Box3 | undefined;
	// private _bounding_sphere: Sphere | undefined;

	constructor() {
		super(0);
		//_group: Group){
		// this._group = _group;
		this.touch();
	}
	dispose() {
		// all
		if (this._allObjects) {
			for (let object of this._allObjects) {
				if (object.dispose) {
					object.dispose();
				}
			}
		}
		this._allObjects.length = 0;
		// this._allCoreObjects = undefined;

		// cad
		// this._cadObjects = undefined;
		// if (this._cadCoreObjects) {
		// 	for (let coreObject of this._cadCoreObjects) {
		// 		coreObject.dispose();
		// 	}
		// 	this._cadCoreObjects = undefined;
		// }

		// object3D
		// this._objects = [];
		// this._objectsWithGeo = [];
		// if (this._coreObjects) {
		// 	for (let coreObject of this._coreObjects) {
		// 		coreObject.dispose();
		// 	}
		// 	this._coreObjects = undefined;
		// }
		// if (this._coreGeometries) {
		// 	for (let coreGeometry of this._coreGeometries) {
		// 		coreGeometry.dispose();
		// 	}
		// 	this._coreGeometries = undefined;
		// }
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
		// this.reset();
	}
	// reset() {
	// 	// this.resetBoundingBox();
	// 	// this._bounding_sphere = undefined;
	// 	// this._coreGeometries = undefined;
	// 	// this._coreObjects = undefined;
	// }
	resetBoundingBox() {
		// this._boundingBox = undefined;
	}

	//
	//
	// CLONE
	//
	//
	clone() {
		const coreGroup = new CoreGroup();
		// all
		if (this._allObjects) {
			const clonedObjects: ObjectContent<CoreObjectType>[] = this.allCoreObjects().map((o) => {
				return o.clone().object();
			});
			// for (let object of this._allObjects) {
			// 	allObjects.push(object.clone());
			// }

			coreGroup.setAllObjects(clonedObjects);
		}
		// cad
		// if (this._cadObjects) {
		// 	const cadObjects: CadObject<CadGeometryType>[] = [];
		// 	for (let object of this._cadObjects) {
		// 		cadObjects.push(object.clone());
		// 	}
		// 	coreGroup.setCadObjects(cadObjects);
		// }
		// object3d
		// if (this._objects) {
		// 	const objects: Object3D[] = [];
		// 	for (let object of this._objects) {
		// 		objects.push(CoreObject.clone(object));
		// 	}
		// 	coreGroup.setObjects(objects);
		// }

		const attribNames = this.attribNames();
		for (let attribName of attribNames) {
			const value = this.attribValue(attribName);
			coreGroup.addAttribute(attribName, value);
		}

		return coreGroup;
	}
	//
	//
	// ALL OBJECTS
	//
	//
	setAllObjects(objects: ObjectContent<CoreObjectType>[]) {
		this._allObjects = objects;
		this.touch();
	}
	allObjects() {
		return this._allObjects;
		// return (this._allObjects =
		// 	this._allObjects ||
		// 	(() => {
		// 		const cadObjects = this._cadObjects;
		// 		if (cadObjects) {
		// 			return (this._objects as ObjectContent<CoreObjectType>[]).concat(cadObjects);
		// 		} else {
		// 			return this._objects;
		// 		}
		// 	})());
	}
	allCoreObjects() {
		return this.allObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
		// return (this._allCoreObjects =
		// 	this._allCoreObjects || this.allObjects().map((o, i) => new BaseCoreObject(o, i)));
	}
	//
	//
	// CAD OBJECTS
	//
	//
	// setCadObjects(cadObjects: CadObject<CadGeometryType>[]) {
	// 	this._cadObjects = cadObjects;
	// 	this.touch();
	// }
	cadObjects() {
		const list =
			this._allObjects?.filter((o) => CAD_GEOMETRY_TYPES_SET.has(o.type as CadGeometryType)) || undefined;
		return list as CadObject<CadGeometryType>[] | undefined;
	}
	cadObjectsWithShape() {
		return this.cadObjects()?.filter((o) => CoreCadType.isShape(o)) as
			| CadObject<CadGeometryTypeShape>[]
			| undefined;
		// if (this._cadObjects) {
		// 	return this._cadObjects.filter((o) => CoreCadType.isShape(o)) as CadObject<CadGeometryTypeShape>[];
		// }
	}
	cadCoreObjects() {
		return this.cadObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
		// if (this._cadObjects) {
		// 	return this._cadObjects.map((object, i) => new CadCoreObject(object, i));
		// }
	}

	//
	//
	// OBJECTS
	//
	//
	// setObjects(objects: Object3D[]) {
	// 	this._objects = objects;
	// 	this._objectsWithGeo = objects.filter((obj) => (obj as Mesh).geometry != null) as Object3DWithGeometry[];
	// 	this.touch();
	// }
	threejsObjects(): Object3D[] {
		return this._allObjects ? this._allObjects.filter(isObject3D) : [];
		// if( this._allObjects){
		// 	const list = this._allObjects.filter(isObjec3D)
		// 	return list as any as Object3D[]
		// }
		// return []
	}
	threejsObjectsWithGeo() {
		return this.threejsObjects().filter((o) => (o as Mesh).geometry != null) as Object3DWithGeometry[];
	}
	threejsCoreObjects() {
		return this.threejsObjects().map((o, i) => new CoreObject(o, i));
		// return (this._coreObjects = this._coreObjects || this._create_core_objects());
	}
	// private _create_core_objects(): CoreObject[] {
	// 	// const list: CoreObject[] = [];
	// 	// if (this._objects) {
	// 	// 	for (let i = 0; i < this._objects.length; i++) {
	// 	// 		this._objects[i].traverse((object) => {
	// 	// 			const core_object = new CoreObject(object, i);
	// 	// 			list.push(core_object);
	// 	// 		});
	// 	// 	}
	// 	// }
	// 	if (this._objects) {
	// 		return this._objects.map((object, i) => new CoreObject(object, i));
	// 	}
	// 	return [];
	// 	// return list;
	// }
	objectsData(): ObjectData[] {
		return this._allObjects?.map(objectData) || [];
	}

	// group() {
	// 	return this._group;
	// }
	// uuid() {
	// 	return this._group.uuid;
	// }

	geometries(): BufferGeometry[] {
		return this.threejsObjectsWithGeo().map((o) => o.geometry);
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
		// const list: BufferGeometry[] = [];
		// for (let core_object of this.coreObjects()) {
		// 	const geometry = (core_object.object() as Mesh).geometry as BufferGeometry;
		// 	if (geometry) {
		// 		list.push(geometry);
		// 	}
		// }
		// return list;
	}
	coreGeometries(): CoreGeometry[] {
		return this.geometries().map((g) => new CoreGeometry(g));
		// return (this._coreGeometries = this._coreGeometries || this._createCoreGeometries());
	}
	// private _createCoreGeometries() {
	// 	const list: CoreGeometry[] = [];
	// 	for (let geometry of this.geometries()) {
	// 		list.push(new CoreGeometry(geometry));
	// 		// object.traverse(object=> this.__core_geometry_from_object.bind(this)(this._core_geometries, object))
	// 		// 	const geometry = this.geometry_from_object(object)
	// 		// 	if (geometry != null) {
	// 		// 		return list.push(new CoreGeometry(geometry));
	// 		// 	}
	// 		// });
	// 	}
	// 	return list;
	// }
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
		for (let object of this.threejsObjectsWithGeo()) {
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
		const threejsObjects = this.threejsObjects();
		let sum = 0;
		for (let object of threejsObjects) {
			sum += objectTotalPointsCount(object);
		}
		return sum;
		// if (this._objects) {
		// 	let sum = 0;
		// 	for (let object of this._objects) {
		// 		object.traverse((object) => {
		// 			const geometry = (object as Mesh).geometry as BufferGeometry;
		// 			if (geometry) {
		// 				sum += CoreGeometry.pointsCount(geometry);
		// 			}
		// 		});
		// 	}
		// 	return sum;
		// } else {
		// 	return 0;
		// }
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
		const coreGroup = new CoreGroup();
		coreGroup.setAllObjects(objects);
		return coreGroup;
	}

	// objectsFromGroup(groupString: string): Object3D[] {
	// 	return this.coreObjectsFromGroup(groupString).map((co) => co.object());
	// }
	// coreObjectsFromGroup(groupString: string): CoreObject[] {
	// 	return CoreMask.coreObjects(groupString, this);
	// }

	boundingBox(target: Box3) {
		target.makeEmpty();
		const coreObjects = this.allCoreObjects();
		for (let coreObject of coreObjects) {
			coreObject.boundingBox(tmpBox3);
			target.union(tmpBox3);
		}

		// if (forceUpdate) {
		// 	return (this._boundingBox = this._computeBoundingBox());
		// }
		// return (this._boundingBox = this._boundingBox || this._computeBoundingBox());
	}
	// bounding_sphere(): Sphere {
	// 	return (this._bounding_sphere = this._bounding_sphere || this._compute_bounding_sphere());
	// }
	// private _center = new Vector3();
	// private _size = new Vector3();
	// center(): Vector3 {
	// 	this.boundingBox().getCenter(this._center);
	// 	return this._center;
	// }
	// size(): Vector3 {
	// 	this.boundingBox().getSize(this._size);
	// 	return this._size;
	// }

	// private _geometriesWithComputedBoundingBox: Set<BufferGeometry> = new Set();
	// private _computeBoundingBox() {
	// 	const bbox = computeBoundingBoxFromObject3Ds(this.threejsObjects());
	// 	return bbox;
	// 	// let bbox: Box3 | undefined;
	// 	// // this._geometriesWithComputedBoundingBox.clear();
	// 	// if (this._objects) {
	// 	// 	// 1. Initialize bbox to the first found object
	// 	// 	for (let object of this._objects) {
	// 	// 		object.traverse((childObject) => {
	// 	// 			if (!bbox) {
	// 	// 				const geometry = (childObject as Object3DWithGeometry).geometry;
	// 	// 				if (geometry) {
	// 	// 					// if we do not set updateParents to true,
	// 	// 					// the bounding box calculation appears fine
	// 	// 					// when checking node by node,
	// 	// 					// but will be unreliable when processing multiple transform nodes before
	// 	// 					// rendering the objects
	// 	// 					childObject.updateWorldMatrix(true, false);
	// 	// 					geometry.computeBoundingBox();
	// 	// 					// this._geometriesWithComputedBoundingBox.add(geometry);
	// 	// 					if (geometry.boundingBox) {
	// 	// 						bbox = geometry.boundingBox.clone();
	// 	// 						bbox.applyMatrix4(childObject.matrixWorld);
	// 	// 					}
	// 	// 					// if (bbox) {
	// 	// 					// 	bbox.expandByObject(object);
	// 	// 					// }
	// 	// 				}
	// 	// 			}
	// 	// 		});
	// 	// 	}

	// 	// 	// 2. Now that it is initialized, we can loop through the object.
	// 	// 	// If we had not initialized it, this would have skipped objects
	// 	// 	// that have no geometry, but have children that do
	// 	// 	if (bbox) {
	// 	// 		for (let object of this._objects) {
	// 	// 			// const geometry = (object as Object3DWithGeometry).geometry;
	// 	// 			// if (geometry) {
	// 	// 			// if (!this._geometriesWithComputedBoundingBox.has(geometry)) {
	// 	// 			// 	geometry.computeBoundingBox();
	// 	// 			// }

	// 	// 			if (bbox) {
	// 	// 				bbox.expandByObject(object);
	// 	// 			}
	// 	// 			// }
	// 	// 		}
	// 	// 	}
	// 	// }
	// 	// bbox = bbox || new Box3(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));
	// 	// return bbox;
	// }
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
		for (let object of this.threejsCoreObjects()) {
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
	objectAttribTypesByName() {
		return BaseCoreObject.coreObjectAttributeTypesByName(this.allCoreObjects());
		// const first_core_object = this.coreObjects()[0];
		// if (first_core_object != null) {
		// 	return first_core_object.attribType(name);
		// } else {
		// 	return null;
		// }
	}

	renameAttrib(old_name: string, new_name: string, attribClass: AttribClass) {
		switch (attribClass) {
			case AttribClass.VERTEX:
				if (this.hasAttrib(old_name)) {
					const objects = this.threejsObjects();
					// if (this._objects) {
					for (let object of objects) {
						object.traverse((child) => {
							const geometry = CoreGroup.geometryFromObject(child);
							if (geometry) {
								const core_geometry = new CoreGeometry(geometry);
								core_geometry.renameAttrib(old_name, new_name);
							}
						});
					}
					// }
				}
				break;

			case AttribClass.OBJECT:
				if (this.hasAttrib(old_name)) {
					// if (this._allObjects) {
					for (let object of this._allObjects) {
						if (isObject3D(object)) {
							object.traverse((child) => {
								CoreObject.renameAttrib(child, old_name, new_name);
							});
						} else {
							CoreObject.renameAttrib(object, old_name, new_name);
						}
					}
					// }
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
		return BaseCoreObject.coreObjectsAttribNames(this.allCoreObjects());
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
	objectAttribSizesByName(): PolyDictionary<AttribSize[]> {
		return BaseCoreObject.coreObjectsAttribSizesByName(this.allCoreObjects());
		// const firstObject = this.coreObjects()[0];
		// if (firstObject) {
		// 	return firstObject.attribSizes();
		// } else {
		// 	return {};
		// }
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
