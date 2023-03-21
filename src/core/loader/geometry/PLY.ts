import {BufferGeometry, Mesh, MeshLambertMaterial, Object3D} from 'three';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

const matMesh = new MeshLambertMaterial();

export class PLYLoaderHandler extends BaseObject3DLoaderHandler<BufferGeometry> {
	protected async _getLoader(): Promise<BaseGeoLoader<BufferGeometry>> {
		return (this._loader = this._loader || (await new PLYLoader(this.loadingManager)));
	}
	protected override _onLoadSuccess(o: BufferGeometry): Object3D[] {
		return [new Mesh(o, matMesh)];
	}
}
