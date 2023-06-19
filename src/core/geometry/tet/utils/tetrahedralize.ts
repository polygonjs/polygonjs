import {Vector3} from 'three';
import {MeshWithBVHGeometry} from '../../bvh/ThreeMeshBVHHelper';
import {TetGeometry} from '../TetGeometry';
import {TET_VERTICES_V_BASE, TET_FACE_POINT_INDICES, TetNeighbourDataWithSource} from '../TetCommon';
import {findTetContainingPosition} from './findTetContainingPosition';

const _v = new Vector3();
const sharedFacesNeighbourData: Set<TetNeighbourDataWithSource> = new Set();

export type TetEdge = [number, number, number, number];

export const DIRS = [
	new Vector3(1.0, 0.0, 0.0),
	new Vector3(-1.0, 0.0, 0.0),
	new Vector3(0.0, 1.0, 0.0),
	new Vector3(0.0, -1.0, 0.0),
	new Vector3(0.0, 0.0, 1.0),
	new Vector3(0.0, 0.0, -1.0),
];

export enum TetCreationStage {
	POINTS_INSIDE = 'pointsInside',
	TETS = 'tets',
}
export const TET_CREATION_STAGES: TetCreationStage[] = [TetCreationStage.POINTS_INSIDE, TetCreationStage.TETS];

interface TetrahedralizeOptions {
	mesh: MeshWithBVHGeometry;
	// resolution: Vector3,
	minQuality: number;
	// oneFacePerTet: params.oneFacePerTet,
	// scale: params.tetScale,
	//
	stage: TetCreationStage;
	subStage: number;
}

function addPoint(tetGeometry: TetGeometry, position: Vector3) {
	console.log('_splitTetObject', position.toArray());
	// 1. find tetrahedron containing the point
	const firstId = tetGeometry.firstTetId();
	if (firstId == null) {
		return;
	}
	const tetId = findTetContainingPosition(tetGeometry, position, firstId);
	console.log({tetId});

	// 2. remove tetrahedron
	if (tetId == null) {
		return;
	}
	tetGeometry.removeTet(tetId, sharedFacesNeighbourData);

	// 3. replace with new tetrahedrons
	const pointId = tetGeometry.addPoint(position.x, position.y, position.z);
	sharedFacesNeighbourData.forEach((neighbourDataWithSource) => {
		const pointIndices = TET_FACE_POINT_INDICES[neighbourDataWithSource.faceIndex];
		const id0 = neighbourDataWithSource.tetPointIds[pointIndices[0]];
		const id1 = neighbourDataWithSource.tetPointIds[pointIndices[1]];
		const id2 = neighbourDataWithSource.tetPointIds[pointIndices[2]];
		tetGeometry.addTetrahedron(pointId, id0, id1, id2);
	});
}

export function tetrahedralize(options: TetrahedralizeOptions): TetGeometry {
	const {mesh} = options;
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

	// add points inside
	const geoPositionAttribute = geometry.attributes.position;
	const pointsCount = geoPositionAttribute.count;
	console.log({pointsCount});
	for (let i = 0; i < pointsCount; i++) {
		_v.fromBufferAttribute(geoPositionAttribute, i);
		addPoint(tetGeometry, _v);
	}

	return tetGeometry;
}
