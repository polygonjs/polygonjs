/**
 * Fetches the previous frame of a parent solver node.
 *
 * @remarks
 * Can only be created inside a solver SOP.
 *
 */
import {NetworkNodeType} from './../../poly/NodeContext';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import type {SolverSopNode} from './Solver';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
class SolverPreviousFrameSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SolverPreviousFrameSopParamsConfig();

export class SolverPreviousFrameSopNode extends TypedSopNode<SolverPreviousFrameSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'solverPreviousFrame';
	}

	override async cook() {
		const solverNode = this._solverNode();
		if (!solverNode) {
			this.cookController.endCook();
			return;
		}
		this._createSolverNodeDependencyIfRequired();
		const previousFrameCoreGroup = solverNode.previousFrameCoreGroup();
		if (previousFrameCoreGroup) {
			this.setCoreGroup(previousFrameCoreGroup);
		} else {
			this.setObjects([]);
		}
	}

	private _solverNodeDependencyCreated = false;
	private _createSolverNodeDependencyIfRequired() {
		if (this._solverNodeDependencyCreated) {
			return;
		}
		const solverNode = this._solverNode();
		if (!solverNode) {
			return;
		}
		this.addGraphInput(solverNode.iterationStamp());
		this._solverNodeDependencyCreated = true;
	}

	private _solverNode() {
		const solverNode = this.parentController.findParent((parent) => parent.type() == NetworkNodeType.SOLVER) as
			| SolverSopNode
			| undefined;
		if (!solverNode) {
			this.states.error.set('parent is not a solver node');
			return;
		}
		return solverNode;
	}
}
