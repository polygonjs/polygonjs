import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {TDSLoaderHandler} from '../../../core/loader/geometry/TDS';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export interface File3DSSopParams extends BaseFileSopParams {
	resourceUrl: string;
}

export class File3DSSopOperation extends BaseFileSopOperation<Object3D> {
	static override readonly DEFAULT_PARAMS: File3DSSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/3ds/portalgun/portalgun.3ds`),
		resourceUrl: sanitizeUrl(`${ASSETS_ROOT}/models/3ds/portalgun/textures/`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_3DS> {
		return SopTypeFile.FILE_3DS;
	}

	protected _createGeoLoaderHandler(params: File3DSSopParams) {
		const loader = new TDSLoaderHandler(params.url, this._node);
		loader.setResourceUrl(params.resourceUrl);
		return loader;
	}
}
