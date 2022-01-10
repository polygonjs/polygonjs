/**
 * Returns the name of the refered node
 *
 * @remarks
 * It takes 1 arguments.
 *
 * opname(<node_path\>)
 *
 * - **<node_path\>** path to referred node
 *
 * ## Usage
 *
 * - `opnane('/geo1')` - returns 'geo1'
 * - `opname('..')` - returns the name of the parent
 *
 */

import {BaseMethod} from './_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {MethodDependency} from '../MethodDependency';

export class OpnameExpression extends BaseMethod {
	protected _requireDependency = true;
	static requiredArguments() {
		return [['string', 'path to node']];
	}

	findDependency(index_or_path: number | string): MethodDependency | null {
		const graph_node = this.findReferencedGraphNode(index_or_path);
		if (graph_node) {
			const node = graph_node as BaseNodeType;
			if (node.nameController) {
				const name_node = node.nameController.graph_node;
				return this.createDependency(name_node, index_or_path);
			}
		}
		return null;
	}

	processArguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length == 1) {
				const index_or_path = args[0];
				const node = this.getReferencedNode(index_or_path);
				if (node) {
					const name = node.name();
					resolve(name);
				} else {
					resolve(0);
				}
			} else {
				resolve(0);
			}
		});
	}
}
