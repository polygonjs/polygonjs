import {AttribValue, NumericAttribValue} from './../../types/GlobalTypes';
import {PolyDictionary} from '../../types/GlobalTypes';
import {Box3, BufferGeometry, LineSegments, Mesh, Points, Object3D, Vector2, Vector3, Vector4} from 'three';
import {CoreAttribute} from './Attribute';
import {CoreString} from '../String';
import {AttribSize, ObjectData, AttribType, GroupString, AttribClass} from './Constant';
import {CoreType} from '../Type';
import {arraySum, arrayCompact, arrayPushItems, arrayCopy} from '../ArrayUtils';
import {Poly} from '../../engine/Poly';
import {CoreObjectType, ObjectBuilder, ObjectContent, isObject3D} from './ObjectContent';
import {coreObjectClassFactory, coreObjectInstanceFactory} from './CoreObjectFactory';
import {BaseCoreObject} from './entities/object/BaseCoreObject';
import {
	coreObjectAttributeTypesByName,
	coreObjectsAttribNames,
	coreObjectsAttribSizesByName,
} from './entities/object/BaseCoreObjectUtils';
import {attribValueNonPrimitive, cloneAttribValue} from './entities/utils/Common';
import {object3DHasGeometry} from './GeometryUtils';

// entities
import {CoreEntity} from './CoreEntity';
import {
	pointsCountFromObject,
	pointAttributeNames,
	hasPointAttribute,
	pointAttributeType,
	pointAttributeSizes,
	pointAttributeSize,
	pointsFromObjects,
} from './entities/point/CorePointUtils';
import type {CorePoint} from './entities/point/CorePoint';

// CAD
import type {CadGeometryType, CadGeometryTypeShape} from './modules/cad/CadCommon';
import type {CadObject} from './modules/cad/CadObject';
import {CoreCadType, isCADObject} from './modules/cad/CadCoreType';
//
// CSG
import type {CsgGeometryType} from './modules/csg/CsgCommon';
import type {CsgObject} from './modules/csg/CsgObject';
import {isCSGObject} from './modules/csg/CsgCoreType';
//
// QUAD
import type {QuadObject} from './modules/quad/QuadObject';
import {isQuadObject, isQuadOrThreejsObject} from './modules/quad/QuadCoreType';
//
// SDF
// import type {SDFObjectType} from './sdf/SDFCommon';
// import {SDF_OBJECT_TYPES_SET} from './sdf/SDFCommon';
// import type {SDFObject} from './sdf/SDFObject';
//
// TET
import {isTetObject} from './modules/tet/TetCoreType';
import {TetObject} from './modules/tet/TetObject';
import {TypeAssert} from '../../engine/poly/Assert';

// THREEJS
import {ThreejsCoreObject} from './modules/three/ThreejsCoreObject';
import {uniqRelatedEntities} from './entities/utils/Common';
import {CoreVertex} from './entities/vertex/CoreVertex';
import {CorePrimitive} from './entities/primitive/CorePrimitive';
import {TraversedRelatedEntityData} from './entities/utils/TraversedRelatedEntities';

type AttributeDictionary = PolyDictionary<AttribValue>;

const tmpBox3 = new Box3();
const tmpPos = new Vector3();
const _indices: number[] = [];
const _points: CorePoint<CoreObjectType>[] = [];
const _relatedPoints: CorePoint<CoreObjectType>[] = [];
const _relatedVertices: CoreVertex<CoreObjectType>[] = [];
const _relatedPrimitives: CorePrimitive<CoreObjectType>[] = [];
const _relatedPrimitivesForObject: CorePrimitive<CoreObjectType>[] = [];

export interface Object3DWithGeometry extends Object3D {
	geometry: BufferGeometry;
}

function objectTotalPointsCount(object: ObjectContent<CoreObjectType>) {
	let sum = 0;
	object.traverse((child) => {
		// const geometry = (child as Mesh).geometry as BufferGeometry;
		// if (geometry) {
		sum += pointsCountFromObject(child);
		// }
	});
	return sum;
}

export class CoreGroup extends CoreEntity {
	private _timestamp: number | undefined;
	private _allObjects: ObjectContent<CoreObjectType>[] = [];

	constructor() {
		super(undefined, 0);
		this.touch();
	}
	dispose() {
		if (this._allObjects) {
			for (const object of this._allObjects) {
				if (object.dispose) {
					object.dispose();
				}
			}
		}
		this._allObjects.length = 0;
	}
	geometry() {
		return null;
	}
	builder<T extends CoreObjectType>(): ObjectBuilder<T> | undefined {
		return undefined;
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
			const allCoreObjects = this.allCoreObjects();
			const clonedObjects: ObjectContent<CoreObjectType>[] = [];
			for (const coreObject of allCoreObjects) {
				const clonedObject = coreObject.clone().object();
				if (clonedObject) {
					clonedObjects.push(clonedObject);
				}
			}

			// for (let object of this._allObjects) {
			// 	allObjects.push(object.clone());
			// }

			coreGroup.setAllObjects(clonedObjects);
		}

