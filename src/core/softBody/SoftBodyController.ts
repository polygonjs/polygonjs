import {SoftBodySolverSopNode} from '../../engine/nodes/sop/SoftBodySolver';
import {PolyScene} from '../../engine/scene/PolyScene';
import {SoftBody} from './SoftBody';

const gPhysicsScene = {
	gravity: [0.0, -10.0, 0.0],
	dt: 1.0 / 60.0,
	numSubsteps: 10,
	paused: true,
	// objects: [],
};

export class SoftBodyController {
	public stepsCount = 10;
	private _softBodies: SoftBody[] = [];
	constructor(public readonly scene: PolyScene, node: SoftBodySolverSopNode) {}
	// init() {
	// 	const body = new SoftBody(bunnyMesh, gThreeScene);
	// 	gPhysicsScene.objects.push(body);
	// 	document.getElementById('numTets').innerHTML = body.numTets;
	// }
	addSoftBody(softBody: SoftBody) {
		this._softBodies.push(softBody);
	}
	clearSoftBodies() {
		this._softBodies.length = 0;
	}
	step() {
		const delta = this.scene.timeController.delta();
		// if (gPhysicsScene.paused) return;
		const stepsCount = this.stepsCount;

		const sdt = delta / stepsCount;
		const softBodies = this._softBodies;

		for (let step = 0; step < stepsCount; step++) {
			for (const softBody of softBodies) {
				softBody.preSolve(sdt, gPhysicsScene.gravity);
			}

			for (const softBody of softBodies) {
				softBody.solve(sdt);
			}

			for (const softBody of softBodies) {
				softBody.postSolve(sdt);
			}
		}

		// gGrabber.increaseTime(gPhysicsScene.dt);
	}
}
