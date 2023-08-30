export class TypedVertexAttribute<T extends number | string> {
	protected _isString: boolean = false;
	constructor(public array: T[], public readonly itemSize: number) {}
	isString() {
		return this._isString;
	}
}
export type BaseVertexAttribute = TypedVertexAttribute<number | string>;

export class VertexNumberAttribute extends TypedVertexAttribute<number> {}
export class VertexStringAttribute extends TypedVertexAttribute<number> {
	protected override _isString: boolean = true;
}
