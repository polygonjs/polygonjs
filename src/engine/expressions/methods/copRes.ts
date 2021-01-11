/**
 * Returns the resolution of a texture of a COP node.
 *
 * @remarks
 * It takes 1 or 2 arguments
 *
 * copRes(<input_index_or_node_path\>, <vector_component/>)
 *
 * - **<input_index_or_node_path\>** is a number or a string
 * - **<vector_component\>** is a string or number, either 'x', 'y', 0 or 1
 *
 * ## Usage
 *
 * - `copRes('/COP/image1')` - returns the size of the texture, as a THREE.Vector2
 * - `copRes('/COP/image1', 'x')` - returns the x component of the size of the texture, as a number
 *
 */
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {TextureContainer} from '../../containers/Texture';

export class CopResExpression extends BaseMethod {
	protected _require_dependency = true;
	static required_arguments() {
		return [
			['string', 'path to node'],
			['string', 'component_name: x or y'],
		];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		return this.create_dependency_from_index_or_path(index_or_path);
	}

	async process_arguments(args: any[]): Promise<number> {
		let value = 0;
		if (args.length == 2) {
			const index_or_path = args[0];
			const component_name = args[1];
			const container = (await this.get_referenced_node_container(index_or_path)) as TextureContainer;

			if (container) {
				const resolution = container.resolution();
				if ([0, '0', 'x'].includes(component_name)) {
					value = resolution[0];
				} else {
					if ([1, '1', 'y'].includes(component_name)) {
						value = resolution[1];
					}
				}
			}
		}
		return value;
	}
}
