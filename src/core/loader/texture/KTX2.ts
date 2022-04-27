import {BaseNodeType} from '../../../engine/nodes/_Base';
import {ASSETS_ROOT} from './../AssetsUtils';
import {BaseCoreImageLoader, TextureLoadOptions} from './_BaseImageLoader';
import {KTX2Loader} from '../../../modules/three/examples/jsm/loaders/KTX2Loader';
import {Poly} from '../../../engine/Poly';
import {CoreBaseLoader} from '../_Base';

export class KTX2TextureLoader extends BaseCoreImageLoader {
	static PARAM_ENV_DEFAULT = `${ASSETS_ROOT}/textures/sample_uastc_zstd.ktx2`;

	constructor(_url: string, _node: BaseNodeType) {
		super(_url, _node);
	}

	protected async _getLoader(options: TextureLoadOptions) {
		return KTX2TextureLoader._getLoader(this._node);
	}

	private static _loader: KTX2Loader | undefined;
	static async _getLoader(node: BaseNodeType) {
		return (this._loader = this._loader || (await this._createLoader(node)));
	}
	static async _createLoader(node: BaseNodeType) {
		const loader = new KTX2Loader(this.loadingManager);
		const root = Poly.libs.root();
		const KTX2Path = Poly.libs.KTX2Path();
		if (root || KTX2Path) {
			const decoderPath = `${root || ''}${KTX2Path || ''}/`;

			if (node) {
				const files = ['basis_transcoder.js', 'basis_transcoder.wasm'];
				await CoreBaseLoader._loadMultipleBlobGlobal({
					files: files.map((file) => {
						return {
							fullUrl: `${decoderPath}${file}`,
						};
					}),
					node: node,
					error: 'failed to load basis libraries. Make sure to install them to load .basis files',
				});
			}

			loader.setTranscoderPath(decoderPath);
		} else {
			(loader as any).setTranscoderPath(undefined);
		}
		const renderer = await node.scene().renderersRegister.waitForRenderer();
		if (renderer) {
			loader.detectSupport(renderer);
		} else {
			Poly.warn('texture loader found no renderer for KTX2Loader');
		}
		return loader;
	}
}
