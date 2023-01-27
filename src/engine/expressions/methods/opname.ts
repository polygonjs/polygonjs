/**
 * Returns the name of the refered node
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `opname(node_path)`
 *
 * - `node_path` path to referred node
 *
 * ## Usage
 *
 * - `opname('/geo1')` - returns 'geo1'
 * - `opname('..')` - returns the name of the parent
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {MethodDependency} from '../MethodDependency';

export class OpnameExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		const {indexOrPath} = args;
		if (indexOrPath == null) {
			return null;
		}
		const graphNode = this.findReferencedGraphNode(indexOrPath);
		if (graphNode) {
			const node = graphNode as BaseNodeType;
			if (node.nameController) {
				const nameNode = node.nameController.graphNode();
				return this.createDependency(nameNode, {indexOrPath});
			}
		}
		return null;
	}

	override processArguments(args: any[]): Promise<any> {
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
