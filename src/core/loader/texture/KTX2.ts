import {BaseNodeType} from '../../../engine/nodes/_Base';
import {ASSETS_ROOT} from './../AssetsUtils';
import {BaseCoreImageLoader, TextureLoadOptions} from './_BaseImageLoader';
import {KTX2Loader} from '../../../modules/three/examples/jsm/loaders/KTX2Loader';
import {Poly} from '../../../engine/Poly';
import {BaseLoaderLoadOptions, CoreBaseLoader} from '../_Base';
import {sanitizeUrl} from '../../UrlHelper';

type Resolve = (loader: KTX2Loader) => void;
export class KTX2TextureLoader extends BaseCoreImageLoader {
	static PARAM_ENV_DEFAULT = `${ASSETS_ROOT}/textures/sample_uastc_zstd.ktx2`;
	private static _loadStarted = false;
	private static _resolves: Resolve[] = [];

	constructor(_url: string, _node: BaseNodeType) {
		super(_url, _node);
	}

	protected async _getLoader(options: TextureLoadOptions) {
		return KTX2TextureLoader.getLoader({node: this._node});
	}

	private static _loader: KTX2Loader | undefined;
	static async getLoader(options: BaseLoaderLoadOptions) {
		return (this._loader = this._loader || (await this._createLoaderOrQueue(options)));
	}
	private static async _createLoaderOrQueue(options: BaseLoaderLoadOptions): Promise<KTX2Loader> {
		if (this._loadStarted) {
			return new Promise((resolve) => {
				this._resolves.push(resolve);
			});
		} else {
			this._loadStarted = true;
			return this.__createLoader(options);
		}
	}
	private static async __createLoader(options: BaseLoaderLoadOptions) {
		const loader = new KTX2Loader(this.loadingManager);
		const root = Poly.libs.root();
		const KTX2Path = Poly.libs.KTX2Path();
		if (root || KTX2Path) {
			const decoderPath = sanitizeUrl(`${root || ''}${KTX2Path || ''}/`);

			if (options.node) {
				const files = ['basis_transcoder.js', 'basis_transcoder.wasm'];
				await CoreBaseLoader._loadMultipleBlobGlobal({
					files: files.map((file) => {
						return {
							fullUrl: `${decoderPath}${file}`,
						};
					}),
					node: options.node,
					error: 'failed to load basis libraries. Make sure to install them to load .basis files',
				});
			}

			loader.setTranscoderPath(decoderPath);
		} else {
			(loader as any).setTranscoderPath(undefined);
		}
		const renderer = await options.node.scene().renderersRegister.waitForRenderer();
		if (renderer) {
			loader.detectSupport(renderer);
		} else {
			Poly.warn('texture loader found no renderer for KTX2Loader');
		}

		for (let resolve of this._resolves) {
			resolve(loader);
		}

		return loader;
	}
}
