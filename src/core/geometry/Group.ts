import {AttribValue} from './../../types/GlobalTypes';
import {NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Box3, BufferGeometry, LineSegments, Mesh, Points, Object3D, Vector3} from 'three';
import {BaseCoreObject} from './_BaseObject';
import {CoreObject} from './Object';
import {CoreGeometry} from './Geometry';
import {CoreAttribute} from './Attribute';
import {CoreString} from '../String';
import {AttribClass, AttribSize, ObjectData, objectTypeFromConstructor, AttribType, ObjectType} from './Constant';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {CoreFace} from './CoreFace';
import {Poly} from '../../engine/Poly';
import {CoreEntity} from './Entity';
import {CoreObjectType, ObjectContent, isObject3D} from './ObjectContent';
// import {computeBoundingBoxFromObject3Ds} from './BoundingBox';
import {coreObjectFactory, coreObjectInstanceFactory} from './CoreObjectFactory';

// CAD
import type {CadGeometryType, CadGeometryTypeShape} from './cad/CadCommon';
import type {CadObject} from './cad/CadObject';
import {CoreCadType, isCADObject} from './cad/CadCoreType';
//
// CSG
import type {CsgGeometryType} from './csg/CsgCommon';
import type {CsgObject} from './csg/CsgObject';
import {EntityGroupCollection} from './EntityGroupCollection';
import {isCSGObject} from './csg/CsgCoreType';
import {object3DHasGeometry} from './GeometryUtils';
//
// SDF
// import type {SDFObjectType} from './sdf/SDFCommon';
// import {SDF_OBJECT_TYPES_SET} from './sdf/SDFCommon';
// import type {SDFObject} from './sdf/SDFObject';
//
type AttributeDictionary = PolyDictionary<AttribValue>;

// import {CoreMask} from './Mask';
export type GroupString = string;
const tmpBox3 = new Box3();
const tmpPos = new Vector3();

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
	const groupData = EntityGroupCollection.data(object);
	return {
		type: objectType,
		name: object.name,
		childrenCount,
		pointsCount,
		groupData,
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
	private _timestamp: number | undefined; // _core_objects:
	private _allObjects: ObjectContent<CoreObjectType>[] = [];

	constructor() {
		super(0);
		this.touch();
	}
	dispose() {
		if (this._allObjects) {
			for (let object of this._allObjects) {
				if (object.dispose) {
					object.dispose();
				}
			}
		}
		this._allObjects.length = 0;
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
	}
	allCoreObjects() {
		return this.allObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	}
	//
	//
	// CAD OBJECTS
	//
	//
	cadObjects() {
		const list = this._allObjects?.filter(isCADObject) || undefined;
		return list as CadObject<CadGeometryType>[] | undefined;
	}
	cadObjectsWithShape() {
		return this.cadObjects()?.filter((o) => CoreCadType.isShape(o)) as
			| CadObject<CadGeometryTypeShape>[]
			| undefined;
	}
	cadCoreObjects() {
		return this.cadObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	}
	//
	//
	// CSG OBJECTS
	//
	//
	csgObjects() {
		const list = this._allObjects?.filter(isCSGObject) || undefined;
		return list as CsgObject<CsgGeometryType>[] | undefined;
	}
	csgCoreObjects() {
		return this.csgObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	}
	//
	//
	// SDF OBJECTS
	//
	//
	// SDFObjects() {
	// 	const list = this._allObjects?.filter((o) => SDF_OBJECT_TYPES_SET.has(o.type as SDFObjectType)) || undefined;
	// 	return list as SDFObject[] | undefined;
	// }
	// SDFCoreObjects() {
	// 	return this.csgObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	// }
	//
	//
	// THREEJS OBJECTS
	//
	//
	threejsObjects(): Object3D[] {
		return this._allObjects ? this._allObjects.filter(isObject3D) : [];
	}
	threejsObjectsWithGeo(): Object3DWithGeometry[] {
		return this.threejsObjects().filter(object3DHasGeometry);
	}
	threejsCoreObjects() {
		return this.threejsObjects().map((o, i) => new CoreObject(o, i));
	}
	geometries(): BufferGeometry[] {
		return this.threejsObjectsWithGeo().map((o) => o.geometry);
	}
	coreGeometries(): CoreGeometry[] {
		return this.geometries().map((g) => new CoreGeometry(g));
	}
	//
	//
	//
	//
	//

	//
	//
	//
	//
	//
	// computeVertexNormals() {
	// 	for (let object of this.threejsCoreObjects()) {
	// 		object.computeVertexNormals();
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
		return ArrayUtils.sum(this.geometries().map((g) => CoreGeometry.pointsCount(g)));
	}
	totalPointsCount() {
		const threejsObjects = this.threejsObjects();
		let sum = 0;
		for (let object of threejsObjects) {
			sum += objectTotalPointsCount(object);
		}
		return sum;
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

	//
	//
	//
	//
	//
	objectsData(): ObjectData[] {
		return this._allObjects?.map(objectData) || [];
	}
	boundingBox(target: Box3) {
		target.makeEmpty();
		const coreObjects = this.allCoreObjects();
		for (let coreObject of coreObjects) {
			coreObject.boundingBox(tmpBox3);
			target.union(tmpBox3);
		}
	}
	//
	//
	// attributes
	//
	//
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
	position(target: Vector3) {
		const objectsCount = this._allObjects.length;
		target.set(0, 0, 0);
		for (let object of this._allObjects) {
			coreObjectFactory(object).position(object, tmpPos);
			target.add(tmpPos);
		}
		target.divideScalar(objectsCount);
	}
}
