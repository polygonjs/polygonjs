import {BufferGeometry, Mesh, MeshLambertMaterial, Object3D} from 'three';
import {STLLoader} from '../../../modules/three/examples/jsm/loaders/STLLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

const matMesh = new MeshLambertMaterial();

export class STLLoaderHandler extends BaseGeoLoaderHandler<BufferGeometry> {
	protected async _getLoader(): Promise<BaseGeoLoader<BufferGeometry>> {
		return (this._loader = this._loader || (await new STLLoader(this.loadingManager)));
	}
	protected override _onLoadSuccess(o: BufferGeometry): Object3D[] {
		return [new Mesh(o, matMesh)];
	}
}
