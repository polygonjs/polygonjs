import {ASSETS_ROOT} from '../AssetsUtils';
import {TextureLoadOptions} from './_BaseImageLoader';
import {CubeTextureLoader, Texture} from 'three';
import {CoreBaseLoader} from '../_Base';
import {CoreLoaderTexture} from '../Texture';
import {Poly} from '../../../engine/Poly';

export class CoreCubeTextureLoader extends CoreBaseLoader<string[]> {
	static PARAM_DEFAULT_PREFIX = `${ASSETS_ROOT}/textures/cube`;
	static PARAM_DEFAULT_SUFFIX = `.jpg`;

	async loadImage(options: TextureLoadOptions): Promise<Texture> {
		const urls = await this._urlToLoad();
		return new Promise(async (resolve, reject) => {
			const loader = await this._getLoader(options);

			urls.forEach((url) => CoreLoaderTexture.incrementInProgressLoadsCount());
			await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();
			loader.load(
				urls,
				(texture: Texture) => {
					urls.forEach((url, i) => {
						const isLast = i == urls.length - 1;
						CoreLoaderTexture.decrementInProgressLoadsCount(url, isLast ? texture : undefined);
					});

					resolve(texture);
				},
				undefined,
				(error: any) => {
					urls.forEach((url) => CoreLoaderTexture.decrementInProgressLoadsCount(url));
					Poly.warn('error', error);
					reject();
				}
			);
		});
	}

	protected async _getLoader(options: TextureLoadOptions) {
		const loader = new CubeTextureLoader(this.loadingManager);
		return loader;
	}
}
