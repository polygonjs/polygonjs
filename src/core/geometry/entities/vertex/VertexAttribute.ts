export interface TypedVertexAttribute<T extends number | string> {
	isString: boolean;
	array: T[];
	itemSize: number;
}
export interface BaseVertexAttribute extends TypedVertexAttribute<number | string> {}
export interface VertexNumberAttribute extends TypedVertexAttribute<number> {
	isString: false;
}
export interface VertexStringAttribute extends TypedVertexAttribute<string> {
	isString: true;
}
