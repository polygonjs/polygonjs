import {Group} from 'three';
import {FBXLoader} from '../../../modules/three/examples/jsm/loaders/FBXLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class FBXLoaderHandler extends BaseGeoLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new FBXLoader(this.loadingManager)));
	}
}
