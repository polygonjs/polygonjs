import {Group} from 'three';
import {GEOJSONLoader} from './loaders/GEOJSONLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class GEOJSONLoaderHandler extends BaseGeoLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new GEOJSONLoader(this.loadingManager)));
	}
}
