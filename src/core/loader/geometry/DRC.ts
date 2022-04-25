import {BufferGeometry, Mesh, MeshLambertMaterial, Object3D} from 'three';
import {Poly} from '../../../engine/Poly';
import {DRACOLoader} from '../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {CoreBaseLoader} from '../_Base';
import {BaseGeoLoaderHandler, BaseGeoLoader, BaseLoaderLoadOptions} from './_BaseLoaderHandler';

const _defaultMatMesh = new MeshLambertMaterial();

export class DRCLoaderHandler extends BaseGeoLoaderHandler<BufferGeometry> {
	protected async _getLoader(options: BaseLoaderLoadOptions): Promise<BaseGeoLoader<BufferGeometry>> {
		return (this._loader = this._loader || (await this._createDRACOLoader(options)));
	}
	private async _createDRACOLoader(options: BaseLoaderLoadOptions) {
		const useJS = false;
		const node = options.node;
		const dracoLoader = new DRACOLoader(this.loadingManager);
		const root = Poly.libs.root();
		const DRACOPath = Poly.libs.DRACOPath();
		if (root || DRACOPath) {
			const decoderPath = `${root || ''}${DRACOPath || ''}/`;

			const files = useJS ? ['draco_decoder.js'] : ['draco_decoder.wasm', 'draco_wasm_wrapper.js'];
			await CoreBaseLoader._loadMultipleBlobGlobal({
				files: files.map((file) => {
					return {
						storedUrl: `${decoderPath}${file}`,
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

		dracoLoader.setDecoderConfig({type: useJS ? 'js' : 'wasm'});
		return dracoLoader;
	}
	protected override _onLoadSuccessGLTF(geometry: BufferGeometry): Object3D[] {
		return [new Mesh(geometry, _defaultMatMesh)];
	}
}
