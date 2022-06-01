import {Number2} from '../../types/GlobalTypes';
import {SkinnedMesh} from 'three';
import {Scene} from 'three';
import {Points} from 'three';
import {Group} from 'three';
import {FrontSide} from 'three';
import {Bone} from 'three';
import {Material} from 'three';
import {PointsMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {LineBasicMaterial} from 'three';
// object types
import {Object3D} from 'three';
import {Mesh} from 'three';
import {LineSegments} from 'three';
import {LOD} from 'three';
import {Poly} from '../../engine/Poly';

interface MaterialsByString {
	[propName: string]: Material;
}

export enum ObjectType {
	OBJECT3D = 'Object3D',
	GROUP = 'Group',
	MESH = 'Mesh',
	POINTS = 'Points',
	LINE_SEGMENTS = 'LineSegments',
	LOD = 'LOD',
}

export interface ObjectData {
	type: ObjectType;
	name: string | null;
	children_count: number;
	points_count: number;
}
export interface ObjectByObjectType {
	[ObjectType.MESH]: Mesh;
	[ObjectType.GROUP]: Group;
	[ObjectType.POINTS]: Points;
	[ObjectType.LINE_SEGMENTS]: LineSegments;
	[ObjectType.OBJECT3D]: Object3D;
	[ObjectType.LOD]: LOD;
}
export interface ObjectConstructorByObjectType {
	[ObjectType.MESH]: typeof Mesh;
	[ObjectType.GROUP]: typeof Group;
	[ObjectType.POINTS]: typeof Points;
	[ObjectType.LINE_SEGMENTS]: typeof LineSegments;
	[ObjectType.OBJECT3D]: typeof Object3D;
	[ObjectType.LOD]: typeof LOD;
}
export const OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE: ObjectConstructorByObjectType = {
	[ObjectType.MESH]: Mesh,
	[ObjectType.GROUP]: Group,
	[ObjectType.POINTS]: Points,
	[ObjectType.LINE_SEGMENTS]: LineSegments,
	[ObjectType.OBJECT3D]: Object3D,
	[ObjectType.LOD]: LOD,
};
export function objectTypeFromConstructor(constructor: Function) {
	switch (constructor) {
		case Object3D:
			return ObjectType.OBJECT3D;
		case Group:
			return ObjectType.GROUP;
		case Mesh:
			return ObjectType.MESH;
		case Points:
			return ObjectType.POINTS;
		case LineSegments:
			return ObjectType.LINE_SEGMENTS;
		case LOD:
			return ObjectType.LOD;
		default:
			// Poly.warn('object type not supported', constructor);
			return ObjectType.MESH;
	}
}
export function ObjectTypeByObject(object: Object3D): ObjectType | undefined {
	if (object instanceof Mesh) {
		return ObjectType.MESH;
	} else if (object instanceof Group) {
		return ObjectType.GROUP;
	} else if (object instanceof LineSegments) {
		return ObjectType.LINE_SEGMENTS;
	} else if (object instanceof Points) {
		return ObjectType.POINTS;
	} else if (object instanceof Object3D) {
		return ObjectType.OBJECT3D;
	}
	// else if (object instanceof LOD) {
	// 	return ObjectType.LOD;
	// }
	Poly.warn('ObjectTypeByObject received an unknown object type', object);
}
export const ObjectTypes = [ObjectType.MESH, ObjectType.POINTS, ObjectType.LINE_SEGMENTS];
export const ObjectTypeMenuEntries = [
	{name: 'Mesh', value: ObjectTypes.indexOf(ObjectType.MESH)},
	{name: 'Points', value: ObjectTypes.indexOf(ObjectType.POINTS)},
	{name: 'LineSegments', value: ObjectTypes.indexOf(ObjectType.LINE_SEGMENTS)},
];

const materials: MaterialsByString = {
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
	VERTEX = 'vertex',
	OBJECT = 'object',
}
export const ATTRIBUTE_CLASSES: Array<AttribClass> = [AttribClass.VERTEX, AttribClass.OBJECT];

export const AttribClassMenuEntries = ATTRIBUTE_CLASSES.map((name, value) => ({name, value}));

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

export const CoreConstant = {
	ATTRIB_CLASS: {
		VERTEX: AttribClass.VERTEX,
		OBJECT: AttribClass.OBJECT,
	},

	OBJECT_TYPES: ObjectTypes,
	CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME: {
		[Scene.name]: 'Scene',
		[Group.name]: 'Group',
		[Object3D.name]: 'Object3D',
		[Mesh.name]: 'Mesh',
		[Points.name]: 'Points',
		[LineSegments.name]: 'LineSegments',
		[Bone.name]: 'Bone',
		[SkinnedMesh.name]: 'SkinnedMesh',
	},
	CONSTRUCTORS_BY_NAME: {
		[ObjectType.MESH]: Mesh,
		[ObjectType.POINTS]: Points,
		[ObjectType.LINE_SEGMENTS]: LineSegments,
	},

	MATERIALS: materials,
};
