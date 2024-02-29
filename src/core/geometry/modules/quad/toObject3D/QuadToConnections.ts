import {LineBasicMaterial, Color, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams} from '../QuadCommon';
import {QuadPrimitive} from '../QuadPrimitive';
import {prepareObject} from './QuadToObject3DCommon';
import {halfEdgeIndicesInCommonBetweenQuads, pointInCommonBetweenQuadsSharingPoint} from '../graph/QuadGraphUtils';
import {HalfEdgeIndices} from '../graph/QuadGraphCommon';
import {QuadGraph} from '../graph/QuadGraph';
import {CoreGeometryBuilderMerge} from '../../three/builders/Merge';
import {arrayDifference} from '../../../../ArrayUtils';

// const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
// const _p2 = new Vector3();
// const _p3 = new Vector3();
const _neighbourIdsSharingEdge: number[] = [];
const _neighbourIdsSharingPoint: number[] = [];
const _neighbourIdsSharingPointOnly: number[] = [];
const _center = new Vector3();
const _halfEdgeIndices: HalfEdgeIndices = {
	index0: -1,
	index1: -1,
};
const _quadCenter0 = new Vector3();
const _quadCenter1 = new Vector3();
// const _neighbourData: NeighbourData = {
// 	quadNode: null,
// 	neighbourIndex: null,
// };
// const _indices: HalfEdgeIndices = {
// 	index0: -1,
// 	index1: -1,
// };

const _lineMaterialByColorStyle: Map<string, LineBasicMaterial> = new Map();
function _createOrFindLineMaterial(color: Color) {
	let material = _lineMaterialByColorStyle.get(color.getStyle());
	if (!material) {
		material = new LineBasicMaterial({
			color,
			linewidth: 1,
		});
		_lineMaterialByColorStyle.set(color.getStyle(), material);
	}
	return material;
}

export function quadToConnections(quadObject: QuadObject, graph: QuadGraph, options: QUADTesselationParams) {
	const {connectionsBetweenQuadsSharingEdge, connectionsBetweenQuadsSharingPointOnly, connectionsColor} = options;
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	// const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	const geometries: BufferGeometry[] = [];
	if (connectionsBetweenQuadsSharingEdge) {
		for (let quadId0 = 0; quadId0 < quadsCount; quadId0++) {
			QuadPrimitive.position(quadObject, quadId0, _quadCenter0);
			graph.neighbourIdsSharingEdge(quadId0, _neighbourIdsSharingEdge);
			for (const neighbourId of _neighbourIdsSharingEdge) {
				if (neighbourId > quadId0) {
					QuadPrimitive.position(quadObject, neighbourId, _quadCenter1);

					const geometry = new BufferGeometry();
					halfEdgeIndicesInCommonBetweenQuads({
						quadObject,
						quadId0,
						quadId1: neighbourId,
						target: _halfEdgeIndices,
					});
					_p0.fromArray(srcPositions, _halfEdgeIndices.index0 * 3);
					_p1.fromArray(srcPositions, _halfEdgeIndices.index1 * 3);
					_center.copy(_p0).add(_p1).multiplyScalar(0.5);

					const positions: Float32Array = new Float32Array(9);
					_quadCenter0.toArray(positions, 0);
					_center.toArray(positions, 3);
					_quadCenter1.toArray(positions, 6);

					geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
					geometry.setIndex([0, 1, 1, 2]);
					geometries.push(geometry);
				}
			}
		}
	}
	if (connectionsBetweenQuadsSharingPointOnly) {
		for (let quadId0 = 0; quadId0 < quadsCount; quadId0++) {
			QuadPrimitive.position(quadObject, quadId0, _quadCenter0);
			graph.neighbourIdsSharingEdge(quadId0, _neighbourIdsSharingEdge);
			graph.neighbourIdsSharingPoint(quadId0, _neighbourIdsSharingPoint);
			arrayDifference(_neighbourIdsSharingPoint, _neighbourIdsSharingEdge, _neighbourIdsSharingPointOnly);
			for (const neighbourId of _neighbourIdsSharingPointOnly) {
				if (neighbourId > quadId0) {
					QuadPrimitive.position(quadObject, neighbourId, _quadCenter1);
					const sharedPointId = pointInCommonBetweenQuadsSharingPoint(graph, quadId0, neighbourId);
					if (sharedPointId != null) {
						const geometry = new BufferGeometry();
						_center.fromArray(srcPositions, sharedPointId * 3);
						const positions: Float32Array = new Float32Array(9);
						_quadCenter0.toArray(positions, 0);
						_center.toArray(positions, 3);
						_quadCenter1.toArray(positions, 6);
						geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
						geometry.setIndex([0, 1, 1, 2]);
						geometries.push(geometry);
					}
				}
			}
		}
	}
	const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
	const material = _createOrFindLineMaterial(connectionsColor);
	const lineSegments = new LineSegments(mergedGeometry, material);

	prepareObject(lineSegments, {shadow: false});
	return lineSegments;
}
