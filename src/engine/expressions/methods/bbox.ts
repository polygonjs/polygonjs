/**
 * Returns the bbox of a geometry, or a component of the bbox.
 *
 * @remarks
 * It takes 1, 2 or 3 arguments.
 *
 * bbox(<input_index_or_node_path\>, <bbox_vector\>, <vector_component\>)
 *
 * - **<input_index_or_node_path\>** is a number or a string
 * - **<bbox_vector\>** is a string, either 'min' or 'max'
 * - **<vector_component\>** is a string, either 'x', 'y' or 'z'
 *
 * ## Usage
 *
 * - `bbox(0)` - returns the bbox of the input node, as a THREE.Box3
 * - `bbox('/geo1/box')` - returns the bbox of the node /geo1/box, as a THREE.Box3
 * - `bbox('/geo1/box', 'min')` - returns the min vector of the bbox, as a THREE.Vector3
 * - `bbox('/geo1/box', 'min', 'x')` - returns the x component of min vector of the bbox, as a number
 *
 */
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {Vector3} from 'three/src/math/Vector3';
import {GeometryContainer} from '../../containers/Geometry';
import {Vector3Like} from '../../../types/GlobalTypes';
import {Box3} from 'three/src/math/Box3';

interface BoxComponents {
	min: Vector3;
	max: Vector3;
	size: Vector3;
	center: Vector3;
}

const VECTOR_NAMES: Array<keyof BoxComponents> = ['min', 'max', 'size', 'center'];
const COMPONENT_NAMES = ['x', 'y', 'z'];

export class BboxExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['string', 'vector name, min, max, size or center'],
			['string', 'component_name, x,y or z'],
		];
	}

	override findDependency(index_or_path: number | string): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(index_or_path);
	}

	override processArguments(args: any[]): Promise<any> {
		let value: number | Vector3 | Box3 = 0;
		return new Promise(async (resolve, reject) => {
			if (args.length >= 1) {
				const index_or_path = args[0];
				const vector_name: undefined | keyof BoxComponents = args[1];
				const component_name: undefined | keyof Vector3Like = args[2];

				let container: GeometryContainer | null = null;
				try {
					container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
				}
				if (container) {
					value = this._get_value_from_container(container, vector_name, component_name);
					resolve(value);
				}
			} else {
				resolve(0);
			}
		});
	}

	private _get_value_from_container(
		container: GeometryContainer,
		vector_name: undefined | keyof BoxComponents,
		component_name: undefined | keyof Vector3Like
	) {
		const bbox = container.boundingBox();
		if (!vector_name) {
			return bbox;
		}
		if (VECTOR_NAMES.indexOf(vector_name) >= 0) {
			let vector = new Vector3();
			switch (vector_name) {
				case 'size':
					bbox.getSize(vector);
					break;
				case 'center':
					bbox.getCenter(vector);
					break;
				default:
					vector = bbox[vector_name];
			}

			if (!component_name) {
				return vector;
			}

			if (COMPONENT_NAMES.indexOf(component_name) >= 0) {
				return vector[component_name];
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	}
}
