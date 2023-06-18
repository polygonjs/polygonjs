import {BufferGeometry, Float32BufferAttribute, Matrix4, Vector3} from 'three';
import {randEps, isInside, IsInsideOptions} from './TetrahedronUtils';
import {createTetIds} from './TetrahedronCreateTetId';
import {TetCreationStage} from './TetrahedronConstant';
import {MeshWithBVHGeometry} from '../bvh/ThreeMeshBVHHelper';
import {range} from '../../ArrayUtils';
import {TET_FACE_POINT_INDICES} from '../tet/TetCommon';

interface CreateTetsOptions {
	mesh: MeshWithBVHGeometry;
	resolution: number;
	minQuality: number;
	oneFacePerTet: boolean;
	scale: number;
	//
	stage: TetCreationStage;
	subStage: number;
	removeOutsideTets: boolean;
}
const POS_INF = Number.POSITIVE_INFINITY;
const NEG_INF = Number.NEGATIVE_INFINITY;
const _v3 = new Vector3();
const dims = new Vector3();
const center = new Vector3();
const bmin = new Vector3(POS_INF, POS_INF, POS_INF);
const bmax = new Vector3(NEG_INF, NEG_INF, NEG_INF);
const _p = new Vector3();
const invMat = new Matrix4();

interface CreateMeshOptions {
	positions: number[];
	indices: number[];
}
function _createMesh(options: CreateMeshOptions) {
	const {positions, indices} = options;
	const newGeometry = new BufferGeometry();
	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	newGeometry.computeVertexNormals();
	console.log({positions, indices, normals: newGeometry.getAttribute('normal').array});
	return newGeometry;
}
interface CreatePointOptions {
	positions: number[];
	indices: number[];
}
export function _createPoints(options: CreatePointOptions) {
	const {positions, indices} = options;
	const newGeometry = new BufferGeometry();
	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	return newGeometry;
}
export function _vector3sToArray(vectors: Vector3[]) {
	const array: number[] = [];
	for (const vector of vectors) {
		array.push(vector.x, vector.y, vector.z);
	}
	return array;
}
interface CreatePointsGeometryOptions {
	tetVerts: Vector3[];
}
export function _createPointsGeometry(options: CreatePointsGeometryOptions) {
	const {tetVerts} = options;
	const pointPositions = _vector3sToArray(tetVerts);
	const pointsCount = tetVerts.length;
	const pointsIndices = range(pointsCount);
	return _createPoints({positions: pointPositions, indices: pointsIndices});
}

