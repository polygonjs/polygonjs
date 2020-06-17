import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {Vector3} from 'three/src/math/Vector3';
import {GeometryContainer} from '../../containers/Geometry';

// import Walker from 'src/core/Walker';

interface BoxComponents {
	min: Vector3;
	max: Vector3;
	size: Vector3;
	center: Vector3;
}

const VECTOR_NAMES: Array<keyof BoxComponents> = ['min', 'max', 'size', 'center'];
const COMPONENT_NAMES = ['x', 'y', 'z'];

export class BboxExpression extends BaseMethod {
	protected _require_dependency = true;
	// bbox(0).min.x
	// bbox('../REF_bbox').min.x
	static required_arguments() {
		return [
			['string', 'path to node'],
			['string', 'vector name, min, max, size or center'],
			['string', 'component_name, x,y or z'],
		];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		return this.create_dependency_from_index_or_path(index_or_path);
	}

	process_arguments(args: any[]): Promise<any> {
		let value = 0;
		return new Promise(async (resolve, reject) => {
			if (args.length == 3) {
				const index_or_path = args[0];
				const vector_name = args[1];
				const component_name = args[2];

				let container: GeometryContainer | null = null;
				try {
					container = (await this.get_referenced_node_container(index_or_path)) as GeometryContainer;
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
		vector_name: keyof BoxComponents,
		component_name: keyof Vector3Like
	) {
		if (VECTOR_NAMES.indexOf(vector_name) >= 0) {
			const bbox = container.bounding_box();

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

			if (COMPONENT_NAMES.indexOf(component_name) >= 0) {
				//(value = vector[component_name])?
				return vector[component_name];
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	}
}
