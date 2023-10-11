import type {Object3D} from 'three';

export enum ObjectBuilderAssemblerConstant {
	OBJECT_CONTAINER = 'objectContainer',
	OBJECT_3D = 'objectContainer.Object3D',
	OBJ_NUM = 'objectContainer.objnum',
	MATERIAL = 'objectContainer.Object3D.material',
	PTNUM = 'null', // not available in this assembler
	PRIMITIVE_GRAPH = 'null',
}

export interface ObjectContainer {
	Object3D: Object3D;
	objnum: number;
}

export enum ObjectVariable {
	OBJECT_3D = 'Object3D',
	POSITION = 'position',
	ROTATION = 'rotation',
	QUATERNION = 'quaternion',
	SCALE = 'scale',
	MATRIX = 'matrix',
	VISIBLE = 'visible',
	MATRIX_AUTO_UPDATE = 'matrixAutoUpdate',
	CAST_SHADOW = 'castShadow',
	RECEIVE_SHADOW = 'receiveShadow',
	FRUSTUM_CULLED = 'frustumCulled',
	OBJ_NUM = 'objnum',
}
