export abstract class PrimitiveGraph {
	abstract neighboursCount(primitiveIndex: number, withSharedEdge: boolean): number;
	abstract neighbourIndex(primitiveIndex: number, neighbourIndex: number, withSharedEdge: boolean): number;
}
