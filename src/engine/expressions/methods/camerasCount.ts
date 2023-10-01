/**
 * Returns the number of cameras in a geometry node.
 *
 * @remarks
 * It takes 1 argument.
 *
 * `camerasCount(input_index_or_node_path)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 *
 * ## Usage
 *
 * - `camerasCount(0)` - returns the number of cameras in the input node.
 * - `camerasCount('/geo/merge1')` - returns the number of cameras in the node /geo/merge1
 *
 */
import {Poly} from '../../Poly';
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class CamerasCountExpression extends BaseMethod {
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
				const coreContent = container.coreContent();
				if (coreContent) {
					const count = coreContent
						.threejsObjects()
						.filter((object) => Poly.camerasRegister.objectRegistered(object)).length;

					return count;
				}
			}
		}
		return 0;
	}
}
