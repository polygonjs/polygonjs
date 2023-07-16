import {Vector3, Quaternion} from 'three';

export enum InstanceBuilderAssemblerConstant {
	POINT_CONTAINER = 'pointContainer',
	INSTANCE_POSITION = 'pointContainer.instancePosition',
	INSTANCE_QUATERNION = 'pointContainer.instanceQuaternion',
	INSTANCE_SCALE = 'pointContainer.instanceScale',
	// UV = 'pointContainer.instanceUv',
	PTNUM = 'pointContainer.ptnum',
	OBJNUM = 'pointContainer.objnum',
	ATTRIBUTES_DICT = 'attributesDict',
	OBJECT_3D = 'null', // not available in this assembler
	MATERIAL = 'null', // not available in this assembler
}
export interface InstanceContainer {
	instancePosition: Vector3;
	instanceQuaternion: Quaternion;
	instanceScale: Vector3;
	// instanceUv: Vector2;
	ptnum: number;
	objnum: number;
}

export enum InstanceVariable {
	INSTANCE_POSITION = 'instancePosition',
	INSTANCE_QUATERNION = 'instanceQuaternion',
	INSTANCE_SCALE = 'instanceScale',
	// INSTANCE_UV = 'instanceUv',
	PTNUM = 'ptnum',
	OBJNUM = 'objnum',
}
