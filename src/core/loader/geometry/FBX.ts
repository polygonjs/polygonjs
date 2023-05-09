import {Group} from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class FBXLoaderHandler extends BaseObject3DLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new FBXLoader(this.loadingManager)));
	}
}
