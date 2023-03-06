/**
 * Returns the value of an object attribute
 *
 * @remarks
 * It takes 3 arguments.
 *
 * `object(input_index_or_node_path, attrib_name, object_index)`
 *
 * - `input_index_or_node_path` is a number or a string
 * - `attrib_name` is a string, the name of the attribute
 * - `object_index` index of the object to fetch
 *
 * ## Usage
 *
 * - `object(0, 'pscale', 0)` - returns the pscale attribute value of the first object of the first input
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class ObjectExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['string', 'attribute name'],
			['index', 'object index'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == 2 || args.length == 3) {
				const indexOrPath = args[0];
				const attribName = args[1];
				const objectIndex = args[2] || 0;
				let container: GeometryContainer | null = null;
				try {
					container = (await this.getReferencedNodeContainer(indexOrPath)) as GeometryContainer;
				} catch (e) {
					reject(e);
				}
				if (container) {
					const value = this._get_value_from_container(container, attribName, objectIndex);
					resolve(value);
				}
			} else {
				console.warn(`${args.length} given when 2 or 3 expected`);
				resolve(0);
			}
		});
	}

	_get_value_from_container(container: GeometryContainer, attrib_name: string, point_index: number) {
		const core_group = container.coreContent();
		if (core_group) {
			const coreObject = core_group.allCoreObjects()[point_index];

			if (coreObject) {
				return coreObject.attribValue(attrib_name);
			} else {
				return 0;
			}
		} else {
			return null;
		}
	}
}
