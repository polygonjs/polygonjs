/**
 * Returns the number at the end of a string
 *
 * @remarks
 * It takes 1 arguments.
 *
 * opdigits(<word\>)
 *
 * - **<word\>** returns the number at the end of word
 *
 * ## Usage
 *
 * - `opdigits('/geo1')` - returns 1
 * - `opdigits($OS)` - returns the number at the end of the name of the current node
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {MethodDependency} from '../MethodDependency';
import {CoreString} from '../../../core/String';

export class OpdigitsExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		const {indexOrPath} = args;
		if (indexOrPath == null) {
			return null;
		}
		const graph_node = this.findReferencedGraphNode(indexOrPath);
		if (graph_node) {
			const node = graph_node as BaseNodeType;
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
					const value = CoreString.tailDigits(name);
					resolve(value);
				} else {
					resolve(0);
				}
			} else {
				resolve(0);
			}
		});
	}
}
