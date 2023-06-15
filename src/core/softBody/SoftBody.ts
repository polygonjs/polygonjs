import {TetMesh, VOL_ID_ORDER} from './Common';
import {BufferAttribute, BufferGeometry, Vector3} from 'three';
import {
	vecAdd,
	vecCopy,
	vecDistSquared,
	vecDot,
	vecLengthSquared,
	vecScale,
	vecSetCross,
	vecSetDiff,
} from './SoftBodyMath';

interface SoftBodyOptions {
	tetMesh: TetMesh;
	bufferGeometry: BufferGeometry;
	edgeCompliance?: number;
	volCompliance?: number;
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
	public readonly edgeCompliance: number;
	public readonly volCompliance: number;
	public readonly temp: Float32Array;
	public readonly grads: Float32Array;
	public grabId: number;
	public grabInvMass: number;
	public readonly bufferGeometry: BufferGeometry;
	constructor(private _options: SoftBodyOptions) {
		if (this._options.edgeCompliance == null) {
			this._options.edgeCompliance = 100.0;
		}
		if (this._options.volCompliance == null) {
			this._options.volCompliance = 0.0;
		}
		const tetMesh = this._options.tetMesh;
		this.bufferGeometry = this._options.bufferGeometry;
		// physics

		this.numParticles = tetMesh.verts.length / 3;
		this.numTets = tetMesh.tetIds.length / 4;
		this.pos = new Float32Array(tetMesh.verts);
		this.prevPos = tetMesh.verts.slice();
		this.vel = new Float32Array(3 * this.numParticles);

		this.tetIds = tetMesh.tetIds;
		this.edgeIds = tetMesh.tetEdgeIds;
		this.restVol = new Float32Array(this.numTets);
		this.edgeLengths = new Float32Array(this.edgeIds.length / 2);
		this.invMass = new Float32Array(this.numParticles);

		this.edgeCompliance = this._options.edgeCompliance;
		this.volCompliance = this._options.volCompliance;

		this.temp = new Float32Array(4 * 3);
		this.grads = new Float32Array(4 * 3);

		this.grabId = -1;
		this.grabInvMass = 0.0;

		this.initPhysics();

		this.translate(0, 1, 0);

		// surface tri mesh

		// const geometry = new BufferGeometry();
		this.bufferGeometry.setAttribute('position', new BufferAttribute(this.pos, 3));
		this.bufferGeometry.setIndex(tetMesh.tetSurfaceTriIds);
		// const material = new MeshPhongMaterial({color: 0xf02000});
		// material.flatShading = true;
		// this.surfaceMesh = new Mesh(geometry, material);
		// this.surfaceMesh.geometry.computeVertexNormals();
		// this.surfaceMesh.userData = this;
		// this.surfaceMesh.layers.enable(1);
		// scene.add(this.surfaceMesh);
	}

	translate(x: number, y: number, z: number) {
		for (let i = 0; i < this.numParticles; i++) {
			vecAdd(this.pos, i, [x, y, z], 0);
			vecAdd(this.prevPos, i, [x, y, z], 0);
		}
	}

	updateMeshes() {
		this.bufferGeometry.computeVertexNormals();
		this.bufferGeometry.attributes.position.needsUpdate = true;
		this.bufferGeometry.computeBoundingSphere();
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

	preSolve(dt: number, gravity: number[]) {
		for (let i = 0; i < this.numParticles; i++) {
			if (this.invMass[i] == 0.0) continue;
			vecAdd(this.vel, i, gravity, 0, dt);
			vecCopy(this.prevPos, i, this.pos, i);
			vecAdd(this.pos, i, this.vel, i, dt);
			const y = this.pos[3 * i + 1];
			if (y < 0.0) {
				vecCopy(this.pos, i, this.prevPos, i);
				this.pos[3 * i + 1] = 0.0;
			}
		}
	}

	solve(dt: number) {
		this.solveEdges(this.edgeCompliance, dt);
		this.solveVolumes(this.volCompliance, dt);
	}

	postSolve(dt: number) {
		for (let i = 0; i < this.numParticles; i++) {
			if (this.invMass[i] == 0.0) continue;
			vecSetDiff(this.vel, i, this.pos, i, this.prevPos, i, 1.0 / dt);
		}
		this.updateMeshes();
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

	// squash() {
	// 	for (let i = 0; i < this.numParticles; i++) {
	// 		this.pos[3 * i + 1] = 0.5;
	// 	}
	// 	this.updateMeshes();
	// }

	// startGrab(pos: Vector3) {
	// 	const p = [pos.x, pos.y, pos.z];
	// 	let minD2 = Number.MAX_VALUE;
	// 	this.grabId = -1;
	// 	for (let i = 0; i < this.numParticles; i++) {
	// 		const d2 = vecDistSquared(p, 0, this.pos, i);
	// 		if (d2 < minD2) {
	// 			minD2 = d2;
	// 			this.grabId = i;
	// 		}
	// 	}

	// 	if (this.grabId >= 0) {
	// 		this.grabInvMass = this.invMass[this.grabId];
	// 		this.invMass[this.grabId] = 0.0;
	// 		vecCopy(this.pos, this.grabId, p, 0);
	// 	}
	// }
	setSelectedVertexIndex(index: number) {
		if (index >= 0) {
			this.grabInvMass = this.invMass[index];
			this.invMass[index] = 0.0;
			// vecCopy(this.pos, this.grabId, p, 0);
		} else {
			this._endGrab();
		}

		this.grabId = index;
	}

	// moveGrabbed(pos: Vector3) {
	// 	if (this.grabId >= 0) {
	// 		const p = [pos.x, pos.y, pos.z];
	// 		vecCopy(this.pos, this.grabId, p, 0);
	// 	}
	// }
	private _selectedVertexPreviousPosition = new Vector3();
	private _selectedVertexVelocity = new Vector3();
	setSelectedVertexPosition(pos: Vector3, dt: number) {
		if (this.grabId < 0) {
			return;
		}
		this._selectedVertexVelocity.copy(pos).sub(this._selectedVertexPreviousPosition).divideScalar(dt);

		const p = [pos.x, pos.y, pos.z];
		vecCopy(this.pos, this.grabId, p, 0);
		this._selectedVertexPreviousPosition.copy(pos);
	}

	protected _endGrab() {
		if (this.grabId >= 0) {
			this.invMass[this.grabId] = this.grabInvMass;
			const vel = this._selectedVertexVelocity;
			const v = [vel.x, vel.y, vel.z];
			vecCopy(this.vel, this.grabId, v, 0);
		}
		this.grabId = -1;
		this._selectedVertexVelocity.set(0, 0, 0);
	}
}
