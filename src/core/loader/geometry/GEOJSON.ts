import {Group} from 'three';
import {GEOJSONLoader} from './loaders/GEOJSONLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class GEOJSONLoaderHandler extends BaseObject3DLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new GEOJSONLoader(this.loadingManager)));
	}
}
