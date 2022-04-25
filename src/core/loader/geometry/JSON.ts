import {Object3D, ObjectLoader} from 'three';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class JSONLoaderHandler extends BaseGeoLoaderHandler<Object3D> {
	protected async _getLoader(): Promise<BaseGeoLoader<Object3D>> {
		return (this._loader = this._loader || (await new ObjectLoader(this.loadingManager)));
	}
}
