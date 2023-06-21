import {Vector3, Triangle} from 'three';
import {MeshWithBVHGeometry} from '../../bvh/ThreeMeshBVHHelper';
import {TetGeometry} from '../TetGeometry';
import {TET_VERTICES_V_BASE, TetNeighbourDataWithSource} from '../TetCommon';
import {findTetContainingPosition} from './findTetContainingPosition';
import {logRedBg} from './../../../logger/Console';
import {tetCenter} from './tetCenter';
import {
	findNonDelaunayTetsFromSinglePointCheck,
	findNonDelaunayTetsFromMultiplePointsCheck,
} from './findNonDelaunayTets';
import {isPositionInsideMesh} from './tetInsideMesh';
import {setFirstValue} from '../../../SetUtils';

const _v = new Vector3();
const _triangle = new Triangle();
const _faceNormal = new Vector3();
const _newPtDelta = new Vector3();
const _containingTetSearchRayOrigin = new Vector3();
const sharedFacesNeighbourData: Set<TetNeighbourDataWithSource> = new Set();
const invalidTets: number[] = [];

export type TetEdge = [number, number, number, number];

export enum PointsTraversalMethod {
	MERGE = 'merge',
	MESH_FIRST = 'mesh first',
	ADDITIONAL_FIRST = 'additional first',
}
export const POINTS_TRAVERSAL_METHODS: PointsTraversalMethod[] = [
	PointsTraversalMethod.MERGE,
	PointsTraversalMethod.MESH_FIRST,
	PointsTraversalMethod.ADDITIONAL_FIRST,
];

// export enum TetCreationStage {
// 	POINTS_INSIDE = 'pointsInside',
// 	TETS = 'tets',
// }
// export const TET_CREATION_STAGES: TetCreationStage[] = [TetCreationStage.POINTS_INSIDE, TetCreationStage.TETS];

interface TetrahedralizeOptions {
	traversalMethod: PointsTraversalMethod;
	axisSort: Vector3;
	mesh: MeshWithBVHGeometry;
	additionalPoints: Vector3[];
	// resolution: Vector3,
	// minQuality: number;
	// oneFacePerTet: params.oneFacePerTet,
	// scale: params.tetScale,
	//
	// stage: TetCreationStage;
	stage: number | null;
	deleteOutsideTets: boolean;
}

