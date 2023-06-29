import {VOL_ID_ORDER} from './Common';
import {Mesh, BufferGeometry, Vector3} from 'three';
import {
	vecSetZero,
	vecAdd,
	vecCopy,
	vecDistSquared,
	vecDot,
	vecLengthSquared,
	vecScale,
	vecSetCross,
	vecSetDiff,
	matSetMult,
	matSetInverse,
} from './SoftBodyMath';
import {tetSortPoints} from '../geometry/tet/utils/tetSortPoints';
import {buildTetIds, buildTetEdgeIds} from '../geometry/tet/utils/tetSoftBodyUtils';
import {Number3, Number9} from '../../types/GlobalTypes';
import {TetEmbed} from './Common';
import {Hash} from '../Hash';
import {ObjectUserData} from '../UserData';
import {SoftBodyConstraint} from './SoftBodyConstraint';
import {
	_SDFBox,
	// _SDFPlane
} from '../../engine/functions/_SDFPrimitives';
import {
	TetSoftBodySolverSopNode,
	EvalArgsWithParamConfigs,
	MultiFunctionDefined,
} from '../../engine/nodes/sop/TetSoftBodySolver';

// const _boxCenter = new Vector3(0, 0, 0);
// const _boxSizes = new Vector3(1, 1, 1);
// const _planeCenter = new Vector3(0, 0, 0);
// const _planeNormal = new Vector3(0, 1, 0);
// const planeOffset = 0;
// function collisionSDF(p: Vector3) {
// 	// const plane = _SDFPlane(p, _planeCenter, _planeNormal, planeOffset);
// 	return -_SDFBox(p, _boxCenter, _boxSizes, 5);
// 	// return Math.min(plane, box);
// }

interface SoftBodyOptions {
	node: TetSoftBodySolverSopNode;
	tetEmbed: TetEmbed;
	edgeCompliance: number;
	volumeCompliance: number;
	highResSkinning: {
		lookup: {
			spacing: number;
			padding: number;
		};
	};
}

export class SoftBody {
	public readonly numParticles: number;
	public readonly numTets: number;
	public readonly pos: Float32Array;
	public readonly prevPos: number[];
	public readonly vel: Float32Array;
	public readonly tetIds: number[];
	public readonly edgeIds: number[];
	public readonly restVol: Float32Array;
	public readonly edgeLengths: Float32Array;
	public readonly invMass: Float32Array;
	public edgeCompliance: number;
	public volumeCompliance: number;
	public readonly temp: Float32Array;
	public readonly grads: Float32Array;
	public readonly constraintsById: Map<number, SoftBodyConstraint> = new Map();
	// public grabId: number;
	// public grabInvMass: number;
	private readonly bufferGeometry: BufferGeometry;
	//
	private numVisVerts: number;
	private skinningInfo: Float32Array;
	private highResGeometry: BufferGeometry | undefined;
	private highResObjectPosition: number[];
	//
	private _node: TetSoftBodySolverSopNode;

	constructor(private options: SoftBodyOptions) {
		this._node = options.node;
		const {tetEmbed, edgeCompliance, volumeCompliance} = this.options;
		const {tetObject, lowResObject, highResObject} = tetEmbed;
		this.bufferGeometry = (lowResObject as Mesh).geometry;
		// physics

		this.numParticles = tetObject.geometry.pointsCount(); //tetMesh.verts.length / 3;
		this.numTets = tetObject.geometry.tetsCount(); //tetMesh.tetIds.length / 4;
		this.pos = this.bufferGeometry.attributes.position.array! as Float32Array; //new Float32Array(tetMesh.verts);
		this.prevPos = (this.bufferGeometry.attributes.position.array as number[]).slice();
		this.vel = new Float32Array(3 * this.numParticles);

		const newOrderByPoint: Map<number, number> = new Map();
		tetSortPoints(tetObject.geometry, newOrderByPoint);
		this.tetIds = buildTetIds(tetObject.geometry, newOrderByPoint); //tetMesh.tetIds;
		this.edgeIds = buildTetEdgeIds(tetObject.geometry, newOrderByPoint); //tetMesh.tetEdgeIds;

		this.restVol = new Float32Array(this.numTets);
		this.edgeLengths = new Float32Array(this.edgeIds.length / 2);
		this.invMass = new Float32Array(this.numParticles);

		this.edgeCompliance = edgeCompliance;
		this.volumeCompliance = volumeCompliance;

		this.temp = new Float32Array(4 * 3);
		this.grads = new Float32Array(4 * 3);

		// this.grabId = -1;
		// this.grabInvMass = 0.0;

		this.initPhysics();

		// high res object
		this.highResGeometry = highResObject ? (highResObject as Mesh).geometry : undefined;
		this.highResObjectPosition = this.highResGeometry
			? (this.highResGeometry.attributes.position.array as number[])
			: [];
		const visVerts = this.highResObjectPosition;
		this.numVisVerts = visVerts.length / 3;
		this.skinningInfo = new Float32Array(4 * this.numVisVerts);
		if (highResObject) {
			this._computeSkinningInfo(visVerts);
			highResObject.userData[ObjectUserData.LOW_RES_SOFT_BODY_MESH] = lowResObject;
		}
	}

