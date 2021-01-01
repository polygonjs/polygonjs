import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
// import Walker from 'src/core/Walker';
import {GeometryContainer} from '../../containers/Geometry';

export class CentroidExpression extends BaseMethod {
	protected _require_dependency = true;
	// bbox(0).min.x
	// bbox('../REF_bbox').min.x
	static required_arguments() {
		return [
			['string', 'path to node'],
			['string', 'component_name, x,y or z'],
		];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		return this.create_dependency_from_index_or_path(index_or_path);
	}

	process_arguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			// const path = args
			// this.get_referenced_param(path).eval_p().then(val=>{
			// 	resolve(val)
			// })
			if (args.length == 2) {
				const index_or_path = args[0];
				const component_name = args[1] as keyof Vector3Like;
				let container: GeometryContainer | null = null;
				try {
					container = (await this.get_referenced_node_container(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
				}

				if (container) {
					const bbox = container.boundingBox();
					const center = bbox.min.clone().add(bbox.max).multiplyScalar(0.5);

					const value = center[component_name];
					if (value != null) {
						resolve(value);
					} else {
						// throw "only component names are x, y and z";
						resolve(0);
					}
				}
			} else {
				resolve(0);
			}
		});
		// return this._get_param_value(args[0], args[1], callback);
	}

	// _get_param_value(index_or_path, component_name, callback){
	// 	return this.get_referenced_node_container(index_or_path, container=> {
	// 		let value;
	// 		const bbox = container.boundingBox();
	// 		const size = bbox.min.clone().add(bbox.max).multiplyScalar(0.5);

	// 		if ((value = size[component_name]) != null) {
	// 			return callback(value);
	// 		} else {
	// 			throw "only component names are x, y and z";
	// 		}
	// 	});
	// }
}