function addPoint(
	tetGeometry: TetGeometry,
	newPointPosition: Vector3,
	searchStartPosition: Vector3,
	tetIdOrigin: number,
	stage: number | null
) {
	// logGreenBg(`--- adding point ${tetGeometry.pointsCount() + 1} (stage: ${_stage}) ---`);
	// 1. find tetrahedron containing the point
	const tetId = findTetContainingPosition(tetGeometry, newPointPosition, searchStartPosition, tetIdOrigin);
	if (tetId == null) {
		return;
	}

	// 2. find tetrahedrons that violate delaunay condition
	// if (0 + 0) {
	findNonDelaunayTetsFromSinglePointCheck(tetGeometry, tetId, newPointPosition, invalidTets);
	// } else {
	// findNonDelaunayTetsFromMultiplePointsCheck(tetGeometry, invalidTets);
	// }

	// 3. remove tetrahedrons
	// console.log(
	// 	`removing ${invalidTets.length} tets`,
	// 	tetId,
	// 	[...invalidTets].sort((a, b) => (a > b ? 1 : -1)).join(', '),
	// 	_stage
	// 	// `(${tetGeometry.tetsCount()} tets)`
	// );
	tetGeometry.removeTets(invalidTets, sharedFacesNeighbourData, newPointPosition);
	// console.log(`after remove: ${tetGeometry.tetsCount()} tets`);
	_stage++;
	if (stage != null && _stage > stage) {
		return tetGeometry;
	}

	// 4. replace with new tetrahedrons
	const pointId = tetGeometry.addPoint(newPointPosition.x, newPointPosition.y, newPointPosition.z);

	// let addedTetsCount = 0;
	sharedFacesNeighbourData.forEach((sharedFacesNeighbourData) => {
		_stage++;
		if (stage != null && _stage > stage) {
			return tetGeometry;
		}
		const id0 = sharedFacesNeighbourData.pointIds[0];
		const id1 = sharedFacesNeighbourData.pointIds[1];
		const id2 = sharedFacesNeighbourData.pointIds[2];
		const pt0 = tetGeometry.points.get(id0);
		const pt1 = tetGeometry.points.get(id1);
		const pt2 = tetGeometry.points.get(id2);
		// check that we orient the tetrahedron correctly
		if (pt0 && pt1 && pt2) {
			_triangle.a.copy(pt0.position);
			_triangle.b.copy(pt1.position);
			_triangle.c.copy(pt2.position);
			_triangle.getNormal(_faceNormal);
			_newPtDelta.copy(newPointPosition).sub(_triangle.a);
			const dot = _newPtDelta.dot(_faceNormal);
			if (dot > 0) {
				tetGeometry.addTetrahedron(id0, id1, id2, pointId);
			} else {
				tetGeometry.addTetrahedron(pointId, id0, id1, id2);
			}
			// addedTetsCount++;
		}
	});
	// console.log('added ', addedTetsCount);
	if (stage != null && _stage > stage) {
		return tetGeometry;
	}

	// 5. another pass
	findNonDelaunayTetsFromMultiplePointsCheck(tetGeometry, invalidTets);

	if (invalidTets.length > 0) {
		logRedBg(
			`found ${invalidTets.length} invalid tets (point: ${tetGeometry.pointsCount()}):${[...invalidTets].join(
				', '
			)}`
		);
	}
}

const _outsideTestPos = new Vector3();
function removeOutsideTets(
	tetGeometry: TetGeometry,
	mesh: MeshWithBVHGeometry,
	deleteOutsideTets: boolean
): TetGeometry {
	if (!deleteOutsideTets) {
		return tetGeometry;
	}
	const outsideIds: number[] = [];
	tetGeometry.tetrahedrons.forEach((tet, tetId) => {
		tetCenter(tetGeometry, tetId, _outsideTestPos);
		const isInside = isPositionInsideMesh(_outsideTestPos, mesh, 0.001);
		if (!isInside) {
			outsideIds.push(tetId);
		}
	});
	tetGeometry.removeTets(outsideIds);
	console.log('final stage', _stage);
	return tetGeometry;
}

function prepareInputPoints(options: TetrahedralizeOptions): Vector3[] {
	const {traversalMethod, mesh, additionalPoints} = options;
	const {geometry} = mesh;
	const inputPoints: Vector3[] = [];

	switch (traversalMethod) {
		case PointsTraversalMethod.MERGE: {
			const geoPositionAttribute = geometry.attributes.position;
			const pointsCount = geoPositionAttribute.count;
			for (let i = 0; i < pointsCount; i++) {
				const newPos = new Vector3();
				newPos.fromBufferAttribute(geoPositionAttribute, i);
				inputPoints.push(newPos);
			}
			inputPoints.push(...additionalPoints);
			break;
		}
		case PointsTraversalMethod.MESH_FIRST: {
			const geoPositionAttribute = geometry.attributes.position;
			const pointsCount = geoPositionAttribute.count;
			for (let i = 0; i < pointsCount; i++) {
				const newPos = new Vector3();
				newPos.fromBufferAttribute(geoPositionAttribute, i);
				inputPoints.push(newPos);
			}
			//
			inputPoints.push(...additionalPoints);
			break;
		}
		case PointsTraversalMethod.ADDITIONAL_FIRST: {
			inputPoints.push(...additionalPoints);
			//
			const geoPositionAttribute = geometry.attributes.position;
			const pointsCount = geoPositionAttribute.count;
			for (let i = 0; i < pointsCount; i++) {
				const newPos = new Vector3();
				newPos.fromBufferAttribute(geoPositionAttribute, i);
				inputPoints.push(newPos);
			}

			break;
		}
	}

	// let i = 0;
	// for (let array of inputPoints) {
	// 	inputPoints[i] = array.sort((a, b) => (a.dot(axisSort) < b.dot(axisSort) ? -1 : 1));
	// 	i++;
	// }

	return inputPoints;
}
function getNearestPoint(inputPoints: Set<Vector3>, inputPoint: Vector3) {
	let nearestPoint: Vector3 | undefined;
	let nearestDistance = Infinity;
	inputPoints.forEach((point) => {
		const distance = point.distanceTo(inputPoint);
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestPoint = point;
		}
	});
	return nearestPoint;
}

