import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {USDZLoaderHandler} from '../../../core/loader/geometry/USDZ';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileUSDZSopOperation extends BaseFileSopOperation<Object3D> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/saeukkang.usdz`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_USDZ> {
		return SopTypeFile.FILE_USDZ;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new USDZLoaderHandler(params.url, this._node);
	}
}
