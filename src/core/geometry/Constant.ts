import {Number2} from '../../types/GlobalTypes';
import {
	Object3D,
	LineSegments,
	Mesh,
	Points,
	Group,
	Scene,
	MeshStandardMaterial,
	PointsMaterial,
	LineBasicMaterial,
	FrontSide,
} from 'three';
import type {
	AmbientLight,
	// SkinnedMesh,
	// Bone,
	CubeCamera,
	DirectionalLight,
	HemisphereLight,
	LightProbe,
	Material,
	LOD,
	OrthographicCamera,
	PerspectiveCamera,
	PointLight,
	RectAreaLight,
	SpotLight,
} from 'three';
import {GroupCollectionData} from './EntityGroupCollection';

// import {Poly} from '../../engine/Poly';

interface MaterialsByString {
	[propName: string]: Material;
}

export enum ObjectType {
	// UNKNOWN = 'Unknown',
	AMBIENT_LIGHT = 'AmbientLight',
	AREA_LIGHT = 'AreaLight',
	// BONE = 'Bone',
	CUBE_CAMERA = 'CubeCamera',
	DIRECTIONAL_LIGHT = 'DirectionalLight',
	GROUP = 'Group',
	HEMISPHERE_LIGHT = 'HemisphereLight',
	LIGHT_PROBE = 'LightProbe',
	LINE_SEGMENTS = 'LineSegments',
	LOD = 'LOD',
	MESH = 'Mesh',
	OBJECT3D = 'Object3D',
	ORTHOGRAPHIC_CAMERA = 'OrthographicCamera',
	PERSPECTIVE_CAMERA = 'PerspectiveCamera',
	POINT_LIGHT = 'PointLight',
	POINTS = 'Points',
	SCENE = 'Scene',
	// SKINNED_MESH = 'SkinnedMesh',
	SPOT_LIGHT = 'SpotLight',
}
export const OBJECT_TYPES: ObjectType[] = [
	ObjectType.GROUP,
	ObjectType.LINE_SEGMENTS,
	ObjectType.MESH,
	ObjectType.OBJECT3D,
	ObjectType.POINTS,
	ObjectType.SCENE,
];

// type Object3DConstructor = any;// Object3D
interface Object3DConstructor<O extends Object3D> {
	new (args: any): O;
	// Model: Model;
}
export type DefaultObject3DConstructor = Object3DConstructor<Object3D>;

// type ObjectByObjectTypeMapGeneric = {[key in ObjectType]: DefaultObject3DConstructor};
export interface ObjectByObjectType {
	[ObjectType.AMBIENT_LIGHT]: AmbientLight;
	[ObjectType.AREA_LIGHT]: RectAreaLight;
	// [ObjectType.BONE]: typeof Bone;
	[ObjectType.CUBE_CAMERA]: CubeCamera;
	[ObjectType.DIRECTIONAL_LIGHT]: DirectionalLight;
	[ObjectType.GROUP]: Group;
	[ObjectType.HEMISPHERE_LIGHT]: HemisphereLight;
	[ObjectType.LIGHT_PROBE]: LightProbe;
	[ObjectType.LINE_SEGMENTS]: LineSegments;
	[ObjectType.LOD]: LOD;
	[ObjectType.MESH]: Mesh;
	[ObjectType.OBJECT3D]: Object3D;
	[ObjectType.POINT_LIGHT]: PointLight;
	[ObjectType.POINTS]: Points;
	[ObjectType.ORTHOGRAPHIC_CAMERA]: OrthographicCamera;
	[ObjectType.PERSPECTIVE_CAMERA]: PerspectiveCamera;
	// [ObjectType.POINTS]: typeof Points;
	[ObjectType.SCENE]: Scene;
	// [ObjectType.SKINNED_MESH]: typeof SkinnedMesh;
	[ObjectType.SPOT_LIGHT]: SpotLight;
}
// export const CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME: Record<ObjectType, string> = {
// 	// [ObjectType.BONE]: 'Bone',
// 	[ObjectType.GROUP]: 'Group',
// 	[ObjectType.LINE_SEGMENTS]: 'LineSegments',
// 	// [ObjectType.LOD]: 'LOD',
// 	[ObjectType.MESH]: 'Mesh',
// 	[ObjectType.OBJECT3D]: 'Object3D',
// 	[ObjectType.POINTS]: 'Points',
// 	// [ObjectType.ORTHOGRAPHIC_CAMERA]: 'OrthographicCamera',
// 	// [ObjectType.PERSPECTIVE_CAMERA]: 'PerspectiveCamera',
// 	// [ObjectType.POINTS]: 'Points',
// 	// [ObjectType.SCENE]: 'Scene',
// 	// [ObjectType.SKINNED_MESH]: 'SkinnedMesh',
// };

