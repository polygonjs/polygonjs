export class TypeAssert {
	static unreachable(x: never): never {
		throw new Error("Didn't expect to get here");
	}
}
