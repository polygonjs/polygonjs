export class TypeAssert {
  static unreachable(x) {
    throw new Error("Didn't expect to get here");
  }
}