export interface ObjectData {
	type: ObjectType;
	name: string | null;
	childrenCount: number;
	groupData: GroupCollectionData;
	pointsCount: number;
	tetsCount: number | null;
}

// Zexport interface ObjectConstructorByObjectType {
// 	[ObjectType.MESH]: typeof Mesh;
// 	[ObjectType.GROUP]: typeof Group;
// 	[ObjectType.POINTS]: typeof Points;
// 	[ObjectType.LINE_SEGMENTS]: typeof LineSegments;
// 	[ObjectType.OBJECT3D]: typeof Object3D;
// 	[ObjectType.LOD]: typeof LOD;
// }
// export const OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE: ObjectConstructorByObjectType = {
// 	[ObjectType.MESH]: Mesh,
// 	[ObjectType.GROUP]: Group,
// 	[ObjectType.POINTS]: Points,
// 	[ObjectType.LINE_SEGMENTS]: LineSegments,
// 	[ObjectType.OBJECT3D]: Object3D,
// 	[ObjectType.LOD]: LOD,
// };

export interface ObjectTypeData {
	type: ObjectType;
	ctor: DefaultObject3DConstructor;
	humanName: string;
}
type DataByConstructor = Map<DefaultObject3DConstructor, ObjectTypeData>;
type DataByObjectType = Map<ObjectType, ObjectTypeData>;
interface ObjectTypeConstructorRegisters {
	dataByConstructor: DataByConstructor;
	dataByObjectType: DataByObjectType;
}
function _initializeObjectTypeFromConstructor() {
	const dataByConstructor: DataByConstructor = new Map();
	const dataByObjectType: DataByObjectType = new Map();
	const maps: ObjectTypeConstructorRegisters = {dataByConstructor, dataByObjectType};
	function _register(type: ObjectType, ctor: DefaultObject3DConstructor, humanName?: string) {
		_registerObjectType_(maps, {
			type,
			ctor,
			humanName: humanName || type,
		});
	}
	_register(ObjectType.GROUP, Group);
	_register(ObjectType.LINE_SEGMENTS, LineSegments);
	_register(ObjectType.MESH, Mesh);
	_register(ObjectType.OBJECT3D, Object3D);
	_register(ObjectType.POINTS, Points);
	_register(ObjectType.SCENE, Scene);
	return maps;
}
const {dataByConstructor, dataByObjectType}: ObjectTypeConstructorRegisters = _initializeObjectTypeFromConstructor();
function _registerObjectType_(maps: ObjectTypeConstructorRegisters, data: ObjectTypeData) {
	maps.dataByConstructor.set(data.ctor, data);
	maps.dataByObjectType.set(data.type, data);
}
export function registerObjectType(data: ObjectTypeData) {
	_registerObjectType_({dataByConstructor, dataByObjectType}, data);
}

