/**
 * Returns the number of objects in a geometry.
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `objectsCount(input_index_or_node_path)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 *
 * ## Usage
 *
 * - `objectsCount(0)` - returns the number of objects in the input node.
 * - `objectsCount('/geo/merge1')` - returns the number of objects in the node /geo/merge1
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class ObjectsCountExpression extends BaseMethod {
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override async processArguments(args: any[]): Promise<number> {
		if (args.length == 1) {
			const index_or_path = args[0];
			const container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;

			if (container) {
				const coreGroup = container.coreContent();
				if (coreGroup) {
					const objectsCount = coreGroup.allObjects().length;
					return objectsCount;
				}
			}
		}
		return 0;
	}
}