export function createTets(options: CreateTetsOptions) {
	const {mesh, resolution, minQuality, oneFacePerTet, scale, stage, subStage, removeOutsideTets} = options;

	// tetMesh = bpy.data.meshes.new('Tets');
	// bm = bmesh.new();
	const newGeometryPositions: number[] = [];

	// create vertices

	// from input mesh

	const tetVerts: Vector3[] = [];

	//for v in obj.data.vertices:
	//    tetVerts.append(mathutils.Vector((v.co[0] + randEps(), v.co[1] + randEps(), v.co[2] + randEps())))
	invMat.copy(mesh.matrixWorld).invert();
	const geometry = mesh.geometry;
	const positionAttrib = geometry.attributes.position;
	const srcPointsCount = positionAttrib.count;
	for (let i = 0; i < srcPointsCount; i += 3) {
		const pos = new Vector3();
		pos.fromArray(positionAttrib.array, i);
		pos.x += randEps();
		pos.y += randEps();
		pos.z += randEps();
		tetVerts.push(pos);
	}
	console.log('A', {tetVerts: tetVerts.map((v) => v.toArray())});

	// measure vertices

	center.set(0.0, 0.0, 0.0);
	bmin.set(POS_INF, POS_INF, POS_INF);
	bmax.set(NEG_INF, NEG_INF, NEG_INF);

	for (const tetVert of tetVerts) {
		// center.add(tetVert);

		bmin.x = Math.min(bmin.x, tetVert.x);
		bmin.y = Math.min(bmin.y, tetVert.y);
		bmin.z = Math.min(bmin.z, tetVert.z);

		bmax.x = Math.max(bmax.x, tetVert.x);
		bmax.y = Math.max(bmax.y, tetVert.y);
		bmax.z = Math.max(bmax.z, tetVert.z);
	}
	center.divideScalar(tetVerts.length);

	// TODO: use three.js sphere
	let radius = 0;
	for (const tetVert of tetVerts) {
		const d = _v3.copy(tetVert).sub(center).length();
		radius = Math.max(radius, d);
	}

	// interior sampling
	const isInsideOptions: IsInsideOptions = {
		invMat,
		mesh,
		p: new Vector3(),
		minDist: 0,
	};

	if (resolution > 0) {
		dims.copy(bmax).sub(bmin);
		const dim = Math.max(dims.x, Math.max(dims.y, dims.z));
		const h = dim / resolution;
		const xMax = Math.floor(dims.x / h) + 1;
		const yMax = Math.floor(dims.y / h) + 1;
		const zMax = Math.floor(dims.z / h) + 1;
		// let _currentSubStage = 0;
		for (let xi = 0; xi < xMax; xi++) {
			//
			const x = bmin.x + xi * h + randEps();
			for (let yi = 0; yi < yMax; yi++) {
				//
				const y = bmin.y + yi * h + randEps();
				for (let zi = 0; zi < zMax; zi++) {
					//
					// if (stage > 0 || _currentSubStage < subStage) {
					const z = bmin.z + zi * h + randEps();
					const p = _v3.set(x, y, z);
					isInsideOptions.p = p;
					isInsideOptions.minDist = 0.5 * h;
					if (isInside(isInsideOptions)) {
						tetVerts.push(p.clone());
					}
					// }
					// _currentSubStage++;
				}
			}
		}
	}

	// big tet to start with

	const s = 5.0 * radius;
	tetVerts.push(new Vector3(-s, 0.0, -s));
	tetVerts.push(new Vector3(s, 0.0, -s));
	tetVerts.push(new Vector3(0.0, s, s));
	tetVerts.push(new Vector3(0.0, -s, s));
	console.log('B', {tetVerts: tetVerts.map((v) => v.toArray())});

	if (stage == TetCreationStage.POINTS_INSIDE) {
		return _createPointsGeometry({tetVerts});
	}

	const result = createTetIds({
		invMat,
		mesh,
		verts: tetVerts,
		minQuality,
		stage,
		subStage,
		removeOutsideTets,
	});
	const faces = result.tetIds;
	console.log({faces, tetVerts});
	console.log('C', {tetVerts: tetVerts.map((v) => v.toArray())});
	console.log('C', {faces: [...faces]});

	const numTets = Math.floor(faces.length / 4);
	console.log({numTets});

	const newGeometryIndices: number[] = [];

	if (oneFacePerTet) {
		const numPoints = tetVerts.length - 4;
		// copy src points without distortion
		// for (let i = 0; i < srcPointsCount; i++) {
		// 	_p.fromBufferAttribute(positionAttrib, i);
		// 	newGeometryPositions.push(_p.x, _p.y, _p.z);
		// 	// newGeometryIndices.push(newGeometryIndices.length);
		// }
		for (let i = srcPointsCount; i < numPoints; i++) {
			const p = tetVerts[i];
			newGeometryPositions.push(p.x, p.y, p.z);
			// newGeometryIndices.push(newGeometryIndices.length);
			// bm.verts.new((p.x, p.y, p.z));
		}
	} else {
		for (let i = 0; i < numTets; i++) {
			const i4 = 4 * i;
			center
				.copy(tetVerts[faces[i4]])
				.add(tetVerts[faces[i4 + 1]])
				.add(tetVerts[faces[i4 + 2]])
				.add(tetVerts[faces[i4 + 3]])
				.multiplyScalar(0.25);
			// console.log(i, center.toArray(), i4, faces[i4], tetVerts[faces[i4]]);
			for (let j = 0; j < 4; j++) {
				for (let k = 0; k < 3; k++) {
					const vertexId = faces[i4 + TET_FACE_POINT_INDICES[j][k]];
					// console.log({j, k, vertexId});
					_p.copy(tetVerts[vertexId]).sub(center).multiplyScalar(scale).add(center);
					// _p.copy(center).add(p.sub(center).multiplyScalar(scale));
					newGeometryPositions.push(_p.x, _p.y, _p.z);
					newGeometryIndices.push(newGeometryIndices.length);
					// newGeometryIndices.push(id0, id1, id2);
				}
			}
		}
	}

	// bm.verts.ensure_lookup_table()
	// const newPointsCount = newGeometryPositions.length / 3
	// const newGeometryIndices: number[] = []; //new Array(newPointsCount)
	// for(let i=0;i<newPointsCount;i++){
	//     newGeometryIndices[i]=(i)
	// }

	if (oneFacePerTet) {
		for (let i = 0; i < numTets; i++) {
			// if (i < subStage) {
			// const id0 = faces[4 * i];
			// const id1 = faces[4 * i + 1];
			// const id2 = faces[4 * i + 2];
			// const id3 = faces[4 * i + 3];
			// newGeometryIndices.push(id0, id1, id2);
			// newGeometryIndices.push(id3, id2, id1);
			// bm.faces.new([bm.verts[id0], bm.verts[id1], bm.verts[id2], bm.verts[id3]])
			// }
			const i4 = 4 * i;
			for (let j = 0; j < 4; j++) {
				for (let k = 0; k < 3; k++) {
					const vertexId = faces[i4 + TET_FACE_POINT_INDICES[j][k]];
					// console.log({j, k, vertexId});
					console.log({j, k, vertexId});
					_p.copy(tetVerts[vertexId]);
					// _p.copy(center).add(p.sub(center).multiplyScalar(scale));
					newGeometryPositions.push(_p.x, _p.y, _p.z);
					newGeometryIndices.push(newGeometryIndices.length);
					// newGeometryIndices.push(id0, id1, id2);
				}
			}
		}
	} else {
		// let nr = 0;
		// for (let i = 0; i < numTets; i++) {
		// 	for (let j = 0; j < 4; j++) {
		// 		// bm.faces.new([bm.verts[nr], bm.verts[nr + 1], bm.verts[nr + 2]])
		// 		// newGeometryIndices.push(nr, nr + 1, nr + 2);
		// 		nr = nr + 3;
		// 	}
		// }
	}

	return _createMesh({positions: newGeometryPositions, indices: newGeometryIndices});
}
