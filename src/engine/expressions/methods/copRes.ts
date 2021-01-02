import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {TextureContainer} from '../../containers/Texture';

export class CopResExpression extends BaseMethod {
	protected _require_dependency = true;
	// cop_res(0, 'x')
	// cop_res('../REF_bbox', 'x')
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
