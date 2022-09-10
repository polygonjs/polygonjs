import {Object3D} from 'three';
import {Poly} from '../../../engine/Poly';
import {DRACOLoader} from '../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader, GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {BaseLoaderLoadOptions, CoreBaseLoader} from '../_Base';
import {BaseGeoLoader, BaseGeoLoaderHandler} from './_BaseLoaderHandler';
import {KTX2TextureLoader} from '../texture/KTX2';
import {KTX2Loader} from '../../../modules/three/examples/jsm/loaders/KTX2Loader';

interface GLTFLoaderLoadOptions extends BaseLoaderLoadOptions {
	draco: boolean;
	ktx2: boolean;
}

export class GLTFLoaderHandler extends BaseGeoLoaderHandler<GLTF> {
	//
	private _gltfLoader: GLTFLoader | undefined;
	private _gltfdracoLoader: GLTFLoader | undefined;
	private _ktx2gltfLoader: GLTFLoader | undefined;
	private _ktx2gltfdracoLoader: GLTFLoader | undefined;
	//
	private _dracoLoader: DRACOLoader | undefined;
	private _ktx2Loader: KTX2Loader | undefined;
	override reset() {
		super.reset();
		this._dracoLoader?.dispose();
		this._gltfLoader = undefined;
		this._gltfdracoLoader = undefined;
		this._dracoLoader = undefined;
		this._ktx2Loader = undefined;
	}
	override async load(options: GLTFLoaderLoadOptions): Promise<Object3D[] | undefined> {
		return super.load(options);
	}

	protected async _getLoader(options: GLTFLoaderLoadOptions): Promise<BaseGeoLoader<GLTF>> {
		if (options.ktx2) {
			if (options.draco) {
				return (this._ktx2gltfdracoLoader =
					this._ktx2gltfdracoLoader || (await this._createGLTFLoader(options)));
			} else {
				return (this._ktx2gltfLoader = this._ktx2gltfLoader || (await this._createGLTFLoader(options)));
			}
		} else {
			if (options.draco) {
				return (this._gltfdracoLoader = this._gltfdracoLoader || (await this._createGLTFLoader(options)));
			} else {
				return (this._gltfLoader = this._gltfLoader || (await this._createGLTFLoader(options)));
			}
		}
	}
	private async _createGLTFLoader(options: GLTFLoaderLoadOptions) {
		const loader = new GLTFLoader(this.loadingManager);
		if (options.draco) {
			await this._setupDRACO(loader, options);
		}
		if (options.ktx2) {
			await this._setupKTX2(loader, options);
		}
		return loader;
	}

	// private async _createGLTFLoaderWithDRACO(options: BaseLoaderLoadOptions) {
	// 	const loader = new GLTFLoader(this.loadingManager);
	// 	await this._setupDRACO(loader, options);
	// 	await this._setupKTX2(loader, options);
	// 	return loader;
	// }

	private async _setupDRACO(gltfLoader: GLTFLoader, options: BaseLoaderLoadOptions) {
		this._dracoLoader = this._dracoLoader || (await this._createDRACOLoader(options));
		gltfLoader.setDRACOLoader(this._dracoLoader);
	}
	protected async _setupKTX2(gltfLoader: GLTFLoader, options: BaseLoaderLoadOptions) {
		this._ktx2Loader = this._ktx2Loader || (await KTX2TextureLoader.getLoader(options));
		gltfLoader.setKTX2Loader(this._ktx2Loader);
	}
	private async _createDRACOLoader(options: BaseLoaderLoadOptions) {
		const useJS = false;
		const node = options.node;
		const dracoLoader = new DRACOLoader(this.loadingManager);
		const root = Poly.libs.root();
		const DRACOGLTFPath = Poly.libs.DRACOGLTFPath();
		if (root || DRACOGLTFPath) {
			const decoderPath = `${root || ''}${DRACOGLTFPath || ''}/`;

			const files = useJS ? ['draco_decoder.js'] : ['draco_decoder.wasm', 'draco_wasm_wrapper.js'];
			await CoreBaseLoader._loadMultipleBlobGlobal({
				files: files.map((file) => {
					return {
						fullUrl: `${decoderPath}${file}`,
					};
				}),
				node,
				error: 'failed to load draco libraries. Make sure to install them to load .glb files',
			});

			dracoLoader.setDecoderPath(decoderPath);
		} else {
			(dracoLoader as any).setDecoderPath(undefined);
		}
		// not having this uses wasm if the relevant libraries are found
		dracoLoader.setDecoderConfig({type: useJS ? 'js' : 'wasm'});
		dracoLoader.preload();
		return dracoLoader;
	}
	protected override _onLoadSuccess(gltf: GLTF): Object3D[] {
		const scene = gltf.scene || gltf.scenes[0];
		scene.animations = gltf.animations;

		return [scene];
	}
}
