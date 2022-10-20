import {BaseMethodFindDependencyArgs} from './_Base';
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
import {Vector2} from 'three';

export class CopResExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['string', 'component_name: x or y'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	private _resolution = new Vector2();
	override async processArguments(args: any[]): Promise<number | Vector2> {
		if (args.length == 1 || args.length == 2) {
			const index_or_path = args[0];
			const component_name = args[1];
			const container = (await this.getReferencedNodeContainer(index_or_path)) as TextureContainer;

			if (container) {
				const resolution = container.resolution();
				if (component_name) {
					if ([0, '0', 'x'].includes(component_name)) {
						return resolution[0];
					} else {
						if ([1, '1', 'y'].includes(component_name)) {
							return resolution[1];
						}
					}
				} else {
					this._resolution.set(resolution[0], resolution[1]);
					return this._resolution;
				}
			}
		}
		return -1;
	}
}