let _stage = 0;
export function tetrahedralize(options: TetrahedralizeOptions): TetGeometry {
	// logBlueBg('tetrahedralize');
	_stage = 0;
	const {mesh, stage, deleteOutsideTets} = options;
	const {geometry} = mesh;
	const tetGeometry = new TetGeometry();

	geometry.computeBoundingSphere();
	const radius = geometry.boundingSphere?.radius || 1;

	// 1. add encompassing tet
	const s = 5.0 * radius;
	_v.copy(TET_VERTICES_V_BASE[0]).multiplyScalar(s);
	const id0 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[1]).multiplyScalar(s);
	const id1 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[2]).multiplyScalar(s);
	const id2 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[3]).multiplyScalar(s);
	const id3 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	const firstTetId = tetGeometry.addTetrahedron(id0, id1, id2, id3);
	if (firstTetId == null) {
		return tetGeometry;
	}
	_stage++;
	if (stage != null && _stage > stage) {
		return removeOutsideTets(tetGeometry, mesh, deleteOutsideTets);
	}

	// 2. sort input points
	const inputPoints = new Set(prepareInputPoints(options));

	// 3. add points inside
	tetCenter(tetGeometry, firstTetId, _containingTetSearchRayOrigin);
	let tetIdOrigin = firstTetId;

	// const geoPositionAttribute = geometry.attributes.position;
	// const pointsCount = geoPositionAttribute.count;
	let inputPoint = setFirstValue(inputPoints);
	while (inputPoint != null) {
		// logGreenBg(`addPoint ${_stage}`);
		// _pointPos.fromBufferAttribute(geoPositionAttribute, i);
		addPoint(tetGeometry, inputPoint, _containingTetSearchRayOrigin, tetIdOrigin, stage);

		// use center of last added tet as ray origin for next search
		const lastAddedTetId = tetGeometry.lastAddedTetId();
		if (lastAddedTetId != null) {
			tetCenter(tetGeometry, lastAddedTetId, _containingTetSearchRayOrigin);
			tetIdOrigin = lastAddedTetId;
		}

		_stage++;
		if (stage != null && _stage > stage) {
			return removeOutsideTets(tetGeometry, mesh, deleteOutsideTets);
		}
		// get nearest point
		inputPoints.delete(inputPoint);
		inputPoint = getNearestPoint(inputPoints, inputPoint);
	}

	// for (let inputPoint of inputPoints) {
	// 		// logGreenBg(`addPoint ${_stage}`);
	// 		// _pointPos.fromBufferAttribute(geoPositionAttribute, i);
	// 		addPoint(tetGeometry, inputPoint, _containingTetSearchRayOrigin, tetIdOrigin, stage);

	// 		// use center of last added tet as ray origin for next search
	// 		const lastAddedTetId = tetGeometry.lastAddedTetId();
	// 		if (lastAddedTetId != null) {
	// 			tetCenter(tetGeometry, lastAddedTetId, _containingTetSearchRayOrigin);
	// 			tetIdOrigin = lastAddedTetId;
	// 		}

	// 		_stage++;
	// 		if (stage != null && _stage > stage) {
	// 			return removeOutsideTets(tetGeometry, mesh, deleteOutsideTets);
	// 		}
	// }

	return removeOutsideTets(tetGeometry, mesh, deleteOutsideTets);
}
