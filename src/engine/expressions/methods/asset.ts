import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {BaseParamType} from '../../params/_Base';

interface AssetUrlResolverArgs {
	asset_name: string;
	param: BaseParamType;
	scene_uuid?: string;
}
type AssetUrlResolver = (args: AssetUrlResolverArgs) => Promise<string>;

const DEFAULT_RESOLVER: AssetUrlResolver = async (args: AssetUrlResolverArgs) => {
	const encoded_asset_name = encodeURIComponent(args.asset_name);
	return `/assets/${encoded_asset_name}`;
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
	async request_asset_url(asset_name: string): Promise<string> {
		const scene = this.node.scene;
		const scene_uuid: string = scene.uuid;

		// const encoded_asset_name = encodeURIComponent(asset_name);
		const url = await AssetExpression._resolver({
			asset_name: asset_name,
			param: this.param,
			scene_uuid: scene_uuid,
		});

		const response = await fetch(url);
		const data = await response.json();
		return data['url'] || '';
	}
}
