import {Object3D} from 'three';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {Poly} from '../../../engine/Poly';
import {ModuleName} from '../../../engine/poly/registers/modules/Common';
import {DRACOLoader} from '../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader, GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {CoreLoaderGeometry} from '../Geometry';
import {CoreBaseLoader, LOADING_MANAGER} from '../_Base';

interface DRACOOptions {
	useJS: boolean;
}
interface LoadOptions {
	draco: boolean;
	node: BaseNodeType;
}

export class GLTFLoaderHandler extends CoreBaseLoader {
	// private static GLTFloadingManager = this._createLoadingManager();
	private static gltfLoader: GLTFLoader | undefined;
	private static gltfdracoLoader: GLTFLoader | undefined;
	private static dracoLoader: DRACOLoader | undefined;

	static reset() {
		this.gltfLoader = undefined;
		this.gltfdracoLoader = undefined;
		this.dracoLoader = undefined;
	}

	// static _createLoadingManager() {
	// 	const loadingManager = createLoadingManager();
	// 	// loadingManager.onStart = () => {
	// 	// 	console.log('start');
	// 	// };
	// 	// loadingManager.onLoad = () => {
	// 	// 	console.log('onLoad');
	// 	// };
	// 	// loadingManager.onError = () => {
	// 	// 	console.log('error');
	// 	// };
	// 	return loadingManager;
	// }

	async load(options: LoadOptions): Promise<Object3D[] | undefined> {
		const loader = await (options.draco
			? GLTFLoaderHandler.GLTFDRACOLoader(options.node)
			: GLTFLoaderHandler.GLTFLoader(options.node));
		if (!loader) {
			return;
		}
		const url = await this._urlToLoad();

		return new Promise(async (resolve) => {
			CoreLoaderGeometry.incrementInProgressLoadsCount();
			await CoreLoaderGeometry.waitForMaxConcurrentLoadsQueueFreed();

			loader.load(
				url,
				(gltf: GLTF) => {
					CoreLoaderGeometry.decrementInProgressLoadsCount();
					const newObjects = GLTFLoaderHandler.onLoadSuccessGLTF(gltf);
					resolve(newObjects);
				},
				(progress) => {},
				(event: ErrorEvent) => {
					CoreLoaderGeometry.decrementInProgressLoadsCount();
					options.node?.states.error.set(event.message);
				}
			);
		});
	}

	static onLoadSuccessGLTF(gltf: GLTF): Object3D[] {
		const scene = gltf.scene || gltf.scenes[0];
		scene.animations = gltf.animations;

		return [scene];
	}

	static async GLTFLoader(node: BaseNodeType) {
		const GLTFLoader = Poly.modulesRegister.module(ModuleName.GLTFLoader);
		if (GLTFLoader) {
			return (this.gltfLoader = this.gltfLoader || new GLTFLoader(LOADING_MANAGER));
		}
	}
	static async GLTFDRACOLoader(node: BaseNodeType) {
		const GLTFLoader = Poly.modulesRegister.module(ModuleName.GLTFLoader);
		if (GLTFLoader) {
			return (this.gltfdracoLoader =
				this.gltfdracoLoader || (await this.createGLTFLoaderWithDRACO({useJS: false}, node)));
		}
	}

	static async createGLTFLoaderWithDRACO(options: DRACOOptions, node: BaseNodeType) {
		const loader = new GLTFLoader(LOADING_MANAGER);
		await this.setupDRACO(loader, options, node);
		return loader;
	}

	static async setupDRACO(gltfLoader: GLTFLoader, options: DRACOOptions, node: BaseNodeType) {
		const DRACOLoader = Poly.modulesRegister.module(ModuleName.DRACOLoader);
		if (DRACOLoader) {
			this.dracoLoader = this.dracoLoader || (await this._createDRACOLoader(options, node));
			gltfLoader.setDRACOLoader(this.dracoLoader);
		}
	}
	private static async _createDRACOLoader(options: DRACOOptions, node: BaseNodeType) {
		const dracoLoader = new DRACOLoader(LOADING_MANAGER);
		const root = Poly.libs.root();
		const DRACOGLTFPath = Poly.libs.DRACOGLTFPath();
		if (root || DRACOGLTFPath) {
			const decoderPath = `${root || ''}${DRACOGLTFPath || ''}/`;

			const files = options.useJS ? ['draco_decoder.js'] : ['draco_decoder.wasm', 'draco_wasm_wrapper.js'];
			await this._loadMultipleBlobGlobal({
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
		dracoLoader.setDecoderConfig({type: options.useJS ? 'js' : 'wasm'});
		dracoLoader.preload();
		return dracoLoader;
	}
}
