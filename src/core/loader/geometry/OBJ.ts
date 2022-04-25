import {Object3D} from 'three';
import {OBJLoader} from '../../../modules/three/examples/jsm/loaders/OBJLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class OBJLoaderHandler extends BaseGeoLoaderHandler<Object3D> {
	protected async _getLoader(): Promise<BaseGeoLoader<Object3D>> {
		return (this._loader = this._loader || (await new OBJLoader(this.loadingManager)));
	}
}
