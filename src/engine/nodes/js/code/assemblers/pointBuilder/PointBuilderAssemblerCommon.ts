import {Vector3} from 'three';

export enum PointBuilderAssemblerConstant {
	POINT_CONTAINER = 'pointContainer',
	POSITION = 'pointContainer.position',
	NORMAL = 'pointContainer.normal',
	PTNUM = 'pointContainer.ptnum',
	OBJNUM = 'pointContainer.objnum',
	NORMALS_UPDATED = 'pointContainer.normalsUpdated',
	ATTRIBUTES_DICT = 'attributesDict',
	OBJECT_3D = 'null', // not available in this assembler
	MATERIAL = 'null', // not available in this assembler
}
export interface PointContainer {
	position: Vector3;
	normal: Vector3;
	ptnum: number;
	objnum: number;
	normalsUpdated: boolean;
}

export enum PointVariable {
	POSITION = 'position',
	NORMAL = 'normal',
	PTNUM = 'ptnum',
	OBJNUM = 'objnum',
}
