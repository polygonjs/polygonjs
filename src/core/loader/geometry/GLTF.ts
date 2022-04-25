import {Object3D} from 'three';
import {Poly} from '../../../engine/Poly';
import {DRACOLoader} from '../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader, GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {CoreBaseLoader} from '../_Base';
import {BaseGeoLoader, BaseGeoLoaderHandler, BaseLoaderLoadOptions} from './_BaseLoaderHandler';

interface GLTFLoaderLoadOptions extends BaseLoaderLoadOptions {
	draco: boolean;
}

export class GLTFLoaderHandler extends BaseGeoLoaderHandler<GLTF> {
	private _gltfLoader: GLTFLoader | undefined;
	private _gltfdracoLoader: GLTFLoader | undefined;
	private _dracoLoader: DRACOLoader | undefined;
	override reset() {
		super.reset();
		this._dracoLoader?.dispose();
		this._gltfLoader = undefined;
		this._gltfdracoLoader = undefined;
		this._dracoLoader = undefined;
	}
	override async load(options: GLTFLoaderLoadOptions): Promise<Object3D[] | undefined> {
		return super.load(options);
	}

	protected async _getLoader(options: GLTFLoaderLoadOptions): Promise<BaseGeoLoader<GLTF>> {
		if (options.draco) {
			return (this._gltfdracoLoader = this._gltfdracoLoader || (await this._createGLTFLoaderWithDRACO(options)));
		} else {
			return (this._gltfLoader = this._gltfLoader || (await this._createGLTFLoader(options)));
		}
	}
	private _createGLTFLoader(options: GLTFLoaderLoadOptions) {
		return new GLTFLoader(this.loadingManager);
	}

	private async _createGLTFLoaderWithDRACO(options: BaseLoaderLoadOptions) {
		const loader = new GLTFLoader(this.loadingManager);
		await this._setupDRACO(loader, options);
		return loader;
	}

	private async _setupDRACO(gltfLoader: GLTFLoader, options: BaseLoaderLoadOptions) {
		this._dracoLoader = this._dracoLoader || (await this._createDRACOLoader(options));
		gltfLoader.setDRACOLoader(this._dracoLoader);
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
	protected override _onLoadSuccessGLTF(gltf: GLTF): Object3D[] {
		const scene = gltf.scene || gltf.scenes[0];
		scene.animations = gltf.animations;

		return [scene];
	}
}
