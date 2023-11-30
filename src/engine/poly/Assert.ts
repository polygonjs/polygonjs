export class TypeAssert {
	static unreachable(_: never): never {
		throw new Error("Didn't expect to get here");
	}
}
