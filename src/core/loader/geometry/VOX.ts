import {Mesh} from 'three';
import {VOXLoader, Chunk, VOXMesh} from 'three/examples/jsm/loaders/VOXLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class VOXLoaderHandler extends BaseObject3DLoaderHandler<Chunk[]> {
	protected async _getLoader(): Promise<BaseGeoLoader<Chunk[]>> {
		return (this._loader = this._loader || new VOXLoader(this.loadingManager));
	}
	protected override _onLoadSuccess(chunks: Chunk[]): Mesh[] {
		const meshes: Mesh[] = [];
		for (const chunk of chunks) {
			const voxMesh = new VOXMesh(chunk);
			// create a standard mesh, to avoid the VOXMesh.clone method
			// as VOXMesh takes chunks in the constructor
			const mesh = new Mesh(voxMesh.geometry, voxMesh.material);
			meshes.push(mesh);
		}
		return meshes;
	}
}