export function objectTypeFromConstructor(constructor: Function): ObjectType {
	return dataFromConstructor(constructor).type;
	// const foundData = dataByConstructor.get(constructor as DefaultObject3DConstructor);
	// if (foundData) {
	// 	return foundData.type;
	// } else {
	// 	console.warn('no type found for constructor:');
	// 	console.log(constructor);
	// 	return ObjectType.MESH;
	// }

	// switch (constructor) {
	// 	case Object3D:
	// 		return ObjectType.OBJECT3D;
	// 	case Group:
	// 		return ObjectType.GROUP;
	// 	case Mesh:
	// 		return ObjectType.MESH;
	// 	case Points:
	// 		return ObjectType.POINTS;
	// 	case LineSegments:
	// 		return ObjectType.LINE_SEGMENTS;
	// 	case LOD:
	// 		return ObjectType.LOD;
	// 	case PerspectiveCamera:
	// 		return ObjectType.PERSPECTIVE_CAMERA;
	// 	case OrthographicCamera:
	// 		return ObjectType.ORTHOGRAPHIC_CAMERA;
	// 	default:
	// 		// Poly.warn('object type not supported', constructor);
	// 		return ObjectType.MESH;
	// }
}
export function dataFromConstructor(constructor: Function, level = 0): ObjectTypeData {
	const foundData = dataByConstructor.get(constructor as DefaultObject3DConstructor);
	// console.log(level, 'constructor', foundData, constructor);
	if (foundData) {
		return foundData;
	} else {
		// console.warn('no data found for constructor:');
		// console.log(constructor);
		return dataFromConstructor((constructor as any).__proto__, level + 1);
		// console.log(constructor);
		// console.log((constructor as any).__proto__);
		// console.log(constructor.prototype.prototype);
		// console.log(constructor.prototype.constructor);
		// console.log('Object3D:');
		// console.log('Object3D', Object3D);
		// console.log('Object3D.prototype:', Object3D.prototype);
		// console.log('group:');
		// console.log('Group', Group);
		// console.log('Group.prototype', Group.prototype);
		// console.log('(Group.prototype as any).prototype', (Group.prototype as any).prototype);
		// console.log('proto', (Group as any).__proto__, (Group as any).__proto__.__proto__);
		// console.log({constructor: Group.constructor});
		// console.log({'constructor.prototype': Group.constructor.prototype});
		// console.log('new');
		// const group = new Group();
		// console.log({group});
		// console.log({constructor: group.constructor});
		// console.log({prototype: group.constructor.prototype});
		// return dataByObjectType.get(ObjectType.MESH) as ObjectTypeData;
	}
}
export function objectConstructorByObjectType<O extends ObjectType>(objectType: O): ObjectByObjectType[O] {
	const data = dataByObjectType.get(objectType);
	if (data) {
		return data.ctor as any as ObjectByObjectType[O];
	} else {
		console.warn(`no constructor found for type '${objectType}'`);
		return dataByObjectType.get(ObjectType.MESH) as any as ObjectByObjectType[O];
	}
}
// export function ObjectTypeByObject(object: Object3D): ObjectType | undefined {
// 	objectTypeByConstructor.get(object.constructor)
// 	// if (object instanceof Mesh) {
// 	// 	return ObjectType.MESH;
// 	// } else if (object instanceof Group) {
// 	// 	return ObjectType.GROUP;
// 	// } else if (object instanceof LineSegments) {
// 	// 	return ObjectType.LINE_SEGMENTS;
// 	// } else if (object instanceof Points) {
// 	// 	return ObjectType.POINTS;
// 	// } else if (object instanceof Object3D) {
// 	// 	return ObjectType.OBJECT3D;
// 	// }
// 	// // else if (object instanceof LOD) {
// 	// // 	return ObjectType.LOD;
// 	// // }
// 	// Poly.warn('ObjectTypeByObject received an unknown object type', object);
// }

