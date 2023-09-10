export interface TypedPrimitiveAttribute<T extends number | string> {
	isString: boolean;
	array: T[];
	itemSize: number;
}
export interface BasePrimitiveAttribute extends TypedPrimitiveAttribute<number | string> {}
export interface PrimitiveNumberAttribute extends TypedPrimitiveAttribute<number> {
	isString: false;
}
export interface PrimitiveStringAttribute extends TypedPrimitiveAttribute<string> {
	isString: true;
}
