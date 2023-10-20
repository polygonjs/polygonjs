import {setUnion, setToArray, setDifference} from '../../../../../SetUtils';
import {TriangleGraph} from './TriangleGraph';
import {randFloat} from '../../../../../math/_Module';
import {sample} from '../../../../../ArrayUtils';

const _triangleIds: Set<number> = new Set();
const _edgeIds0 = new Set<string>();
const _edgeIds1 = new Set<string>();
const _edgeIds2 = new Set<string>();
const _edgeIds3 = new Set<string>();
const _edgeIds10 = new Set<string>();
const _notVisited = new Set<string>();
const _edgeIdsArray: string[] = [];

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

export function triangleGraphFindExpandedEdge(
	graph: TriangleGraph,
	startEdgeId: string,
	seed: number,
	step: number,
	irregularAmount: number,
	visited: Readonly<Set<string>>
): string | undefined {
	_edgeIds0.clear();
	_edgeIds0.add(startEdgeId);
	triangleGraphExpandEdges(graph, _edgeIds0, _edgeIds1);
	triangleGraphExpandEdges(graph, _edgeIds1, _edgeIds2, _edgeIds0);

	const _sampleFromEdges2 = () => {
		// console.log('2:', [...setToArray(_edgeIds2, [])].sort().join(', '));
		setDifference(_edgeIds2, visited, _notVisited);
		setToArray(_notVisited, _edgeIdsArray);
		return sample(_edgeIdsArray, seed);
	};
	const _sampleFromEdges3 = () => {
		setUnion(_edgeIds0, _edgeIds1, _edgeIds10);
		triangleGraphExpandEdges(graph, _edgeIds2, _edgeIds3, _edgeIds10);
		// console.log('3:', [...setToArray(_edgeIds3, [])].sort().join(', '));
		setDifference(_edgeIds3, visited, _notVisited);
		setToArray(_notVisited, _edgeIdsArray);
		return sample(_edgeIdsArray, seed);
	};

	const foundEdgeId = randFloat(seed + step) > irregularAmount ? _sampleFromEdges2() : _sampleFromEdges3();
	// if (foundEdgeId == startEdgeId) {
	// 	console.log({foundEdgeId, startEdgeId});
	// 	throw 'no';
	// }
	// console.log({foundEdgeId, startEdgeId});
	return foundEdgeId;
}
