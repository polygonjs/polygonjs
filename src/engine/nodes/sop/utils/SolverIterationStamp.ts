import {PolyScene} from '../../../../../src/engine/scene/PolyScene';
import {CoreGraphNode} from './../../../../core/graph/CoreGraphNode';

export class SolverIterationStamp extends CoreGraphNode {
	protected _iteration: number = 0;

	constructor(scene: PolyScene) {
		super(scene, 'SolverIterationStamp');
	}

	reset() {
		this._iteration = 0;
	}

	setIteration(iteration: number) {
		if (iteration != this._iteration) {
			this._iteration = iteration;
			this.setDirty();
			this.removeDirtyState();
		}
	}

	iteration() {
		return this._iteration;
	}
}
