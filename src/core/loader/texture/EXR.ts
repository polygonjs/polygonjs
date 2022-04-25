import {BaseNodeType} from '../../../engine/nodes/_Base';
import {ASSETS_ROOT} from './../AssetsUtils';
import {EXRLoader} from '../../../modules/three/examples/jsm/loaders/EXRLoader';
import {BaseCoreImageLoader, TextureLoadOptions} from './_BaseImageLoader';

export class EXRTextureLoader extends BaseCoreImageLoader {
	static PARAM_ENV_DEFAULT = `${ASSETS_ROOT}/textures/piz_compressed.exr`;

	constructor(_url: string, _node: BaseNodeType) {
		super(_url, _node);
	}

	protected async _getLoader(options: TextureLoadOptions) {
		const loader = new EXRLoader(this.loadingManager);
		if (options.tdataType) {
			loader.setDataType(options.dataType);
		}
		return loader;
	}
}