	private _computeSkinningInfo(visVerts: number[]) {
		// create a hash for all vertices of the visual mesh

		const hash = new Hash({
			spacing: this.options.highResSkinning.lookup.spacing,
			maxNumObjects: this.numVisVerts,
		});
		hash.create(visVerts);

		this.skinningInfo.fill(-1.0); // undefined

		const minDist = new Float32Array(this.numVisVerts);
		minDist.fill(Number.MAX_VALUE);
		const border = this.options.highResSkinning.lookup.padding;

		// each tet searches for containing vertices

		const tetCenter = new Float32Array(3) as any as Number3;
		const mat = new Float32Array(9) as any as Number9;
		const bary = new Float32Array(4);

		for (let i = 0; i < this.numTets; i++) {
			// compute bounding sphere of tet

			tetCenter.fill(0.0);
			for (let j = 0; j < 4; j++) vecAdd(tetCenter, 0, this.pos, this.tetIds[4 * i + j], 0.25);

			let rMax = 0.0;
			for (let j = 0; j < 4; j++) {
				const r2 = vecDistSquared(tetCenter, 0, this.pos, this.tetIds[4 * i + j]);
				rMax = Math.max(rMax, Math.sqrt(r2));
			}

			rMax += border;

			hash.query(tetCenter, 0, rMax);
			if (hash.queryIds.length == 0) continue;

			const id0 = this.tetIds[4 * i];
			const id1 = this.tetIds[4 * i + 1];
			const id2 = this.tetIds[4 * i + 2];
			const id3 = this.tetIds[4 * i + 3];

			vecSetDiff(mat, 0, this.pos, id0, this.pos, id3);
			vecSetDiff(mat, 1, this.pos, id1, this.pos, id3);
			vecSetDiff(mat, 2, this.pos, id2, this.pos, id3);

			matSetInverse(mat);

			for (let j = 0; j < hash.queryIds.length; j++) {
				const id = hash.queryIds[j];

				// we already have skinning info

				if (minDist[id] <= 0.0) continue;

				if (vecDistSquared(visVerts, id, tetCenter, 0) > rMax * rMax) continue;

				// compute barycentric coords for candidate

				vecSetDiff(bary, 0, visVerts, id, this.pos, id3);
				matSetMult(mat, bary, 0, bary, 0);
				bary[3] = 1.0 - bary[0] - bary[1] - bary[2];

				let dist = 0.0;
				for (let k = 0; k < 4; k++) dist = Math.max(dist, -bary[k]);

				if (dist < minDist[id]) {
					minDist[id] = dist;
					this.skinningInfo[4 * id] = i;
					this.skinningInfo[4 * id + 1] = bary[0];
					this.skinningInfo[4 * id + 2] = bary[1];
					this.skinningInfo[4 * id + 3] = bary[2];
				}
			}
		}
	}

