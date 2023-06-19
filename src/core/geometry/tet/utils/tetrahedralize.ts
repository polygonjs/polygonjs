import {Vector3} from 'three';
import {MeshWithBVHGeometry} from '../../bvh/ThreeMeshBVHHelper';
import {TetGeometry} from '../TetGeometry';
import {TET_VERTICES_V_BASE, TET_FACE_POINT_INDICES, TetNeighbourDataWithSource} from '../TetCommon';
import {findTetContainingPosition} from './findTetContainingPosition';
import {logBlueBg, logGreenBg} from './../../../logger/Console';
import {tetCenter} from './tetCenter';
import {findNonDelaunayTets} from './findNonDelaunayTets';

const _v = new Vector3();
const _pointPos = new Vector3();
const _containingTetSearchRayOrigin = new Vector3();
const sharedFacesNeighbourData: Set<TetNeighbourDataWithSource> = new Set();
const invalidTets: Set<number> = new Set();

export type TetEdge = [number, number, number, number];

export const DIRS = [
	new Vector3(1.0, 0.0, 0.0),
	new Vector3(-1.0, 0.0, 0.0),
	new Vector3(0.0, 1.0, 0.0),
	new Vector3(0.0, -1.0, 0.0),
	new Vector3(0.0, 0.0, 1.0),
	new Vector3(0.0, 0.0, -1.0),
];

// export enum TetCreationStage {
// 	POINTS_INSIDE = 'pointsInside',
// 	TETS = 'tets',
// }
// export const TET_CREATION_STAGES: TetCreationStage[] = [TetCreationStage.POINTS_INSIDE, TetCreationStage.TETS];

interface TetrahedralizeOptions {
	mesh: MeshWithBVHGeometry;
	// resolution: Vector3,
	minQuality: number;
	// oneFacePerTet: params.oneFacePerTet,
	// scale: params.tetScale,
	//
	// stage: TetCreationStage;
	stage: number | null;
}

function addPoint(tetGeometry: TetGeometry, position: Vector3, searchStartPosition: Vector3, tetIdOrigin: number) {
	logGreenBg('_splitTetObject');
	console.log(searchStartPosition.toArray(), position.toArray());
	// 1. find tetrahedron containing the point
	const tetId = findTetContainingPosition(tetGeometry, position, searchStartPosition, tetIdOrigin);
	if (tetId == null) {
		return;
	}
	console.log({tetId});

	// 2. find tetrahedrons that violate delaunay condition
	findNonDelaunayTets(tetGeometry, tetId, position, invalidTets);
	console.log({size: invalidTets.size, values: [...invalidTets.values()]});

	// 3. remove tetrahedrons
	console.log('removing tetId', tetId);
	tetGeometry.removeTet(tetId, sharedFacesNeighbourData);

	// 4. replace with new tetrahedrons
	const pointId = tetGeometry.addPoint(position.x, position.y, position.z);
	sharedFacesNeighbourData.forEach((neighbourDataWithSource) => {
		const pointIndices = TET_FACE_POINT_INDICES[neighbourDataWithSource.faceIndex];
		const id0 = neighbourDataWithSource.tetPointIds[pointIndices[0]];
		const id1 = neighbourDataWithSource.tetPointIds[pointIndices[1]];
		const id2 = neighbourDataWithSource.tetPointIds[pointIndices[2]];
		tetGeometry.addTetrahedron(pointId, id0, id1, id2);
	});
}

let _stage = 0;
export function tetrahedralize(options: TetrahedralizeOptions): TetGeometry {
	logBlueBg('tetrahedralize');
	_stage = 0;
	const {mesh, stage} = options;
	const {geometry} = mesh;
	const tetGeometry = new TetGeometry();

	geometry.computeBoundingSphere();
	const radius = geometry.boundingSphere?.radius || 1;

	// add encompassing tet
	const s = 5.0 * radius;
	_v.copy(TET_VERTICES_V_BASE[0]).multiplyScalar(s);
	const id0 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[1]).multiplyScalar(s);
	const id1 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[2]).multiplyScalar(s);
	const id2 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	_v.copy(TET_VERTICES_V_BASE[3]).multiplyScalar(s);
	const id3 = tetGeometry.addPoint(_v.x, _v.y, _v.z);
	tetGeometry.addTetrahedron(id0, id1, id2, id3);
	_stage++;
	if (stage != null && _stage > stage) {
		return tetGeometry;
	}

	// add points inside
	const firstTetId = tetGeometry.firstTetId();
	if (firstTetId == null) {
		return tetGeometry;
	}
	tetCenter(tetGeometry, firstTetId, _containingTetSearchRayOrigin);
	console.log({firstTetId});
	let tetIdOrigin = firstTetId;

	const geoPositionAttribute = geometry.attributes.position;
	const pointsCount = geoPositionAttribute.count;
	for (let i = 0; i < pointsCount; i++) {
		_pointPos.fromBufferAttribute(geoPositionAttribute, i);
		addPoint(tetGeometry, _pointPos, _containingTetSearchRayOrigin, tetIdOrigin);

		// use center of last added tet as ray origin for next search
		const lastAddedTetId = tetGeometry.lastAddedTetId();
		console.log({lastAddedTetId});
		if (lastAddedTetId != null) {
			tetCenter(tetGeometry, lastAddedTetId, _containingTetSearchRayOrigin);
			tetIdOrigin = lastAddedTetId;
		}

		_stage++;
		if (stage != null && _stage > stage) {
			return tetGeometry;
		}
	}

	return tetGeometry;
}
