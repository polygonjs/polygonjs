/**
 * Returns the names of objects created by a node.
 *
 * @remarks
 * It takes 1 arguments.
 *
 * objectNames(<input_index_or_node_path\>)
 *
 * - **<input_index_or_node_path\>** the path to a node, or input index
 *
 * ## Usage
 *
 * - `objectNames(0)` - returns the names of objects in the input node.
 * - `objectNames('/geo/merge1')` - returns the names of objects in the node /geo/merge1
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class ObjectNamesExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == 1) {
				const index_or_path = args[0];
				let container: GeometryContainer;
				try {
					container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
					return;
				}

				if (container) {
					const coreContent = container.coreContent();
					if (coreContent) {
						const objects = coreContent.objects();
						const list: string[] = new Array(objects.length);
						let i = 0;
						for (let object of objects) {
							list[i] = object.name;
							i++;
						}
						resolve(list);
					} else {
						resolve([]);
					}
				}
			} else {
				resolve([]);
			}
		});
	}
}
