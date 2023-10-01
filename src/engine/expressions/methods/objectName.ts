/**
 * Returns the name of an object created by a node.
 *
 * @remarks
 * It takes 2 arguments.
 *
 * `objectName(input_index_or_node_path, object_index)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 * - `object_index` the index of the object
 *
 * ## Usage
 *
 * - `objectsName(0, 1)` - returns the name of 2nd object (index 1 in the array) in the input node.
 * - `objectsName('/geo/merge1', 2)` - returns the name of the 3nd object (index 2 in the array) in the node /geo/merge1
 *
 */
import {Object3D} from 'three';
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class ObjectNameExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['number', 'object index'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override async processArguments(args: any[]): Promise<string> {
		if (args.length == 2) {
			const index_or_path = args[0];
			let objectIndex = parseInt(args[1]);
			if (isNaN(objectIndex)) {
				objectIndex = 0;
			}

			const container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;

			if (container) {
				const coreContent = container.coreContent();
				if (coreContent) {
					const object = coreContent.allObjects()[objectIndex] as Object3D | null;
					if (object) {
						return object.name;
					}
				}
			}
		}
		return '';
	}
}
