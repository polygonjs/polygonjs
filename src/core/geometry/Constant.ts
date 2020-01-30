// import {VertexColors} from 'three/src/constants'
import {SkinnedMesh} from 'three/src/objects/SkinnedMesh';
import {Scene} from 'three/src/scenes/Scene';
import {Points} from 'three/src/objects/Points';
import {Object3D} from 'three/src/core/Object3D';
import {NoColors} from 'three/src/constants';
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
		vertexColors: NoColors,
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

	ATTRIB_TYPE: {
		NUMERIC: 0,
		STRING: 1,
	},

	OBJECT_TYPE: {
		// TODO: typescript
		MESH: ObjectType.MESH,
		POINTS: ObjectType.POINTS,
		LINE_SEGMENTS: ObjectType.LINE_SEGMENTS,
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
	// CONSTRUCTORS_BY_TYPE: {
	// 	['MESH']: Mesh,
	// 	['POINTS']: Points,
	// 	['LINE_SEGMENTS']: LineSegments,
	// },
	// OBJECT_TYPE_BY_CONSTRUCTOR_NAME: {
	// 	[Mesh.name]: 'MESH',
	// 	[Points.name]: 'POINTS',
	// 	[LineSegments.name]: 'LINE_SEGMENTS',
	// },
	MATERIALS: materials,
};

// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Scene.name] = 'Scene'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Group.name] = 'Group'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Object3D.name] = 'Object3D'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Mesh.name] = 'Mesh'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Points.name] = 'Points'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[LineSegments.name] = 'LineSegments'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[Bone.name] = 'Bone'
// CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[SkinnedMesh.name] = 'SkinnedMesh'

// CoreConstant.CONSTRUCTORS_BY_NAME[Mesh.name] = Mesh
// CoreConstant.CONSTRUCTORS_BY_NAME[Points.name] = Points
// CoreConstant.CONSTRUCTORS_BY_NAME[LineSegments.name] = LineSegments

// CoreConstant.CONSTRUCTORS_BY_TYPE['MESH'] = Mesh
// CoreConstant.CONSTRUCTORS_BY_TYPE['POINTS'] = Points
// CoreConstant.CONSTRUCTORS_BY_TYPE['LINE_SEGMENTS'] = LineSegments

// CoreConstant.OBJECT_TYPE_BY_CONSTRUCTOR_NAME[Mesh.name] = 'MESH'
// CoreConstant.OBJECT_TYPE_BY_CONSTRUCTOR_NAME[Points.name] = 'POINTS'
// CoreConstant.OBJECT_TYPE_BY_CONSTRUCTOR_NAME[LineSegments.name] = 'LINE_SEGMENTS'
