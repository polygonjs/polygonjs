import {BaseNodeType} from '../../../engine/nodes/_Base';
import {ASSETS_ROOT} from '../AssetsUtils';
import {BaseCoreImageLoader, TextureLoadOptions} from './_BaseImageLoader';
import {TextureLoader} from 'three';

export class ImageDefaultTextureLoader extends BaseCoreImageLoader {
	static PARAM_DEFAULT = `${ASSETS_ROOT}/textures/uv.jpg`;

	constructor(_url: string, _node: BaseNodeType) {
		super(_url, _node);
	}

	protected async _getLoader(options: TextureLoadOptions) {
		const loader = new TextureLoader(this.loadingManager);
		return loader;
	}
}
