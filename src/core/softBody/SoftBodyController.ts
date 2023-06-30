import {PolyScene} from '../../engine/scene/PolyScene';
import {Number3} from '../../types/GlobalTypes';
import {SoftBody} from './SoftBody';
import {TetSoftBodySolverSopNode, MultiFunctionDefined} from '../../engine/nodes/sop/TetSoftBodySolver';

// const gPhysicsScene = {
// 	gravity: [0.0, -10.0, 0.0],
// 	// dt: 1.0 / 60.0,
// 	// numSubsteps: 10,
// 	// paused: true,
// 	// objects: [],
// };
interface SoftBodyControllerOptions {
	// subSteps: number;
	node: TetSoftBodySolverSopNode;
	// gravity: Vector3;
}

export class SoftBodyController {
	private _stepsCount: number = 10;
	private _softBody: SoftBody | undefined;
	private _gravity: Number3 = [0, -9.8, 0];
	private _node: TetSoftBodySolverSopNode;
	constructor(public readonly scene: PolyScene, options: SoftBodyControllerOptions) {
		this._node = options.node;
		// options.gravity.toArray(this._gravity);
		// this._stepsCount = options.subSteps;
		// console.log('create subSteps:', options.subSteps, this._stepsCount);
		// this._softBodies.length = 0;
	}
	// init() {
	// 	const body = new SoftBody(bunnyMesh, gThreeScene);
	// 	gPhysicsScene.objects.push(body);
	// 	document.getElementById('numTets').innerHTML = body.numTets;
	// }
	setSubSteps(subSteps: number) {
		this._stepsCount = subSteps;
	}
	setEdgeCompliance(edgeCompliance: number) {
		if (this._softBody) {
			this._softBody.edgeCompliance = edgeCompliance;
		}
	}
	setVolumeCompliance(volumeCompliance: number) {
		if (this._softBody) {
			this._softBody.volumeCompliance = volumeCompliance;
		}
	}
	addSoftBody(softBody: SoftBody) {
		// this._softBodies.push(softBody);
		this._softBody = softBody;
	}
	clearSoftBodies() {
		// this._softBodies.length = 0;
		this._softBody = undefined;
	}
	step() {
		const softBody = this._softBody;
		if (!softBody) {
			return;
		}
		const functions = this._node.function();
		if (!(functions.collider && functions.velocity)) {
			return;
		}
		const _functions = functions as MultiFunctionDefined;
		const args = this._node.functionEvalArgsWithParamConfigs();

		const delta = this.scene.timeController.delta();
		// if (gPhysicsScene.paused) return;
		const stepsCount = this._stepsCount;

		const sdt = delta / stepsCount;
		// const softBodies = this._softBodies;

		for (let step = 0; step < stepsCount; step++) {
			this._node.updateSceneGlobals(step, sdt);
			// for (const softBody of softBodies) {
			softBody.preSolve(sdt, this._gravity, args, _functions);
			// }

			// for (const softBody of softBodies) {
			softBody.solve(sdt);
			// }

			// for (const softBody of softBodies) {
			softBody.postSolve(sdt);

			// }
		}
		softBody.updateLowResObject();
		softBody.updateHighResMesh();

		// gGrabber.increaseTime(gPhysicsScene.dt);
	}
}
