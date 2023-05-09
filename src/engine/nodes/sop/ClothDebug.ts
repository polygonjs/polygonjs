/**
 * Debug Cloth input Geometries
 *
 *
 */
import {Object3D, Mesh, BufferGeometry, BufferAttribute} from 'three';
import {TypedActorSopNode} from './_BaseActor';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ClothGeometryInitController} from '../../../core/cloth/modules/ClothGeometryInitController';

class ClothDebugSopParamsConfig extends NodeParamsConfig {
	// detail = ParamConfig.INTEGER(31, {
	// 	range: [0, 32],
	// 	rangeLocked: [true, false],
	// });
	// dist = ParamConfig.FLOAT(0.1);
	populateAdjacency = ParamConfig.BOOLEAN(1);
	neighboursCount = ParamConfig.BOOLEAN(1);
	adjacency = ParamConfig.BOOLEAN(1);
	adjacencyDistance = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new ClothDebugSopParamsConfig();

export class ClothDebugSopNode extends TypedActorSopNode<ClothDebugSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clothDebug';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const objects: Object3D[] = coreGroup.threejsObjects();
		console.log({objects});
		for (let object of objects) {
			if ((object as Mesh).geometry) {
				this._debugMesh(object as Mesh);
			}
		}

		this.setObjects(objects);
	}

	private _debugMesh(mesh: Mesh) {
		const controller = new ClothGeometryInitController(mesh);
		// controller.mergeTolerance = this.pv.dist;
		// controller.detail = this.pv.detail;
		// controller.populateAdjacency = this.pv.populateAdjacency;
		// controller.process();
		mesh.geometry = controller.geometry;
		console.warn('computed', this.path());

		if (this.pv.neighboursCount) {
			this.createNeighboursCount(controller, mesh.geometry);
		}
		if (this.pv.adjacency) {
			this.createAdjacentsAttribute(controller, mesh.geometry, 0);
			this.createAdjacentsAttribute(controller, mesh.geometry, 1);
		}
		if (this.pv.adjacencyDistance) {
			this.createDistancesAttribute(controller, mesh.geometry, 0);
			this.createDistancesAttribute(controller, mesh.geometry, 1);
		}
	}

	private createNeighboursCount(controller: ClothGeometryInitController, geometry: BufferGeometry) {
		const neighboursCount: number[] = [];
		const adjacency = controller.adjacency;
		const geoVertices = controller.vertices;
		const length = geoVertices.length;

		for (let i = 0; i < length; i++) {
			const adj = adjacency[i];
			const len = adj.length - 1;

			neighboursCount.push(len);
		}

		geometry.setAttribute(`neighboursCount`, new BufferAttribute(new Float32Array(neighboursCount), 1));
	}

	private createAdjacentsAttribute(controller: ClothGeometryInitController, geometry: BufferGeometry, k: number) {
		// const data = new Float32Array(this.RESOLUTION * this.RESOLUTION * 4);
		const geoVertices = controller.vertices;
		const adjacency = controller.adjacency;
		const length = geoVertices.length;
		const adjencies: number[] = [];

		for (let i = 0; i < length; i++) {
			const i4 = i * 4;
			const adj = adjacency[i];
			// const len = adj.length - 1;

			// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : adj[k * 4 + j];
			for (let j = 0; j < 4; j++) {
				const adjacentIndex = adj[k * 4 + j];
				if (adjacentIndex != null) {
					adjencies[i4 + j] = adjacentIndex;
				} else {
					adjencies[i4 + j] = -1;
				}
			}
		}

		geometry.setAttribute(`adjencies${k}`, new BufferAttribute(new Float32Array(adjencies), 4));
	}

	private createDistancesAttribute(controller: ClothGeometryInitController, geometry: BufferGeometry, k: number) {
		const distances: number[] = [];
		const minDistances: number[] = [];
		const maxDistances: number[] = [];
		const geoVertices = controller.vertices;
		const adjacency = controller.adjacency;
		const length = geoVertices.length;

		for (let i = 0; i < length; i++) {
			const i4 = i * 4;
			const adj = adjacency[i];
			const len = adj.length - 1;

			const v = geoVertices[i];
			let minDist = 100000;
			let maxDist = -1;

			// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : v.distanceTo(geoVertices[adj[k * 4 + j]]);
			for (let j = 0; j < 4; j++) {
				if (len < k * 4 + j) {
					distances[i4 + j] = -1;
				} else {
					const adjacentIndex = adj[k * 4 + j];
					if (adjacentIndex < 0) {
						distances[i4 + j] = -1;
					} else {
						const neighbourPosition = geoVertices[adjacentIndex];
						const dist = v.distanceTo(neighbourPosition);
						if (dist < minDist) {
							minDist = dist;
						}
						if (dist > minDist) {
							maxDist = dist;
						}
						distances[i4 + j] = dist;
						if (dist < 0.0001) {
							console.log('bad dist');
						}
					}
				}
			}
			minDistances.push(minDist);
			maxDistances.push(maxDist);
		}

		geometry.setAttribute(`distance${k}`, new BufferAttribute(new Float32Array(distances), 4));
		geometry.setAttribute(`minDist${k}`, new BufferAttribute(new Float32Array(minDistances), 1));
		geometry.setAttribute(`maxDist${k}`, new BufferAttribute(new Float32Array(maxDistances), 1));
	}
}
