export class TypedPrimitiveAttribute<T extends number | string> {
	protected _isString: boolean = false;
	constructor(public array: T[], public readonly itemSize: number) {}
	isString() {
		return this._isString;
	}
}
export type BasePrimitiveAttribute = TypedPrimitiveAttribute<number | string>;

export class PrimitiveNumberAttribute extends TypedPrimitiveAttribute<number> {}
export class PrimitiveStringAttribute extends TypedPrimitiveAttribute<number> {
	protected override _isString: boolean = true;
}
