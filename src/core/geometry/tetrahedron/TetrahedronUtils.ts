// import {Vector3, Matrix4, BackSide} from 'three';
// import {DIRS, TetEdge} from './TetrahedronConstant';
// import {createRaycaster} from '../../RaycastHelper';
// import {MeshWithBVHGeometry} from '../bvh/ThreeMeshBVHHelper';

// export interface IsInsideOptions {
// 	invMat: Matrix4;
// 	mesh: MeshWithBVHGeometry;
// 	p: Vector3;
// 	minDist: number;
// }

// const raycaster = createRaycaster();

// export function isInside(options: IsInsideOptions): boolean {
// 	const {mesh, invMat, p, minDist} = options;
// 	let numIn: number = 0;

// 	const bvh = mesh.geometry.boundsTree;
// 	raycaster.ray.origin.copy(p);

// 	for (const dir of DIRS) {
// 		raycaster.ray.direction.copy(dir);
// 		raycaster.ray.applyMatrix4(invMat);
// 		const hit = bvh.raycastFirst(raycaster.ray, BackSide);
// 		if (hit) {
// 			const {normal, distance} = hit;

// 			if (normal) {
// 				normal.applyMatrix4(mesh.matrixWorld);
// 				// we test that the normal is facing the other way as the ray,
// 				// since the raycast is tested with BackSide.
// 				// and we can't test with FrontSide as this does not return an intersection
// 				// nor with DoubleSide as we can't tell if the normal is negated or not
// 				if (normal.dot(dir) <= 0.0) {
// 					numIn++;
// 				}
// 				if (minDist > 0.0 && distance < minDist) {
// 					return false;
// 				}
// 			}
// 		}
// 	}
// 	return numIn > 3;
// }

// const b = new Vector3();
// const c = new Vector3();
// const d = new Vector3();
// export function getCircumCenter(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, target: Vector3) {
// 	b.copy(p1).sub(p0);
// 	c.copy(p2).sub(p0);
// 	d.copy(p3).sub(p0);

// 	const det: number =
// 		2.0 * (b.x * (c.y * d.z - c.z * d.y) - b.y * (c.x * d.z - c.z * d.x) + b.z * (c.x * d.y - c.y * d.x));
// 	if (det == 0.0) {
// 		return target.copy(p0);
// 	} else {
// 		const v = c
// 			.cross(d)
// 			.multiplyScalar(b.dot(b))
// 			.add(d.cross(b).multiplyScalar(c.dot(c)))
// 			.add(b.cross(c).multiplyScalar(d.dot(d)));
// 		v.divideScalar(det);
// 		return target.copy(p0).add(v);
// 	}
// }

// const d0 = new Vector3();
// const d1 = new Vector3();
// const d2 = new Vector3();
// const d3 = new Vector3();
// const d4 = new Vector3();
// const d5 = new Vector3();
// export function tetQuality(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3) {
// 	d0.copy(p1).sub(p0);
// 	d1.copy(p2).sub(p0);
// 	d2.copy(p3).sub(p0);
// 	d3.copy(p2).sub(p1);
// 	d4.copy(p3).sub(p2);
// 	d5.copy(p1).sub(p3);

// 	const s0 = d0.length();
// 	const s1 = d1.length();
// 	const s2 = d2.length();
// 	const s3 = d3.length();
// 	const s4 = d4.length();
// 	const s5 = d5.length();

// 	const ms = (s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3 + s4 * s4 + s5 * s5) / 6.0;
// 	const rms = Math.sqrt(ms);

// 	const s = 12.0 / Math.sqrt(2.0);

// 	const vol = d0.dot(d1.cross(d2)) / 6.0;
// 	return (s * vol) / (rms * rms * rms);
// 	// 1.0 for regular tetrahedron
// }

// export function compareEdges(e0: TetEdge, e1: TetEdge) {
// 	if (e0[0] < e1[0] || (e0[0] == e1[0] && e0[1] < e1[1])) {
// 		return -1;
// 	} else {
// 		return 1;
// 	}
// }
// export function equalEdges(e0: TetEdge, e1: TetEdge) {
// 	return e0[0] == e1[0] && e0[1] == e1[1];
// }

// // const EPS = 0.0001;
// export function randEps() {
// 	return 0;
// 	// return -EPS + 2.0 * Math.random() * EPS;
// }