	// updateMeshes() {
	// 	this.updateLowResObject();
	// 	this.updateHighResMesh();
	// }
	updateLowResObject() {
		// we still need to update the low res mesh
		// event if we only display the high res one,
		// as it may be used for raycasting
		// if (this.highResGeometry) {
		// 	return;
		// }
		if (!this.highResGeometry) {
			this.bufferGeometry.computeVertexNormals();
		}
		this.bufferGeometry.attributes.position.needsUpdate = true;
		this.bufferGeometry.computeBoundingSphere();
	}
	updateHighResMesh() {
		if (!this.highResGeometry) {
			return;
		}
		const positions = this.highResObjectPosition;
		let nr = 0;
		for (let i = 0; i < this.numVisVerts; i++) {
			let tetNr = this.skinningInfo[nr++] * 4;
			if (tetNr < 0) {
				nr += 3;
				continue;
			}
			const b0 = this.skinningInfo[nr++];
			const b1 = this.skinningInfo[nr++];
			const b2 = this.skinningInfo[nr++];
			const b3 = 1.0 - b0 - b1 - b2;
			const id0 = this.tetIds[tetNr++];
			const id1 = this.tetIds[tetNr++];
			const id2 = this.tetIds[tetNr++];
			const id3 = this.tetIds[tetNr++];
			vecSetZero(positions, i);
			vecAdd(positions, i, this.pos, id0, b0);
			vecAdd(positions, i, this.pos, id1, b1);
			vecAdd(positions, i, this.pos, id2, b2);
			vecAdd(positions, i, this.pos, id3, b3);
		}
		this.highResGeometry.computeVertexNormals();
		this.highResGeometry.attributes.position.needsUpdate = true;
		this.highResGeometry.computeBoundingSphere();
	}

	getTetVolume(nr: number) {
		const id0 = this.tetIds[4 * nr];
		const id1 = this.tetIds[4 * nr + 1];
		const id2 = this.tetIds[4 * nr + 2];
		const id3 = this.tetIds[4 * nr + 3];
		vecSetDiff(this.temp, 0, this.pos, id1, this.pos, id0);
		vecSetDiff(this.temp, 1, this.pos, id2, this.pos, id0);
		vecSetDiff(this.temp, 2, this.pos, id3, this.pos, id0);
		vecSetCross(this.temp, 3, this.temp, 0, this.temp, 1);
		return vecDot(this.temp, 3, this.temp, 2) / 6.0;
	}

	initPhysics() {
		this.invMass.fill(0.0);
		this.restVol.fill(0.0);

		for (let i = 0; i < this.numTets; i++) {
			const vol = this.getTetVolume(i);
			this.restVol[i] = vol;
			const pInvMass = vol > 0.0 ? 1.0 / (vol / 4.0) : 0.0;
			this.invMass[this.tetIds[4 * i]] += pInvMass;
			this.invMass[this.tetIds[4 * i + 1]] += pInvMass;
			this.invMass[this.tetIds[4 * i + 2]] += pInvMass;
			this.invMass[this.tetIds[4 * i + 3]] += pInvMass;
		}
		for (let i = 0; i < this.edgeLengths.length; i++) {
			const id0 = this.edgeIds[2 * i];
			const id1 = this.edgeIds[2 * i + 1];
			this.edgeLengths[i] = Math.sqrt(vecDistSquared(this.pos, id0, this.pos, id1));
		}
	}

	private _pos = new Vector3(0, 0, 0);
	private _vel = new Vector3(0, 0, 0);
	preSolve(dt: number, gravity: number[], args: EvalArgsWithParamConfigs, functions: MultiFunctionDefined) {
		for (let i = 0; i < this.numParticles; i++) {
			if (this.invMass[i] == 0.0) continue;
			this._pos.fromArray(this.pos, i * 3);
			this._vel.fromArray(this.vel, i * 3);
			this._node.setPointGlobals(this._pos, this._vel);

			const computedVel: Vector3 = functions.velocity(...args.velocity);
			computedVel.toArray(this.vel, i * 3);

			// vecAdd(this.vel, i, gravity, 0, dt);
			vecCopy(this.prevPos, i, this.pos, i);

			// if (true) {

			const stepMagnitude = this._vel
				.fromArray(this.vel, i * 3)
				.multiplyScalar(dt)
				.length();

			// console.log(colliderFunc);
			// const args = this._node.functionEvalArgsWithParamConfigs().collider;
			const distToCollider: number = functions.collider(...args.collider);
			// const dist = collisionSDF(this._pos);
			if (stepMagnitude > distToCollider) {
				// handle collision
				// 1. set prevPos
				vecAdd(this.pos, i, this.vel, i, dt);
				vecCopy(this.pos, i, this.prevPos, i);
				// 2. update pos
				this._vel.normalize().multiplyScalar(distToCollider);
				this._pos.add(this._vel);
				this._pos.toArray(this.pos, i * 3);
			} else {
				// no collision
				vecAdd(this.pos, i, this.vel, i, dt);
			}

			// } else {
			// 	vecAdd(this.pos, i, this.vel, i, dt);
			// 	const y = this.pos[3 * i + 1];
			// 	if (y < 0.0) {
			// 		vecCopy(this.pos, i, this.prevPos, i);
			// 		this.pos[3 * i + 1] = 0.0;
			// 	}
			// }
		}
	}

