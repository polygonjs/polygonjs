/**
 * Fetches the previous frame of a parent solver node.
 *
 * @remarks
 * Can only be created inside a solver SOP.
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {SolverSopNode} from './Solver';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
class SolverPreviousFrameSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SolverPreviousFrameSopParamsConfig();

export class SolverPreviousFrameSopNode extends TypedSopNode<SolverPreviousFrameSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'solverPreviousFrame';
	}

	initializeNode() {
		this.addGraphInput(this.scene().timeController.graphNode);
	}

	async cook() {
		const parent = this.parent();
		if (parent?.type() != SolverSopNode.type()) {
			this.states.error.set(`the parent is not a '${SolverSopNode.type()}'`);
			this.cookController.endCook();
		}
		const solver = parent as SolverSopNode;
		const previousFrameCoreGroup = solver.previousFrameCoreGroup();
		if (previousFrameCoreGroup) {
			this.setCoreGroup(previousFrameCoreGroup);
		} else {
			this.setObjects([]);
		}
	}
}
