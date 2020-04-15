// import {VertexColors} from 'three/src/constants'
import {SkinnedMesh} from 'three/src/objects/SkinnedMesh';
import {Scene} from 'three/src/scenes/Scene';
import {Points} from 'three/src/objects/Points';
import {Object3D} from 'three/src/core/Object3D';
// import {NoColors} from 'three/src/constants';
import {Mesh} from 'three/src/objects/Mesh';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Group} from 'three/src/objects/Group';
import {FrontSide} from 'three/src/constants';
// import {DoubleSide} from 'three/src/constants'
import {Color} from 'three/src/math/Color';
import {Bone} from 'three/src/objects/Bone';
// import {AdditiveBlending} from 'three/src/constants'
import {Material} from 'three/src/materials/Material';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
// const THREE = {AdditiveBlending, Bone, Color, DoubleSide, FrontSide, Group, LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial, MeshStandardMaterial, NoColors, Object3D, Points, PointsMaterial, Scene, SkinnedMesh, VertexColors}

interface MaterialsByString {
	[propName: string]: Material;
}

// export enum AttribClass {
// 	VERTEX = "vertex",
// 	OBJECT = "object"
// }
// materials['MeshStandard'] = new MeshStandardMaterial({
// 	color: 0xffffff,
// 	//vertexColors: VertexColors
// 	side: FrontSide, // DoubleSide
// 	metalness: 0.5,
// 	roughness: 0.9
// })
// materials[Mesh.name] = new MeshLambertMaterial({ // MeshStandardMaterial
// 	color: new Color(0.5,0.5,1),
// 	side: FrontSide,
// 	vertexColors: NoColors,
// 	transparent: true,
// 	depthTest: true
// })
// materials[Points.name] = new PointsMaterial({
// 	color: 0xffffff,
// 	size: 0.1,
// 	//blending: AdditiveBlending
// 	depthTest: true
// })
// materials[LineSegments.name] = new LineBasicMaterial({
// 	color: 0xffffff,
// 	linewidth: 1
// })
export enum ObjectType {
	MESH = 'MESH',
	POINTS = 'POINTS',
	LINE_SEGMENTS = 'LINE_SEGMENTS',
}
export interface ObjectByObjectType {
	[ObjectType.MESH]: Mesh;
	[ObjectType.POINTS]: Points;
	[ObjectType.LINE_SEGMENTS]: LineSegments;
}
export interface ObjectConstructorByObjectType {
	[ObjectType.MESH]: typeof Mesh;
	[ObjectType.POINTS]: typeof Points;
	[ObjectType.LINE_SEGMENTS]: typeof LineSegments;
}
export const OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE: ObjectConstructorByObjectType = {
	[ObjectType.MESH]: Mesh,
	[ObjectType.POINTS]: Points,
	[ObjectType.LINE_SEGMENTS]: LineSegments,
};
export function object_type_from_constructor(constructor: Function) {
	switch (constructor) {
		case Mesh:
			return ObjectType.MESH;
		case Points:
			return ObjectType.POINTS;
		case LineSegments:
			return ObjectType.LINE_SEGMENTS;
		default:
			console.warn('object type not supported', constructor);
			return ObjectType.MESH;
	}
}
export function ObjectTypeByObject(object: Object3D): ObjectType | undefined {
	if (object instanceof Mesh) {
		return ObjectType.MESH;
	}
	if (object instanceof LineSegments) {
		return ObjectType.LINE_SEGMENTS;
	}
	if (object instanceof Points) {
		return ObjectType.POINTS;
	}
	console.warn('ObjectTypeByObject received an unknown object type', object);
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
		//vertexColors: VertexColors
		side: FrontSide, // DoubleSide
		metalness: 0.5,
		roughness: 0.9,
	}),
	[ObjectType.MESH]: new MeshLambertMaterial({
		// MeshStandardMaterial
		color: new Color(0.5, 0.5, 1),
		side: FrontSide,
		vertexColors: false,
		transparent: true,
		depthTest: true,
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

// TODO: typescript: check that this works after using uglifier

export enum AttribClass {
	VERTEX = 0,
	OBJECT = 1,
}

export const AttribClassMenuEntries = [
	{name: 'vertex', value: AttribClass.VERTEX},
	{name: 'object', value: AttribClass.OBJECT},
];

export enum AttribType {
	NUMERIC = 0,
	STRING = 1,
}
export const AttribTypeMenuEntries = [
	{name: 'numeric', value: AttribType.NUMERIC},
	{name: 'string', value: AttribType.STRING},
];

export const CoreConstant = {
	ATTRIB_CLASS: {
		VERTEX: AttribClass.VERTEX,
		OBJECT: AttribClass.OBJECT,
	},

	// ATTRIB_TYPE: {
	// 	NUMERIC: AttribType.NUMERIC,
	// 	STRING: AttribType.STRING,
	// },

	// OBJECT_TYPE: {
	// 	// TODO: typescript
	// 	MESH: ObjectType.MESH,
	// 	POINTS: ObjectType.POINTS,
	// 	LINE_SEGMENTS: ObjectType.LINE_SEGMENTS,
	// },
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
