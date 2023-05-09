import {BaseNodeType} from '../../../engine/nodes/_Base';
import {ASSETS_ROOT} from './../AssetsUtils';
import {BaseCoreImageLoader, TextureLoadOptions} from './_BaseImageLoader';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';

export class HDRTextureLoader extends BaseCoreImageLoader {
	static PARAM_ENV_DEFAULT = `${ASSETS_ROOT}/textures/studio_small_09_2k.hdr`;

	constructor(_url: string, _node: BaseNodeType) {
		super(_url, _node);
	}

	protected async _getLoader(options: TextureLoadOptions) {
		const loader = new RGBELoader(this.loadingManager);
		if (options.tdataType) {
			loader.setDataType(options.dataType);
		}
		return loader;
	}
}
