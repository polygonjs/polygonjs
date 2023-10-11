import type {Vector3} from 'three';
import type {ObjectContent, CoreObjectType} from '../../../../../../core/geometry/ObjectContent';
import type {PrimitiveGraph} from '../../../../../../core/geometry/entities/primitive/PrimitiveGraph';

export enum EntityBuilderAssemblerConstant {
	OBJECT = 'entityContainer.object',
	ENTITY_CONTAINER = 'entityContainer',
	POSITION = 'entityContainer.position',
	NORMAL = 'entityContainer.normal',
	INDEX = 'entityContainer.index',
	OBJNUM = 'entityContainer.objnum',
	NORMALS_UPDATED = 'entityContainer.normalsUpdated',
	PRIMITIVE_GRAPH = 'entityContainer.primitiveGraph',
	ATTRIBUTES_DICT = 'attributesDict',
	MATERIAL = 'null', // not available in this assembler
}
export interface EntityContainer {
	object: ObjectContent<CoreObjectType>;
	position: Vector3;
	normal: Vector3;
	index: number;
	objnum: number;
	normalsUpdated: boolean;
	primitiveGraph?: PrimitiveGraph;
}

export enum EntityVariable {
	POSITION = 'position',
	NORMAL = 'normal',
	INDEX = 'index',
	OBJNUM = 'objnum',
}
