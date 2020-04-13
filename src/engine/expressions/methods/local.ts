import {BaseMethod} from './_Base';
import {Poly} from '../../Poly';

export class LocalExpression extends BaseMethod {
	// constructor() {
	// 	super();
	// }

	static required_arguments() {
		return [['string', 'path']];
	}

	process_arguments(args: any[]): Promise<string> {
		return new Promise((resolve, reject) => {
			this.request_asset_url(args[0]).then((url) => {
				resolve(url);
			});
		});
	}
	// find_dependency(index_or_path: number | string): MethodDependency {
	// 	return null
	// }

	// TODO: add error management
	request_asset_url(name: string): Promise<string> {
		return new Promise((resolve, reject) => {
			// const scene = this.node.scene()
			// const scene_uuid = scene.uuid();

			let url;

			const desktop_controller = Poly.instance().desktop_controller();
			if (desktop_controller.active()) {
				desktop_controller.add_local_path(name, this.param);
				url = desktop_controller.local_path_server_url(name);
				resolve(url);
			} else {
				return resolve('');
			}
		});
	}
}
