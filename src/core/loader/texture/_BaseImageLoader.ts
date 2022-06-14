import {Texture} from 'three';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {Poly} from '../../../engine/Poly';
import {CoreLoaderTexture} from '../Texture';
import {BaseTextureLoader} from './_BaseTextureLoader';

export interface TextureLoadOptions {
	tdataType: boolean;
	dataType: number;
}

type OnSuccess = (o: Texture) => void;
type OnProgress = (n: ProgressEvent<EventTarget>) => void;
type OnError = (event: ErrorEvent) => void;

export abstract class BaseImageLoader {
	abstract load: (url: string, onSuccess: OnSuccess, onProgress?: OnProgress, onError?: OnError) => void;
}

export abstract class BaseCoreImageLoader extends BaseTextureLoader {
	constructor(_url: string, protected override _node: BaseNodeType) {
		super(_url, _node);
	}

	async loadImage(options: TextureLoadOptions): Promise<Texture> {
		const url = await this._urlToLoad();
		return new Promise(async (resolve, reject) => {
			const loader = await this._getLoader(options);
			CoreLoaderTexture.incrementInProgressLoadsCount();
			await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();
			loader.load(
				url,
				(texture: Texture) => {
					texture.matrixAutoUpdate = false;
					CoreLoaderTexture.decrementInProgressLoadsCount(url, texture);

					resolve(texture);
				},
				undefined,
				(error: any) => {
					CoreLoaderTexture.decrementInProgressLoadsCount(url);
					Poly.warn('error', error);
					reject();
				}
			);
		});
	}

	protected abstract _getLoader(options: TextureLoadOptions): Promise<BaseImageLoader>;
}
