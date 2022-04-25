import {Group} from 'three';
import {LDrawLoader} from '../../../modules/three/examples/jsm/loaders/LDrawLoader';
import {BaseGeoLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';

export class MPDLoaderHandler extends BaseGeoLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new LDrawLoader(this.loadingManager)));
	}
	protected override _onLoadSuccessGLTF(o: Group): Group[] {
		o.rotation.x = Math.PI;
		o.updateMatrix();
		return [o];
	}
}
