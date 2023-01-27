/**
 * Returns the resolution of a texture of a COP node.
 *
 * @remarks
 * It takes 1 or 2 arguments
 *
 * `copRes(input_index_or_node_path, vector_component)`
 *
 * - `input_index_or_node_path` is a number or a string
 * - `vector_component` is a string or number, either 'x', 'y', 0 or 1
 *
 * ## Usage
 *
 * - `copRes('/COP/image1')` - returns the size of the texture, as a THREE.Vector2
 * - `copRes('/COP/image1', 'x')` - returns the x component of the size of the texture, as a number
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {TextureContainer} from '../../containers/Texture';
import {Vector2} from 'three';

const COMPONENT_NAME_0 = [0, '0', 'x'];
const COMPONENT_NAME_1 = [1, '1', 'y'];

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
			const indexOrPath = args[0];
			const componentName = args[1];
			const container = (await this.getReferencedNodeContainer(indexOrPath)) as TextureContainer;

			if (container) {
				const resolution = container.resolution();
				if (componentName) {
					if (COMPONENT_NAME_0.includes(componentName)) {
						return resolution[0];
					} else {
						if (COMPONENT_NAME_1.includes(componentName)) {
							return resolution[1];
						}
					}
				} else {
					this._resolution.set(resolution[0], resolution[1]);
					return this._resolution;
				}
			}
			this._resolution.set(1, 1);
			return args.length == 1 ? 1 : this._resolution;
		}
		return 1;
	}
}
