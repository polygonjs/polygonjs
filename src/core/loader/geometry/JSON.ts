import {ObjectLoader} from './tmp/ObjectLoader';
import {Object3D} from 'three';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class JSONLoaderHandler extends BaseObject3DLoaderHandler<Object3D> {
	protected async _getLoader(): Promise<BaseGeoLoader<Object3D>> {
		return (this._loader = this._loader || new ObjectLoader(this.loadingManager));
	}
	protected override _errorMessage(url: string, event: ErrorEvent) {
		return `could not loadfrom ${url} (Error: ${event.message}) - Are you sure you did not mean to use the sop/dataUrl node instead?`;
	}
}