	solve(dt: number) {
		this.solveEdges(this.edgeCompliance, dt);
		this.solveVolumes(this.volumeCompliance, dt);
	}

	postSolve(dt: number) {
		for (let i = 0; i < this.numParticles; i++) {
			if (this.invMass[i] == 0.0) continue;
			vecSetDiff(this.vel, i, this.pos, i, this.prevPos, i, 1.0 / dt);
		}
	}

	solveEdges(compliance: number, dt: number) {
		const alpha = compliance / dt / dt;

		for (let i = 0; i < this.edgeLengths.length; i++) {
			const id0 = this.edgeIds[2 * i];
			const id1 = this.edgeIds[2 * i + 1];
			const w0 = this.invMass[id0];
			const w1 = this.invMass[id1];
			const w = w0 + w1;
			if (w == 0.0) continue;

			vecSetDiff(this.grads, 0, this.pos, id0, this.pos, id1);
			const len = Math.sqrt(vecLengthSquared(this.grads, 0));
			if (len == 0.0) continue;
			vecScale(this.grads, 0, 1.0 / len);
			const restLen = this.edgeLengths[i];
			const C = len - restLen;
			const s = -C / (w + alpha);
			vecAdd(this.pos, id0, this.grads, 0, s * w0);
			vecAdd(this.pos, id1, this.grads, 0, -s * w1);
		}
	}

	solveVolumes(compliance: number, dt: number) {
		const alpha = compliance / dt / dt;

		for (let i = 0; i < this.numTets; i++) {
			let w = 0.0;

			for (let j = 0; j < 4; j++) {
				const id0 = this.tetIds[4 * i + VOL_ID_ORDER[j][0]];
				const id1 = this.tetIds[4 * i + VOL_ID_ORDER[j][1]];
				const id2 = this.tetIds[4 * i + VOL_ID_ORDER[j][2]];

				vecSetDiff(this.temp, 0, this.pos, id1, this.pos, id0);
				vecSetDiff(this.temp, 1, this.pos, id2, this.pos, id0);
				vecSetCross(this.grads, j, this.temp, 0, this.temp, 1);
				vecScale(this.grads, j, 1.0 / 6.0);

				w += this.invMass[this.tetIds[4 * i + j]] * vecLengthSquared(this.grads, j);
			}
			if (w == 0.0) continue;

			const vol = this.getTetVolume(i);
			const restVol = this.restVol[i];
			const C = vol - restVol;
			const s = -C / (w + alpha);

			for (let j = 0; j < 4; j++) {
				const id = this.tetIds[4 * i + j];
				vecAdd(this.pos, id, this.grads, j, s * this.invMass[id]);
			}
		}
	}

	//
	//
	// constraints
	//
	//
	createConstraint(index: number) {
		const constraint = new SoftBodyConstraint(this, index);
		this.constraintsById.set(constraint.id, constraint);
		constraint.invMass = this.invMass[index];
		this.invMass[index] = 0.0;
		return constraint;
	}
	getConstraint(constraintId: number) {
		return this.constraintsById.get(constraintId);
	}
	private _constraintVel: Number3 = [0, 0, 0];
	deleteConstraint(constraintId: number) {
		const constraint = this.constraintsById.get(constraintId);
		if (!constraint) {
			return;
		}

		if (constraint.pointIndex >= 0) {
			this.invMass[constraint.pointIndex] = constraint.invMass;
			constraint.velocity(this._constraintVel);
			vecCopy(this.vel, constraint.pointIndex, this._constraintVel, 0);
		}
		this.constraintsById.delete(constraintId);
		constraint.dispose();
	}
}