export const DEFAULT_MATERIALS: MaterialsByString = {
	MeshStandard: new MeshStandardMaterial({
		color: 0xffffff,
		side: FrontSide,
		metalness: 0.5,
		roughness: 0.9,
	}),
	// [ObjectType.MESH]: new MeshLambertMaterial({
	// 	color: new Color(1, 1, 1),
	// 	side: FrontSide,
	// 	vertexColors: false,
	// 	transparent: true,
	// 	depthTest: true,
	// }),
	[ObjectType.MESH]: new MeshStandardMaterial({
		color: 0xffffff,
		side: FrontSide,
		metalness: 0.0,
		roughness: 0.9,
	}),
	[ObjectType.POINTS]: new PointsMaterial({
		color: 0xffffff,
		size: 0.1,
		//blending: AdditiveBlending
		depthTest: true,
	}),
	[ObjectType.LINE_SEGMENTS]: new LineBasicMaterial({
		color: 0xffffff,
		linewidth: 1,
	}),
};

export enum AttribClass {
	POINT = 'point',
	VERTEX = 'vertex',
	PRIMITIVE = 'primitive',
	OBJECT = 'object',
	CORE_GROUP = 'container',
}
export const ATTRIBUTE_CLASSES: Array<AttribClass> = [
	AttribClass.POINT,
	AttribClass.VERTEX,
	AttribClass.PRIMITIVE,
	AttribClass.OBJECT,
	AttribClass.CORE_GROUP,
];
export const ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP: Array<AttribClass> = [
	AttribClass.POINT,
	AttribClass.VERTEX,
	AttribClass.PRIMITIVE,
	AttribClass.OBJECT,
];
export const AttribClassMenuEntries = ATTRIBUTE_CLASSES.map((name, value) => ({name, value}));
export const AttribClassMenuEntriesWithoutCoreGroup = ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.map((name, value) => ({
	name,
	value,
}));

export enum AttribType {
	NUMERIC = 'numeric',
	STRING = 'string',
}
export const ATTRIBUTE_TYPES: Array<AttribType> = [AttribType.NUMERIC, AttribType.STRING];
export const AttribTypeMenuEntries = ATTRIBUTE_TYPES.map((name, value) => ({name, value}));

export enum AttribSize {
	FLOAT = 1,
	VECTOR2 = 2,
	VECTOR3 = 3,
	VECTOR4 = 4,
}
export const ATTRIBUTE_SIZES: Array<AttribSize> = [
	AttribSize.FLOAT,
	AttribSize.VECTOR2,
	AttribSize.VECTOR3,
	AttribSize.VECTOR4,
];
export const ATTRIBUTE_SIZE_RANGE: Number2 = [AttribSize.FLOAT, AttribSize.VECTOR4];

// export const CoreConstant = {
// 	ATTRIB_CLASS: {
// 		VERTEX: AttribClass.POINT,
// 		OBJECT: AttribClass.OBJECT,
// 	},

// 	OBJECT_TYPES: ObjectTypes,
// 	CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME: {
// 		[Scene.name]: 'Scene',
// 		[Group.name]: 'Group',
// 		[Object3D.name]: 'Object3D',
// 		[Mesh.name]: 'Mesh',
// 		[Points.name]: 'Points',
// 		[LineSegments.name]: 'LineSegments',
// 		[Bone.name]: 'Bone',
// 		[SkinnedMesh.name]: 'SkinnedMesh',
// 	},
// 	CONSTRUCTORS_BY_NAME: {
// 		[ObjectType.MESH]: Mesh,
// 		[ObjectType.POINTS]: Points,
// 		[ObjectType.LINE_SEGMENTS]: LineSegments,
// 	},

// 	MATERIALS: materials,
// };

export enum ComponentName {
	x = 'x',
	y = 'y',
	z = 'z',
	w = 'w',
	r = 'r',
	g = 'g',
	b = 'b',
}
export const COMPONENT_INDICES = {
	x: 0,
	y: 1,
	z: 2,
	w: 3,
	r: 0,
	g: 1,
	b: 2,
};
export const DOT = '.';
