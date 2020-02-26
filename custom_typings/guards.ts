interface typeMap {
	// for mapping from strings to types
	string: string;
	number: number;
	boolean: boolean;
}

type PrimitiveOrConstructor = {new (...args: any[]): any} | keyof typeMap; // 'string' | 'number' | 'boolean' | constructor

// infer the guarded type from a specific case of PrimitiveOrConstructor
type GuardedType<T extends PrimitiveOrConstructor> = T extends {new (...args: any[]): infer U}
	? U
	: T extends keyof typeMap
	? typeMap[T]
	: never;
