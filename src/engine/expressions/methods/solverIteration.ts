import {NetworkNodeType} from './../../poly/NodeContext';
import {BaseNodeType} from './../../nodes/_Base';
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
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {SolverSopNode} from '../../nodes/sop/Solver';

export class SolverIterationExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [['string', 'path to solver node']];
	}

	override findDependency(index_or_path: number | string): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(index_or_path);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == 1) {
				const nodePath = args[0] || '..';
				let foundNode: BaseNodeType | undefined;
				let foundSolverNode: SolverSopNode | undefined;
				try {
					foundNode = (await this.getReferencedNode(nodePath)) as BaseNodeType | undefined;
					if (foundNode && foundNode.type() == NetworkNodeType.SOLVER) {
						foundSolverNode = foundNode as SolverSopNode;
					}
				} catch (e) {
					reject(e);
					return;
				}

				if (foundSolverNode) {
					const value = foundSolverNode.currentIteration();
					resolve(value);
				}
			} else {
				resolve(0);
			}
		});
	}
}