		const attribNames = this.attribNames();
		for (const attribName of attribNames) {
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
	// QUAD OBJECTS
	//
	//
	quadObjects() {
		const list = this._allObjects?.filter(isQuadObject) || undefined;
		return list as QuadObject[] | undefined;
	}
	quadCoreObjects() {
		return this.quadObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	}
	threejsOrQuadObjects(): Array<Object3D | QuadObject> {
		return (this._allObjects ? this._allObjects.filter(isQuadOrThreejsObject) : []) as Array<Object3D | QuadObject>;
	}
	threejsOrQuadCoreObjects() {
		return this.threejsOrQuadObjects().map((o, i) => coreObjectInstanceFactory(o, i));
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
	// TET OBJECTS
	//
	//
	tetObjects() {
		const list = this._allObjects?.filter(isTetObject) || undefined;
		return list as TetObject[] | undefined;
	}
	tetCoreObjects() {
		return this.tetObjects()?.map((o, i) => coreObjectInstanceFactory(o, i));
	}

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
		return this.threejsObjects().map((o, i) => new ThreejsCoreObject(o, i));
	}
	geometries(): BufferGeometry[] {
		return this.threejsObjectsWithGeo().map((o) => o.geometry);
	}
	// coreGeometries(): CoreGeometry[] {
	// 	return this.geometries().map((g) => new CoreGeometry(g));
	// }

	//
	//
	// POINTS
	//
	//
	points(target: CorePoint<CoreObjectType>[]) {
		return pointsFromObjects(this.allObjects(), target);
		// return this.allObjects()
		// 	.map((o) => pointsFromObject(o))
		// 	.flat();
		// .map((g) => g.points())
		// .flat();
	}
	pointsCount() {
		return arraySum(this.allObjects().map((g) => pointsCountFromObject(g)));
	}
	totalPointsCount() {
		const threejsObjects = this.threejsObjects();
		let sum = 0;
		for (const object of threejsObjects) {
			sum += objectTotalPointsCount(object);
		}
		return sum;
	}
	pointsFromGroup(group: GroupString, target: CorePoint<CoreObjectType>[]) {
		if (group) {
			CoreString.indices(group, _indices);
			this.points(_points);
			const compactPoints: CorePoint<CoreObjectType>[] = [];
			const pointsInGroup = arrayCompact(
				_indices.map((i) => _points[i]),
				compactPoints
			);
			target.length = 0;
			arrayPushItems(pointsInGroup, target);
			return target;
		} else {
			return this.points(target);
		}
	}
	pointAttribNames(): string[] {
		const firstObject = this.allObjects()[0];
		if (firstObject) {
			return pointAttributeNames(firstObject);
		} else {
			return [];
		}
	}
	hasPointAttrib(attribName: string): boolean {
		const firstObject = this.allObjects()[0];
		if (firstObject) {
			return hasPointAttribute(firstObject, attribName);
		} else {
			return false;
		}
	}
	pointAttribType(attribName: string): AttribType {
		const firstObject = this.allObjects()[0];
		if (firstObject) {
			return pointAttributeType(firstObject, attribName);
		} else {
			return AttribType.NUMERIC;
		}
	}
	pointAttribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.pointAttribNames());
	}
	pointAttribSizes(): Record<string, number> {
		const firstObject = this.allObjects()[0];
		if (firstObject) {
			return pointAttributeSizes(firstObject);
		} else {
			return {};
		}
	}
	pointAttribSize(attribName: string): number {
		const firstObject = this.allObjects()[0];
		if (firstObject) {
			return pointAttributeSize(firstObject, attribName);
		} else {
			return 0;
		}
	}

	//
	//
	// OBJECTS
	//
	//
	static _fromObjects(objects: Object3D[]): CoreGroup {
		const coreGroup = new CoreGroup();
		coreGroup.setAllObjects(objects);
		return coreGroup;
	}
	objectAttribTypesByName() {
		return coreObjectAttributeTypesByName(this.allCoreObjects());
	}
	objectAttribNames() {
		return coreObjectsAttribNames(this.allCoreObjects());
	}
	objectAttribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.objectAttribNames());
	}
	objectAttribSizesByName(): PolyDictionary<AttribSize[]> {
		return coreObjectsAttribSizesByName(this.allCoreObjects());
	}

	//
	//
	//
	//
	//
	renameAttribute(oldName: string, newName: string) {
		const attribValue = this.attribValue(oldName);
		if (attribValue == null) {
			return;
		}
		this.addAttribute(newName, attribValue);
		this.deleteAttribute(oldName);
	}

	attribNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.attribNames());
	}
	hasAttribute(attribName: string): boolean {
		return this.attribValue(attribName) != null;
	}

	private _attributes: AttributeDictionary = {};
	addAttribute(attribName: string, attribValue: AttribValue) {
		this.attributes()[attribName] = attribValue;
	}
	addNumericAttribute<T extends CoreObjectType>(
		attribName: string,
		size: AttribSize = 1,
		defaultValue: NumericAttribValue = 0
	) {
		const attributes = this.attributes();
		if (defaultValue != null) {
			if (attribValueNonPrimitive(defaultValue)) {
				const clonedDefaultValue = cloneAttribValue(defaultValue);
				if (clonedDefaultValue != null) {
					attributes[attribName] = clonedDefaultValue;
				}
			} else {
				attributes[attribName] = defaultValue;
			}
		} else {
			switch (size) {
				case 1: {
					return (this.attributes()[attribName] = 0);
				}
				case 2: {
					return (this.attributes()[attribName] = new Vector2(0, 0));
				}
				case 3: {
					return (this.attributes()[attribName] = new Vector3(0, 0, 0));
				}
				case 4: {
					return (this.attributes()[attribName] = new Vector4(0, 0, 0, 0));
				}
			}
		}
	}
	deleteAttribute(name: string) {
		delete this.attributes()[name];
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
		for (const attrib_name of this.attribNames()) {
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
	attributes() {
		return this._attributes || this._createAttributesDictionaryIfNone();
	}
	private _createAttributesDictionaryIfNone() {
		if (!this._attributes) {
			this._attributes = {};
		}
		return this._attributes;
	}
	// override
	setAttribValue(attribName: string, attribValue: AttribValue | string) {
		this.addAttribute(attribName, attribValue);
	}

	stringAttribValue(attribName: string) {
		return this.attribValue(attribName) as string | null;
	}
	position(target: Vector3): Vector3 {
		const objectsCount = this._allObjects.length;
		target.set(0, 0, 0);
		for (const object of this._allObjects) {
			coreObjectClassFactory(object).position(object, tmpPos);
			target.add(tmpPos);
		}
		target.divideScalar(objectsCount);
		return target;
	}
	attributeNames(): string[] {
		const attributes = this.attributes();
		if (!attributes) {
			return [];
		}
		return Object.keys(attributes);
	}
	attributeNamesMatchingMask(masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.attributeNames());
	}

	//
	//
	// RELATED ENTITIES
	//
	//

	relatedObjects(
		target: BaseCoreObject<CoreObjectType>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		arrayCopy(this.allCoreObjects(), target);
	}

	relatedPrimitives(
		target: CorePrimitive<CoreObjectType>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		target.length = 0;
		const objects = this.allObjects();
		let i = 0;
		for (const object of objects) {
			coreObjectClassFactory(object).relatedPrimitives(object, i, _relatedPrimitivesForObject);
			for (const _relatedPrimitiveForObject of _relatedPrimitivesForObject) {
				target.push(_relatedPrimitiveForObject);
			}

			i++;
		}
	}
	relatedVertices(target: CoreVertex<CoreObjectType>[], traversedRelatedEntityData?: TraversedRelatedEntityData) {
		this.relatedPrimitives(_relatedPrimitives);
		uniqRelatedEntities(
			_relatedPrimitives,
			(primitive) => {
				primitive.relatedVertices(_relatedVertices);
				return _relatedVertices;
			},
			target
		);
	}
	relatedPoints(target: CorePoint<CoreObjectType>[], traversedRelatedEntityData?: TraversedRelatedEntityData) {
		this.relatedVertices(_relatedVertices);
		return uniqRelatedEntities(
			_relatedVertices,
			(vertex) => {
				vertex.relatedPoints(_relatedPoints);
				return _relatedPoints;
			},
			target
		);
	}
	relatedEntities(
		attribClass: AttribClass,
		coreGroup: CoreGroup,
		target: CoreEntity[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		switch (attribClass) {
			case AttribClass.POINT: {
				this.relatedPoints(target as CorePoint<CoreObjectType>[], traversedRelatedEntityData);
				return;
			}
			case AttribClass.VERTEX: {
				this.relatedVertices(target as CoreVertex<CoreObjectType>[], traversedRelatedEntityData);
				return;
			}
			case AttribClass.PRIMITIVE: {
				this.relatedPrimitives(target as CorePrimitive<CoreObjectType>[], traversedRelatedEntityData);
				return;
			}
			case AttribClass.OBJECT: {
				this.relatedObjects(target as BaseCoreObject<CoreObjectType>[], traversedRelatedEntityData);
				return;
			}
			case AttribClass.CORE_GROUP: {
				target.length = 1;
				target[0] = coreGroup;
				return;
			}
		}
		TypeAssert.unreachable(attribClass);
	}

	//
	//
	// UTILS
	//
	//
	objectsData(): ObjectData[] {
		return this._allObjects?.map((o) => coreObjectClassFactory(o).objectData(o)) || [];
	}
	boundingBox(target: Box3) {
		target.makeEmpty();
		const coreObjects = this.allCoreObjects();
		for (const coreObject of coreObjects) {
			coreObject.boundingBox(tmpBox3);
			target.union(tmpBox3);
		}
	}
	static geometryFromObject(object: Object3D): BufferGeometry | null {
		if ((object as Mesh).isMesh || (object as LineSegments).isLine || (object as Points).isPoints) {
			return (object as Mesh).geometry as BufferGeometry;
		}
		return null;
	}
}
