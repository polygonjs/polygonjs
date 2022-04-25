import {BufferGeometry, Mesh, MeshLambertMaterial, Object3D} from 'three';
import {PLYLoader} from '../../../modules/three/examples/jsm/loaders/PLYLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

const matMesh = new MeshLambertMaterial();

export class PLYLoaderHandler extends BaseGeoLoaderHandler<BufferGeometry> {
	protected async _getLoader(): Promise<BaseGeoLoader<BufferGeometry>> {
		return (this._loader = this._loader || (await new PLYLoader(this.loadingManager)));
	}
	protected override _onLoadSuccessGLTF(o: BufferGeometry): Object3D[] {
		return [new Mesh(o, matMesh)];
	}
}
