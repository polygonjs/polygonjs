import {BaseVertexAttribute} from './VertexAttribute';

export type VertexAttributesDict = Record<string, BaseVertexAttribute>;

export interface UserDataWithVertexAttributes {
	vertexAttributes?: VertexAttributesDict;
}
