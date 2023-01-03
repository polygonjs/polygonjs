/**
 * Returns the current iteration of the [solver node](/docs/nodes/sop/solver).
 *
 * @remarks
 * It takes 1 arguments.
 *
 * solverIteration(<node_path\>)
 *
 * - **<node_path\>** the path to the solver node (defaults to '..' for the parent node)
 *
 * ## Usage
 *
 * - `solverIteration()` - returns the iteration of the parent solver node.
 * - `solverIteration('..')` - returns the iteration of the parent solver node.
 * - `solverIteration('/geo/solver1')` - returns the iteration of the parent solver node /geo/merge1
 *
 */
import {NetworkNodeType} from './../../poly/NodeContext';
import {BaseNodeType} from './../../nodes/_Base';
import {BaseMethod, BaseMethodFindDependencyArgs} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {SolverSopNode} from '../../nodes/sop/Solver';

function isSolverNode(node?: BaseNodeType | null) {
	return node && node.type() == NetworkNodeType.SOLVER;
}
export class SolverIterationExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [];
	}
	static override optionalArguments() {
		return [['string', 'path to solver node']];
	}

	private _solverNode() {
		const solverNode = this.param.node.parentController.findParent(
			(parent) => parent.type() == NetworkNodeType.SOLVER
		) as SolverSopNode | undefined;

		return solverNode;
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		const {indexOrPath} = args;
		const node = indexOrPath ? (this.findReferencedGraphNode(indexOrPath) as BaseNodeType) : this._solverNode();
		if (isSolverNode(node)) {
			const solverStamp = (node as SolverSopNode).iterationStamp();
			return this.createDependency(solverStamp, {indexOrPath, node});
		}
		return null;
	}

	override async processArguments(args: any[]): Promise<any> {
		const nodePath = args[0] || '..';
		let foundSolverNode: SolverSopNode | undefined;
		const foundNode = (await this.getReferencedNode(nodePath)) as BaseNodeType | undefined;
		if (foundNode && isSolverNode(foundNode)) {
			foundSolverNode = foundNode as SolverSopNode;
			const value = foundSolverNode.iterationStamp().iteration();
			return value;
		} else {
			return 0;
		}
	}
}
