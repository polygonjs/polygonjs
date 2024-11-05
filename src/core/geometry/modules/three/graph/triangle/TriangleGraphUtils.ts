import {Vector3, BufferGeometry} from 'three';
import {
	// setUnion,
	setToArray,
	setDifference,
} from '../../../../../SetUtils';
import {TriangleGraph} from './TriangleGraph';
import {randFloat} from '../../../../../math/_Module';
import {sample} from '../../../../../ArrayUtils';
import {Number3} from '../../../../../../types/GlobalTypes';

const _v3 = new Vector3();
const _triangleIds: Set<number> = new Set();
const _edgeIds0 = new Set<string>();
const _edgeIds1 = new Set<string>();
const _edgeIds2 = new Set<string>();
// const _edgeIds3 = new Set<string>();
// const _edgeIds10 = new Set<string>();
const _notVisited = new Set<string>();
const _edgeIdsArray: string[] = [];

export function triangleGraphFromGeometry(geometry: BufferGeometry): TriangleGraph | undefined {
	const index = geometry.getIndex();
	if (!index) {
		return;
	}
	const trianglesCount = index.array.length / 3;
	const graph = new TriangleGraph();
	for (let i = 0; i < trianglesCount; i++) {
		_v3.fromArray(index.array, i * 3);
		graph.addTriangle(_v3.toArray() as Number3);
	}
	return graph;
}

export function triangleGraphExpandEdges(
	graph: TriangleGraph,
	startEdgeIds: Readonly<Set<string>>,
	target: Set<string>,
	excluded?: Readonly<Set<string>>
) {
	_triangleIds.clear();
	target.clear();

	startEdgeIds.forEach((edgeId) => {
		const edge = graph.edge(edgeId);
		if (edge) {
			const edgeTriangleIds = edge.triangleIds;
			for (const triangleId of edgeTriangleIds) {
				_triangleIds.add(triangleId);
			}
		}
	});

	_triangleIds.forEach((triangleId) => {
		const triangleEdges = graph.edgesByTriangleId(triangleId);
		if (triangleEdges) {
			for (const edge of triangleEdges) {
				if (!startEdgeIds.has(edge.id) && (excluded == null || !excluded.has(edge.id))) {
					target.add(edge.id);
				}
			}
		}
	});
}
export function getFirstEdgeIdBetweenTriangles(graph: TriangleGraph, edgeIds: string[]) {
	for (const edgeId of edgeIds) {
		const edge = graph.edge(edgeId);
		if (edge && edge.triangleIds.length == 2) {
			return edgeId;
		}
	}
}
export function sortEdgesFromLargestToSmallest(edgeIds: string[], edgeLengthById: Map<string, number>) {
	edgeIds.sort((a, b) => {
		const lengthA = edgeLengthById.get(a)!;
		const lengthB = edgeLengthById.get(b)!;
		return lengthB - lengthA;
	});
}

export function triangleGraphFindNextLargest(
	edgeLengthById: Map<string, number>,
	graph: TriangleGraph,
	startEdgeId: string,
	visited: Readonly<Set<string>>
): string | undefined {
	_edgeIds0.clear();
	_edgeIds0.add(startEdgeId);
	triangleGraphExpandEdges(graph, _edgeIds0, _edgeIds1);
	triangleGraphExpandEdges(graph, _edgeIds1, _edgeIds2, _edgeIds0);

	setToArray(_edgeIds2, _edgeIdsArray);
	sortEdgesFromLargestToSmallest(_edgeIdsArray, edgeLengthById);

	for (const edgeId of _edgeIdsArray) {
		if (!visited.has(edgeId)) {
			return edgeId;
		}
	}
}

const SEED_OFFSET = 17.336;
export function triangleGraphFindExpandedEdge(
	edgeLengthById: Map<string, number>,
	graph: TriangleGraph,
	startEdgeId: string,
	seed: number,
	step: number,
	irregularAmount: number,
	visited: Readonly<Set<string>>,
	randomSample3: (step: number) => string | undefined
): string | undefined {
	const seed0 = randFloat(seed + step);

	const _sampleFromEdges2 = () => {
		const seed1 = randFloat(seed + step + SEED_OFFSET);
		//
		_edgeIds0.clear();
		_edgeIds0.add(startEdgeId);
		triangleGraphExpandEdges(graph, _edgeIds0, _edgeIds1);
		triangleGraphExpandEdges(graph, _edgeIds1, _edgeIds2, _edgeIds0);
		//
		setDifference(_edgeIds2, visited, _notVisited);
		setToArray(_notVisited, _edgeIdsArray);
		if (seed1 > irregularAmount) {
			sortEdgesFromLargestToSmallest(_edgeIdsArray, edgeLengthById);
			return _edgeIdsArray[0];
		} else {
			return sample(_edgeIdsArray, seed);
		}
	};

	return seed0 > irregularAmount ? _sampleFromEdges2() : randomSample3(step);
}
