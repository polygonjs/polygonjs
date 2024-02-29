import {Vector4} from 'three';
import {QuadObject} from '../QuadObject';
import {QuadPrimitive} from '../QuadPrimitive';
import {QuadGraph} from './QuadGraph';
import {Number4} from '../../../../../types/GlobalTypes';
import {arrayDifference} from '../../../../ArrayUtils';
import {HalfEdgeIndices} from './QuadGraphCommon';

const _v4 = new Vector4();
const _v40 = new Vector4();
const _v41 = new Vector4();
const _quad0IndicesSet = new Set<number>();

export function quadGraphFromQuadObject(object: QuadObject) {
	const quadGraph = new QuadGraph();
	const indices = object.geometry.index;
	const primitivesCount = QuadPrimitive.entitiesCount(object);
	for (let i = 0; i < primitivesCount; i++) {
		_v4.fromArray(indices, i * 4);
		quadGraph.addQuad(i, _v4.toArray() as Number4);
	}
	return quadGraph;
}

const _neighbourIdsSharingEdge: number[] = [];
const _neighbourIdsSharingPoint: number[] = [];
export function quadGraphDirectDiagonalTiles(graph: QuadGraph, quadId: number, target: number[]) {
	graph.neighbourIdsSharingPoint(quadId, _neighbourIdsSharingPoint);
	graph.neighbourIdsSharingEdge(quadId, _neighbourIdsSharingEdge);
	arrayDifference(_neighbourIdsSharingPoint, _neighbourIdsSharingEdge, target);
}

interface HalfEdgeIndicesInCommonBetweenQuadsOptions {
	quadObject: QuadObject;
	quadId0: number;
	quadId1: number;
	target: HalfEdgeIndices;
}
export function halfEdgeIndicesInCommonBetweenQuads(options: HalfEdgeIndicesInCommonBetweenQuadsOptions) {
	const {quadObject, quadId0, quadId1, target} = options;
	const srcIndices = quadObject.geometry.index;

	_v40.fromArray(srcIndices, quadId0 * 4);
	_v41.fromArray(srcIndices, quadId1 * 4);
	_quad0IndicesSet.clear();

	_quad0IndicesSet.add(_v40.x);
	_quad0IndicesSet.add(_v40.y);
	_quad0IndicesSet.add(_v40.z);
	_quad0IndicesSet.add(_v40.w);

	let firstPointAdded = false;
	if (_quad0IndicesSet.has(_v41.x)) {
		target.index0 = _v41.x;
		firstPointAdded = true;
	}
	if (_quad0IndicesSet.has(_v41.y)) {
		if (firstPointAdded) {
			target.index1 = _v41.y;
			return;
		}
		target.index0 = _v41.y;
		firstPointAdded = true;
	}
	if (_quad0IndicesSet.has(_v41.z)) {
		if (firstPointAdded) {
			target.index1 = _v41.z;
			return;
		}
		target.index0 = _v41.z;
		firstPointAdded = true;
	}
	if (_quad0IndicesSet.has(_v41.w)) {
		if (firstPointAdded) {
			target.index1 = _v41.w;
			return;
		}
		target.index0 = _v41.w;
		firstPointAdded = true;
	}
}
export function pointInCommonBetweenQuadsSharingPoint(graph: QuadGraph, quadId0: number, quadId1: number) {
	const quadNode0 = graph.quadNode(quadId0);
	const quadNode1 = graph.quadNode(quadId1);
	if (quadNode0 == null || quadNode1 == null) {
		return;
	}

	const indices0 = quadNode0.indices;
	const indices1 = quadNode1.indices;
	for (const index0 of indices0) {
		for (const index1 of indices1) {
			if (index0 == index1) {
				return index0;
			}
		}
	}
}
