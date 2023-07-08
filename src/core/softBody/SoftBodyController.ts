import {PolyScene} from '../../engine/scene/PolyScene';
import {Number3} from '../../types/GlobalTypes';
import {SoftBody, VelocityFunction, SDFFunction} from './SoftBody';
import {TetSoftBodySolverSopNode} from '../../engine/nodes/sop/TetSoftBodySolver';
import {Vector3} from 'three';

interface SoftBodyControllerOptions {
	node: TetSoftBodySolverSopNode;
}

export class SoftBodyController {
	private _softBody: SoftBody | undefined;
	private _gravity: Number3 = [0, -9.8, 0];
	private _node: TetSoftBodySolverSopNode;
	constructor(public readonly scene: PolyScene, options: SoftBodyControllerOptions) {
		this._node = options.node;
	}
	setSoftBody(softBody: SoftBody) {
		this._softBody = softBody;
	}
	dispose() {
		this._softBody = undefined;
	}
	step(stepsCount: number, edgeCompliance: number, volumeCompliance: number, preciseCollisions: boolean) {
		const softBody = this._softBody;
		if (!softBody) {
			return;
		}
		const functions = this._node.function();
		if (!(functions.collider && functions.velocity)) {
			return;
		}
		const args = this._node.functionEvalArgsWithParamConfigs();
		const velFunc: VelocityFunction = functions.velocity(...args.velocity);
		const sdfFunc: SDFFunction = functions.collider(...args.collider);
		const sdfEvaluator = (p: Vector3) => {
			this._node.setPositionGlobals(p);
			return sdfFunc();
		};

		const delta = this.scene.timeController.delta();

		const sdt = delta / stepsCount;

		for (let step = 0; step < stepsCount; step++) {
			this._node.updateSceneGlobals(step, sdt);

			softBody.preSolve(sdt, this._gravity, velFunc, sdfEvaluator);

			softBody.solve(sdt, edgeCompliance, volumeCompliance, preciseCollisions, sdfEvaluator);

			softBody.postSolve(sdt);
		}
		softBody.updateLowResObject();
		softBody.updateHighResMesh();
	}
}
