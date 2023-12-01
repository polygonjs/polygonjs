import {Number2} from '../../types/GlobalTypes';
import {
	Object3D,
	LineSegments,
	InstancedMesh,
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
import {CoreObjectType, ObjectContent} from './ObjectContent';
import type {PhysicalCamera, ShapedAreaLight, PhysicalSpotLight} from '../render/PBR/three-gpu-pathtracer';

// import {Poly} from '../../engine/Poly';

interface MaterialsByString {
	[propName: string]: Material;
}

export enum ObjectType {
	AMBIENT_LIGHT = 'AmbientLight',
	AREA_LIGHT = 'AreaLight',
	// BONE = 'Bone',
	CUBE_CAMERA = 'CubeCamera',
	DIRECTIONAL_LIGHT = 'DirectionalLight',
	GROUP = 'Group',
	HEMISPHERE_LIGHT = 'HemisphereLight',
	INSTANCED_MESH = 'InstancedMesh',
	LIGHT_PROBE = 'LightProbe',
	LINE_SEGMENTS = 'LineSegments',
	LOD = 'LOD',
	MESH = 'Mesh',
	OBJECT3D = 'Object3D',
	ORTHOGRAPHIC_CAMERA = 'OrthographicCamera',
	PERSPECTIVE_CAMERA = 'PerspectiveCamera',
	PHYSICAL_CAMERA = 'PhysicalCamera',
	PHYSICAL_SPOT_LIGHT = 'PhysicalSpotLight',
	POINT_LIGHT = 'PointLight',
	POINTS = 'Points',
	SCENE = 'Scene',
	SHAPED_AREA_LIGHT = 'ShapedAreaLight',
	// SKINNED_MESH = 'SkinnedMesh',
	SPOT_LIGHT = 'SpotLight',
	UNKNOWN = 'Unknown',
	QUAD = 'Quad',
}
export const OBJECT_TYPES: ObjectType[] = [
	ObjectType.GROUP,
	ObjectType.LINE_SEGMENTS,
	ObjectType.MESH,
	ObjectType.OBJECT3D,
	ObjectType.POINTS,
	ObjectType.SCENE,
];

interface ObjectContentConstructor<T extends CoreObjectType> {
	new (arg0: any, arg1?: any, arg2?: any): ObjectContent<T>;
}
export type DefaultObjectContentConstructor = ObjectContentConstructor<CoreObjectType>;

export interface ObjectByObjectType {
	[ObjectType.AMBIENT_LIGHT]: AmbientLight;
	[ObjectType.AREA_LIGHT]: RectAreaLight;
	// [ObjectType.BONE]: typeof Bone;
	[ObjectType.CUBE_CAMERA]: CubeCamera;
	[ObjectType.DIRECTIONAL_LIGHT]: DirectionalLight;
	[ObjectType.GROUP]: Group;
	[ObjectType.HEMISPHERE_LIGHT]: HemisphereLight;
	[ObjectType.INSTANCED_MESH]: InstancedMesh;
	[ObjectType.LIGHT_PROBE]: LightProbe;
	[ObjectType.LINE_SEGMENTS]: LineSegments;
	[ObjectType.LOD]: LOD;
	[ObjectType.MESH]: Mesh;
	[ObjectType.OBJECT3D]: Object3D;
	[ObjectType.POINT_LIGHT]: PointLight;
	[ObjectType.POINTS]: Points;
	[ObjectType.ORTHOGRAPHIC_CAMERA]: OrthographicCamera;
	[ObjectType.PERSPECTIVE_CAMERA]: PerspectiveCamera;
	[ObjectType.PHYSICAL_CAMERA]: PhysicalCamera;
	[ObjectType.PHYSICAL_SPOT_LIGHT]: PhysicalSpotLight;
	// [ObjectType.POINTS]: typeof Points;
	[ObjectType.SCENE]: Scene;
	[ObjectType.SHAPED_AREA_LIGHT]: ShapedAreaLight;
	// [ObjectType.SKINNED_MESH]: typeof SkinnedMesh;
	[ObjectType.SPOT_LIGHT]: SpotLight;
	[ObjectType.UNKNOWN]: null;
	[ObjectType.QUAD]: null;
}

export interface ObjectData {
	type: ObjectType;
	name: string | null;
	childrenCount: number;
	groupData: GroupCollectionData;
	verticesCount: number;
	pointsCount: number;
	primitivesCount: number;
	primitiveName: string;
}

const UNKNOWN_OBJECT_TYPE: ObjectTypeData = {
	type: ObjectType.UNKNOWN,
	checkFunc: (o) => ObjectType.UNKNOWN,
	humanName: 'Unknown',
	ctor: null as any,
};

// type DataByConstructor = Map<DefaultObjectContentConstructor, ObjectTypeData>;
type ObjectTypeCheckFunction = (object: ObjectContent<CoreObjectType>) => ObjectType | undefined;
type DataByObjectType = Map<ObjectType, ObjectTypeData>;
export interface ObjectTypeData {
	type: ObjectType;
	checkFunc: ObjectTypeCheckFunction;
	ctor: DefaultObjectContentConstructor;
	humanName: string;
}
interface ObjectTypeConstructorRegisters {
	objectTypeCheckFunctions: ObjectTypeCheckFunction[];
	dataByObjectType: DataByObjectType;
}

function _initializeObjectTypeFromConstructor() {
	const objectTypeCheckFunctions: ObjectTypeCheckFunction[] = [];
	const dataByObjectType: DataByObjectType = new Map();
	const maps: ObjectTypeConstructorRegisters = {objectTypeCheckFunctions, dataByObjectType};
	function _register(
		type: ObjectType,
		checkFunc: ObjectTypeCheckFunction,
		ctor: DefaultObjectContentConstructor,
		humanName?: string
	) {
		_registerObjectType_(maps, {
			type,
			checkFunc,
			ctor,
			humanName: humanName || type,
		});
	}
	_register(
		ObjectType.OBJECT3D,
		(o) => ((o as Object3D).isObject3D ? ObjectType.OBJECT3D : undefined),
		Object3D,
		'Object3D'
	);
	_register(ObjectType.MESH, (o) => ((o as Mesh).isMesh ? ObjectType.MESH : undefined), Mesh, 'Mesh');
	_register(ObjectType.GROUP, (o) => ((o as Group).isGroup ? ObjectType.GROUP : undefined), Group, 'Group');
	_register(
		ObjectType.LINE_SEGMENTS,
		(o) => ((o as LineSegments).isLineSegments ? ObjectType.LINE_SEGMENTS : undefined),
		LineSegments,
		'LineSegments'
	);
	_register(
		ObjectType.INSTANCED_MESH,
		(o) => ((o as InstancedMesh).isInstancedMesh ? ObjectType.INSTANCED_MESH : undefined),
		InstancedMesh,
		'InstancedMesh'
	);
	_register(ObjectType.POINTS, (o) => ((o as Points).isPoints ? ObjectType.POINTS : undefined), Points, 'Points');
	_register(ObjectType.SCENE, (o) => ((o as Scene).isScene ? ObjectType.SCENE : undefined), Scene, 'Scene');
	return maps;
}
const {objectTypeCheckFunctions, dataByObjectType}: ObjectTypeConstructorRegisters =
	_initializeObjectTypeFromConstructor();
function _registerObjectType_(maps: ObjectTypeConstructorRegisters, data: ObjectTypeData) {
	maps.objectTypeCheckFunctions.unshift(data.checkFunc);
	maps.dataByObjectType.set(data.type, data);
}
export function registerObjectType(data: ObjectTypeData) {
	_registerObjectType_({objectTypeCheckFunctions, dataByObjectType}, data);
}

export function objectTypeFromObject(object: ObjectContent<CoreObjectType>): ObjectType {
	return dataFromObject(object).type;
}

export function dataFromObject(object: ObjectContent<CoreObjectType>): ObjectTypeData {
	for (const checkFunc of objectTypeCheckFunctions) {
		const objectType = checkFunc(object);
		if (objectType) {
			return dataByObjectType.get(objectType) as ObjectTypeData;
		}
	}
	return UNKNOWN_OBJECT_TYPE;
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
	CORE_GROUP = 'coreGroup',
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

export type GroupString = string;
