import {Object3D} from 'three';
import {TDSLoader} from 'three/examples/jsm/loaders/TDSLoader';
import {BaseObject3DLoaderHandler} from './_BaseLoaderHandler';
import {BaseLoaderLoadOptions} from '../_Base';

export class TDSLoaderHandler extends BaseObject3DLoaderHandler<Object3D> {
	private _resourceUrl: string | undefined;
	protected async _getLoader(options: BaseLoaderLoadOptions): Promise<TDSLoader> {
		this._loader = this._loader || new TDSLoader(this.loadingManager);
		if (this._resourceUrl) {
			(this._loader as TDSLoader).setResourcePath(this._resourceUrl);
		}
		return this._loader as TDSLoader;
	}
	protected override _onLoadSuccess(object: Object3D): Object3D[] {
		return [object];
	}
	setResourceUrl(resourceUrl: string) {
		this._resourceUrl = resourceUrl;
		if (this._loader) {
			(this._loader as TDSLoader).setResourcePath(resourceUrl);
		}
	}
}
