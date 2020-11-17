import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

const EXPECTED_ARGS_COUNT = 3;
export class PointExpression extends BaseMethod {
	protected _require_dependency = true;
	static required_arguments() {
		return [
			['string', 'path to node'],
			['string', 'attribute name'],
			['index', 'point index'],
		];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		return this.create_dependency_from_index_or_path(index_or_path);
	}

	process_arguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == EXPECTED_ARGS_COUNT) {
				const index_or_path = args[0];
				const attrib_name = args[1];
				const point_index = args[2];
				let container: GeometryContainer | null = null;
				try {
					container = (await this.get_referenced_node_container(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
				}
				if (container) {
					const value = this._get_value_from_container(container, attrib_name, point_index);
					resolve(value);
				}
			} else {
				console.warn(`${args.length} given when expected ${EXPECTED_ARGS_COUNT}`);
				resolve(0);
			}
		});
	}

	_get_value_from_container(container: GeometryContainer, attrib_name: string, point_index: number) {
		const core_group = container.core_content();
		if (core_group) {
			const point = core_group.points()[point_index];

			if (point) {
				return point.attrib_value(attrib_name);
			} else {
				return 0;
			}
		} else {
			return null;
		}
	}
}
