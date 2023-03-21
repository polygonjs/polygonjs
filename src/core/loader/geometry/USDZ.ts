import {Object3D} from 'three';
import {USDZLoader} from 'three/examples/jsm/loaders/USDZLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class USDZLoaderHandler extends BaseObject3DLoaderHandler<Object3D> {
	protected async _getLoader(): Promise<BaseGeoLoader<Object3D>> {
		return (this._loader = this._loader || (await new USDZLoader(this.loadingManager)));
	}
}
