/**
 * Returns the names of cameras created by a node.
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `cameraNames(input_index_or_node_path)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 *
 * ## Usage
 *
 * - `cameraNames(0)` - returns the names of cameras in the input node.
 * - `cameraNames('/geo/merge1')` - returns the names of cameras in the node /geo/merge1
 *
 */
import {Poly} from '../../Poly';
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class CameraNamesExpression extends BaseMethod {
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override async processArguments(args: any[]): Promise<string[]> {
		if (args.length == 1) {
			const index_or_path = args[0];
			const container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;

			if (container) {
				const coreContent = container.coreContent();
				if (coreContent) {
					const objects = coreContent
						.threejsObjects()
						.filter((object) => Poly.camerasRegister.objectRegistered(object));
					const list: string[] = new Array(objects.length);
					let i = 0;
					for (const object of objects) {
						list[i] = object.name;
						i++;
					}
					return list;
				}
			}
		}
		return [];
	}
}
