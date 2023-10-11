import {NamedFunction3, NamedFunction4} from './_Base';
import {PrimitiveGraph} from '../../core/geometry/entities/primitive/PrimitiveGraph';

export class primitiveNeighboursCount extends NamedFunction3<[PrimitiveGraph, number, boolean]> {
	static override type() {
		return 'primitiveNeighboursCount';
	}
	func(graph: PrimitiveGraph, primitiveIndex: number, sharedEdgeOnly: boolean): number {
		return graph.neighboursCount(primitiveIndex, sharedEdgeOnly);
	}
}

export class primitiveNeighbourIndex extends NamedFunction4<[PrimitiveGraph, number, number, boolean]> {
	static override type() {
		return 'primitiveNeighbourIndex';
	}
	func(graph: PrimitiveGraph, primitiveIndex: number, neighbourIndex: number, sharedEdgeOnly: boolean): number {
		return graph.neighbourIndex(primitiveIndex, neighbourIndex, sharedEdgeOnly);
	}
}
