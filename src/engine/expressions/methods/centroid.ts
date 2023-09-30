/**
 * Returns the centroid of a geometry, or the component of the centroid.
 *
 * @remarks
 * It takes 1 or 2 arguments.
 *
 * `centroid(input_index_or_node_path, vector_component)`
 *
 * - `input_index_or_node_path` is a number or a string
 * - `vector_component` is a string, either 'x', 'y' or 'z'
 *
 * ## Usage
 *
 * - `centroid(0)` - returns the centroid of the input node, as a THREE.Box3
 * - `centroid('/geo1/box')` - returns the centroid of the node /geo1/box, as a THREE.Box3
 * - `centroid('/geo1/box', 'x')` - returns the x component of centroid of the bbox, as a number
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';
import {Vector3Like} from '../../../types/GlobalTypes';
import {Box3, Vector3} from 'three';
const tmpBox = new Box3();
const tmpCenter = new Vector3();
export class CentroidExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['string', 'component_name, x,y or z'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override async processArguments(args: any[]): Promise<number | Vector3> {
		if (args.length >= 1) {
			const index_or_path = args[0];
			const component_name: undefined | keyof Vector3Like = args[1];
			const container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;

			if (container) {
				const coreGroup = container.coreContent();
				if (coreGroup) {
					coreGroup.boundingBox(tmpBox);
					tmpBox.getCenter(tmpCenter);

					if (component_name) {
						const value = tmpCenter[component_name];
						if (value != null) {
							return value;
						} else {
							return 0;
						}
					} else {
						return tmpCenter;
					}
				}
			}
		}
		return 0;
	}
}
