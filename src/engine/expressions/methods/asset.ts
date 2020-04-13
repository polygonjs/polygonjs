import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';

type AssetUrlResolver = (asset_name: string, scene_uuid?: string) => string;

const DEFAULT_RESOLVER: AssetUrlResolver = (asset_name: string, scene_uuid?: string) => {
	return `/assets/${name}`;
};

export class AssetExpression extends BaseMethod {
	static _resolver: AssetUrlResolver = DEFAULT_RESOLVER;
	static set_url_resolver(resolver: AssetUrlResolver) {
		this._resolver = resolver;
	}

	static required_arguments() {
		return [['string', 'path']];
	}

	async process_arguments(args: any[]): Promise<string> {
		const url = await this.request_asset_url(args[0]);
		return url;
	}
	find_dependency(index_or_path: number | string): MethodDependency | null {
		return null;
	}

	// TODO: add error management
	async request_asset_url(name: string): Promise<string> {
		const scene = this.node.scene;
		const scene_uuid: string = scene.uuid;

		name = encodeURIComponent(name);
		console.log('AssetExpression._resolver', AssetExpression._resolver);
		const url = AssetExpression._resolver(name, scene_uuid);

		console.log('fetching', url);
		const response = await fetch(url);
		const data = await response.json();
		return data['url'] || '';
	}
}
