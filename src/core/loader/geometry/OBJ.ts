import {Object3D} from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class OBJLoaderHandler extends BaseObject3DLoaderHandler<Object3D> {
	protected async _getLoader(): Promise<BaseGeoLoader<Object3D>> {
		return (this._loader = this._loader || (await new OBJLoader(this.loadingManager)));
	}
}
