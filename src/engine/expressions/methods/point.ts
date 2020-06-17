import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';
// import {CoreGroup} from '../../../core/Geometry/Group'

export class PointExpression extends BaseMethod {
	protected _require_dependency = true;
	static required_arguments() {
		return [
			['string', 'path to node'],
			['index', 'point index'],
			['string', 'attribute name'],
		];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		return this.create_dependency_from_index_or_path(index_or_path);
	}

	process_arguments(args: any[]): Promise<any> {
		// const time_start = performance.now();
		// console.log('point start', args);
		return new Promise(async (resolve, reject) => {
			if (args.length == 3) {
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
					// console.log('point end', args, value, performance.now() - time_start);
					resolve(value);
				}
			} else {
				resolve(0);
			}
		});
	}

	_get_value_from_container(container: GeometryContainer, attrib_name: string, point_index: number) {
		const core_group = container.core_content();
		// TODO: optimise and store the group_wrapper in the json_node
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

	// _get_param_value(index_or_path, point_index, attrib_name, callback){
	// 	return this.get_referenced_node_container(index_or_path, container=> {
	// 		const group = container.group({clone: false});
	// 		const group_wrapper = new Core.Geometry.Group(group);
	// 		// TODO: optimise and store the group_wrapper in the json_node
	// 		const point = group_wrapper.points()[point_index];

	// 		if (point != null) {
	// 			const value = point.attrib_value(attrib_name);
	// 			if (value != null) {
	// 				return callback(value);
	// 			} else {
	// 				//throw "no attribute #{attrib_name} found"
	// 				console.error(`no attribute ${attrib_name} found`);
	// 				return callback(0);
	// 			}
	// 		} else {
	// 			console.error(`no point found with index ${point_index}`);
	// 			return callback(0);
	// 		}
	// 	});
	// }
}
