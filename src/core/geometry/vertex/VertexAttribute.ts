// export class TypedVertexAttribute<T extends number | string> {
// 	protected _isString: boolean = false;
// 	constructor(public array: T[], public readonly itemSize: number) {}
// 	isString() {
// 		return this._isString;
// 	}
// }
// export type BaseVertexAttribute = TypedVertexAttribute<number | string>;

// export class VertexNumberAttribute extends TypedVertexAttribute<number> {}
// export class VertexStringAttribute extends TypedVertexAttribute<number> {
// 	protected override _isString: boolean = true;
// }

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
